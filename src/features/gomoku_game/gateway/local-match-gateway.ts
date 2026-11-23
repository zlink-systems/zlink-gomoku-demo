import { chooseMove } from "../ai/computer";
import { gameReducer, initialState } from "../model/reducer";
import { isDraw, isLegalMove, winningLine } from "../model/rules";
import {
  opposite,
  type GameEvent,
  type MatchOptions,
  type Move,
} from "../model/types";
import type { MatchGateway } from "./match-gateway";
export class LocalMatchGateway implements MatchGateway {
  private state = initialState;
  private listeners = new Set<(event: GameEvent) => void>();
  private timer: ReturnType<typeof setTimeout> | undefined;
  subscribe(listener: (event: GameEvent) => void) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }
  private emit(event: GameEvent) {
    this.state = gameReducer(this.state, event);
    this.listeners.forEach((listener) => listener(event));
  }
  private cancel() {
    clearTimeout(this.timer);
    this.timer = undefined;
  }
  start(options: MatchOptions) {
    this.cancel();
    this.emit({ type: "GameStarted", options });
    this.emit({ type: "TurnChanged", turn: "black" });
    this.schedule();
  }
  requestMove(x: number, y: number) {
    if (this.state.turn !== this.state.options.human) return;
    this.apply(x, y);
  }
  private apply(x: number, y: number) {
    if (this.state.status !== "playing" || !isLegalMove(this.state.board, x, y))
      return;
    const color = this.state.turn;
    this.emit({ type: "MoveApplied", move: { x, y, color } });
    const line = winningLine(this.state.board, x, y);
    if (line.length || isDraw(this.state.board)) {
      this.emit({
        type: "GameEnded",
        winner: line.length ? color : null,
        line,
        reason: line.length ? "five" : "draw",
      });
      return;
    }
    this.emit({ type: "TurnChanged", turn: opposite(color) });
    this.schedule();
  }
  private schedule() {
    if (
      this.state.status !== "playing" ||
      this.state.turn === this.state.options.human
    )
      return;
    this.cancel();
    this.timer = setTimeout(() => {
      this.timer = undefined;
      const p = chooseMove(
        this.state.board,
        this.state.turn,
        this.state.options.difficulty,
      );
      if (p) this.apply(p.x, p.y);
    }, 180);
  }
  requestUndo() {
    if (this.state.status !== "playing") return;
    const lastHuman = this.state.moves.findLastIndex(
      (m) => m.color === this.state.options.human,
    );
    if (lastHuman < 0) return;
    const retained: Move[] = this.state.moves.slice(0, lastHuman);
    const options = this.state.options;
    this.cancel();
    this.emit({ type: "GameStarted", options });
    retained.forEach((move) => this.emit({ type: "MoveApplied", move }));
    this.emit({ type: "TurnChanged", turn: options.human });
  }
  resign() {
    if (this.state.status === "playing") {
      this.cancel();
      this.emit({
        type: "GameEnded",
        winner: opposite(this.state.options.human),
        line: [],
        reason: "resign",
      });
    }
  }
  dispose() {
    this.cancel();
    this.listeners.clear();
  }
}
