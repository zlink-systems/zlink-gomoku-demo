import { emptyBoard } from "./rules";
import { BOARD_SIZE, type GameEvent, type GameState } from "./types";
export const initialState: GameState = {
  board: emptyBoard(),
  moves: [],
  turn: "black",
  status: "idle",
  winner: null,
  line: [],
  options: { human: "black", difficulty: "normal" },
  reason: null,
};
/** State is a projection of authoritative events; it never decides turns or results. */
export function gameReducer(state: GameState, event: GameEvent): GameState {
  switch (event.type) {
    case "GameStarted":
      return {
        ...initialState,
        board: emptyBoard(),
        moves: [],
        options: event.options,
        status: "playing",
      };
    case "MoveApplied": {
      const board = [...state.board];
      board[event.move.y * BOARD_SIZE + event.move.x] = event.move.color;
      return { ...state, board, moves: [...state.moves, event.move] };
    }
    case "TurnChanged":
      return { ...state, turn: event.turn };
    case "GameEnded":
      return {
        ...state,
        status: "ended",
        winner: event.winner,
        line: event.line,
        reason: event.reason,
      };
  }
}
