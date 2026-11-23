import { expect, it } from "vitest";
import { gameReducer, initialState } from "./reducer";
it("projects only supplied events, resets on GameStarted, and preserves old state", () => {
  const started = gameReducer(initialState, {
    type: "GameStarted",
    options: { human: "white", difficulty: "hard" },
  });
  const moved = gameReducer(started, {
    type: "MoveApplied",
    move: { x: 7, y: 7, color: "black" },
  });
  expect(moved.board[112]).toBe("black");
  expect(started.board[112]).toBe(null);
  expect(moved.turn).toBe("black");
  expect(moved.moves).toHaveLength(1);
  const turned = gameReducer(moved, { type: "TurnChanged", turn: "white" });
  expect(turned.turn).toBe("white");
  const ended = gameReducer(turned, {
    type: "GameEnded",
    winner: "black",
    line: [{ x: 7, y: 7 }],
    reason: "five",
  });
  expect(ended.status).toBe("ended");
  expect(ended.winner).toBe("black");
  expect(ended.line).toEqual([{ x: 7, y: 7 }]);
  const reset = gameReducer(ended, {
    type: "GameStarted",
    options: { human: "black", difficulty: "easy" },
  });
  expect(reset.moves).toEqual([]);
  expect(reset.winner).toBe(null);
  expect(reset.status).toBe("playing");
});
