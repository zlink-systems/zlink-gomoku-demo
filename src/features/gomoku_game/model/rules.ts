import { BOARD_SIZE, type Board, type Color, type Point } from "./types";
export const emptyBoard = (): Board =>
  Array<Color | null>(BOARD_SIZE * BOARD_SIZE).fill(null);
export const isLegalMove = (board: Board, x: number, y: number): boolean =>
  Number.isInteger(x) &&
  Number.isInteger(y) &&
  x >= 0 &&
  y >= 0 &&
  x < BOARD_SIZE &&
  y < BOARD_SIZE &&
  board[y * BOARD_SIZE + x] === null;
export function placeStone(
  board: Board,
  x: number,
  y: number,
  color: Color,
): Board {
  if (!isLegalMove(board, x, y)) throw new Error("Illegal move");
  const next = [...board];
  next[y * BOARD_SIZE + x] = color;
  return next;
}
export function winningLine(board: Board, x: number, y: number): Point[] {
  const color = board[y * BOARD_SIZE + x];
  if (!color) return [];
  for (const [dx, dy] of [
    [1, 0],
    [0, 1],
    [1, 1],
    [1, -1],
  ]) {
    const line: Point[] = [{ x, y }];
    for (const sign of [-1, 1]) {
      for (let step = 1; step < BOARD_SIZE; step++) {
        const nx = x + dx * step * sign,
          ny = y + dy * step * sign;
        if (
          nx < 0 ||
          ny < 0 ||
          nx >= BOARD_SIZE ||
          ny >= BOARD_SIZE ||
          board[ny * BOARD_SIZE + nx] !== color
        )
          break;
        if (sign === -1) line.unshift({ x: nx, y: ny });
        else line.push({ x: nx, y: ny });
      }
    }
    if (line.length >= 5) return line;
  }
  return [];
}
export const isDraw = (board: Board): boolean =>
  board.every((cell) => cell !== null);
