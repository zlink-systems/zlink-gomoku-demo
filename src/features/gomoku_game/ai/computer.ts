import { isLegalMove, placeStone, winningLine } from "../model/rules";
import {
  BOARD_SIZE,
  opposite,
  type Board,
  type Color,
  type Difficulty,
  type Point,
} from "../model/types";
function candidates(board: Board): Point[] {
  if (board.every((c) => c === null)) return [{ x: 7, y: 7 }];
  const result: Point[] = [];
  for (let y = 0; y < BOARD_SIZE; y++)
    for (let x = 0; x < BOARD_SIZE; x++) {
      if (!isLegalMove(board, x, y)) continue;
      let near = false;
      for (let dy = -2; dy <= 2 && !near; dy++)
        for (let dx = -2; dx <= 2; dx++) {
          const nx = x + dx,
            ny = y + dy;
          if (
            nx >= 0 &&
            ny >= 0 &&
            nx < BOARD_SIZE &&
            ny < BOARD_SIZE &&
            board[ny * BOARD_SIZE + nx]
          ) {
            near = true;
            break;
          }
        }
      if (near) result.push({ x, y });
    }
  return result;
}
/** Evaluate every five-cell window containing this move, including broken threats. */
function score(board: Board, point: Point, color: Color): number {
  const next = placeStone(board, point.x, point.y, color);
  let total = 0;
  const at = (x: number, y: number) =>
    x < 0 || y < 0 || x >= BOARD_SIZE || y >= BOARD_SIZE
      ? "edge"
      : next[y * BOARD_SIZE + x];
  for (const [dx, dy] of [
    [1, 0],
    [0, 1],
    [1, 1],
    [1, -1],
  ]) {
    for (let offset = -4; offset <= 0; offset++) {
      const sx = point.x + dx * offset,
        sy = point.y + dy * offset;
      let count = 0,
        blocked = false;
      for (let i = 0; i < 5; i++) {
        const value = at(sx + dx * i, sy + dy * i);
        if (value === color) count++;
        else if (value !== null) blocked = true;
      }
      if (blocked) continue;
      const open =
        Number(at(sx - dx, sy - dy) === null) +
        Number(at(sx + dx * 5, sy + dy * 5) === null);
      total += [0, 2, 20, 700, 18000, 1000000][count] * (1 + open * 0.7);
    }
  }
  return total;
}
export function chooseMove(
  board: Board,
  color: Color,
  difficulty: Difficulty,
  random: () => number = Math.random,
): Point | null {
  const points = candidates(board);
  if (!points.length) return null;
  const enemy = opposite(color);
  for (const p of points)
    if (winningLine(placeStone(board, p.x, p.y, color), p.x, p.y).length)
      return p;
  if (difficulty !== "easy")
    for (const p of points)
      if (winningLine(placeStone(board, p.x, p.y, enemy), p.x, p.y).length)
        return p;
  const defense =
    difficulty === "hard" ? 1.3 : difficulty === "normal" ? 0.9 : 0.35;
  const ranked = points
    .map((p) => ({
      p,
      value:
        score(board, p, color) +
        score(board, p, enemy) * defense +
        (14 - Math.abs(p.x - 7) - Math.abs(p.y - 7)),
    }))
    .sort((a, b) => b.value - a.value);
  const spread =
    difficulty === "easy"
      ? Math.min(6, ranked.length)
      : difficulty === "normal"
        ? Math.min(2, ranked.length)
        : 1;
  return ranked[Math.min(spread - 1, Math.floor(random() * spread))].p;
}
