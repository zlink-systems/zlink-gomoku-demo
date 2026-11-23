import type { GameEvent, MatchOptions } from "../model/types";
import type { MatchGateway } from "./match-gateway";
/** TODO: connect to the ZLink board-tables server template (zlink.systems/start, board genre, Node) using stream-connector;
 * authenticate the player; find/join a match; map sequenced server messages to
 * GameStarted, MoveApplied, TurnChanged, GameEnded. Handle reconnect with snapshot
 * replay, deduplicate event IDs, and send move/undo/resign intents to the server.
 * The server must validate membership, turn, coordinates, and terminal state.
 * Unsubscribe and close the connection on dispose. No view changes required. */
export class OnlineMatchGateway implements MatchGateway {
  subscribe(_listener: (event: GameEvent) => void): () => void {
    throw new Error("not implemented");
  }
  start(_options: MatchOptions): void {
    throw new Error("not implemented");
  }
  requestMove(_x: number, _y: number): void {
    throw new Error("not implemented");
  }
  requestUndo(): void {
    throw new Error("not implemented");
  }
  resign(): void {
    throw new Error("not implemented");
  }
  dispose(): void {
    throw new Error("not implemented");
  }
}
