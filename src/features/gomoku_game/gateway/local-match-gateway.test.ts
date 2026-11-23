import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { LocalMatchGateway } from "./local-match-gateway";
import { gameReducer, initialState } from "../model/reducer";
beforeEach(() => vi.useFakeTimers());
afterEach(() => vi.useRealTimers());
function setup(human: "black" | "white" = "black") {
  const gateway = new LocalMatchGateway();
  let state = initialState;
  gateway.subscribe((event) => {
    state = gameReducer(state, event);
  });
  gateway.start({ human, difficulty: "hard" });
  return {
    gateway,
    get state() {
      return state;
    },
  };
}
it("enforces turns and legality and emits computer reply", () => {
  const match = setup();
  match.gateway.requestMove(-1, 0);
  expect(match.state.moves).toHaveLength(0);
  match.gateway.requestMove(7, 7);
  match.gateway.requestMove(8, 7);
  expect(match.state.moves).toHaveLength(1);
  vi.advanceTimersByTime(180);
  expect(match.state.moves).toHaveLength(2);
  match.gateway.requestMove(7, 7);
  expect(match.state.moves).toHaveLength(2);
  match.gateway.dispose();
});
it("undo cancels pending AI and restores the human turn", () => {
  const match = setup();
  match.gateway.requestMove(7, 7);
  match.gateway.requestUndo();
  vi.runAllTimers();
  expect(match.state.moves).toHaveLength(0);
  expect(match.state.turn).toBe("black");
  match.gateway.dispose();
});
it("undo removes a pair and retains the computer opening when human is white", () => {
  const match = setup("white");
  vi.runAllTimers();
  expect(match.state.moves).toHaveLength(1);
  match.gateway.requestUndo();
  expect(match.state.moves).toHaveLength(1);
  match.gateway.requestMove(0, 0);
  vi.runAllTimers();
  expect(match.state.moves).toHaveLength(3);
  match.gateway.requestUndo();
  expect(match.state.moves).toHaveLength(1);
  expect(match.state.turn).toBe("white");
  match.gateway.dispose();
});
it("resign ends the game and cancels future moves", () => {
  const match = setup();
  match.gateway.requestMove(7, 7);
  match.gateway.resign();
  vi.runAllTimers();
  match.gateway.requestMove(1, 1);
  expect(match.state.status).toBe("ended");
  expect(match.state.winner).toBe("white");
  expect(match.state.moves).toHaveLength(1);
  match.gateway.dispose();
});
it("restart and disposal cancel old timers; unsubscribe stops events", () => {
  const match = setup("white");
  match.gateway.start({ human: "black", difficulty: "easy" });
  vi.runAllTimers();
  expect(match.state.moves).toHaveLength(0);
  const listener = vi.fn();
  const off = match.gateway.subscribe(listener);
  off();
  match.gateway.requestMove(7, 7);
  match.gateway.dispose();
  vi.runAllTimers();
  expect(listener).not.toHaveBeenCalled();
  expect(match.state.moves).toHaveLength(1);
});
