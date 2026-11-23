export const BOARD_SIZE = 15;
export type Color = "black" | "white";
export type Board = readonly (Color | null)[];
export interface Point {
  x: number;
  y: number;
}
export interface Move extends Point {
  color: Color;
}
export type Difficulty = "easy" | "normal" | "hard";
export interface MatchOptions {
  human: Color;
  difficulty: Difficulty;
}
export type GameEvent =
  | { type: "GameStarted"; options: MatchOptions }
  | { type: "MoveApplied"; move: Move }
  | { type: "TurnChanged"; turn: Color }
  | {
      type: "GameEnded";
      winner: Color | null;
      line: Point[];
      reason: "five" | "draw" | "resign";
    };
export interface GameState {
  board: Board;
  moves: Move[];
  turn: Color;
  status: "idle" | "playing" | "ended";
  winner: Color | null;
  line: Point[];
  options: MatchOptions;
  reason: "five" | "draw" | "resign" | null;
}
export const opposite = (color: Color): Color =>
  color === "black" ? "white" : "black";
