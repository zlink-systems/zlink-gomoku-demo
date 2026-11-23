import type { GameEvent, MatchOptions } from "../model/types";
/** The view sends intents and consumes authoritative events only. A future online
 * gateway using a ZLink stream-connector implements this exact interface and maps
 * server messages to the same events. Subscribe before start; dispose on unmount.
 * Undo resynchronizes via GameStarted + replayed moves + TurnChanged. */
export interface MatchGateway {
  subscribe(listener: (event: GameEvent) => void): () => void;
  start(options: MatchOptions): void;
  requestMove(x: number, y: number): void;
  requestUndo(): void;
  resign(): void;
  dispose(): void;
}
