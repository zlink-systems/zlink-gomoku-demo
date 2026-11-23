import { describe, expect, it } from "vitest";
import {
  emptyBoard,
  isDraw,
  isLegalMove,
  placeStone,
  winningLine,
} from "./rules";
import type { Board } from "./types";
describe("freestyle Gomoku rules", () => {
  it.each([
    [0, 0, 1, 0],
    [14, 0, 0, 1],
    [0, 0, 1, 1],
    [0, 14, 1, -1],
    [10, 14, 1, 0],
  ])("detects a line from %i,%i with direction %i,%i", (x, y, dx, dy) => {
    let board = emptyBoard();
    for (let i = 0; i < 5; i++)
      board = placeStone(board, x + i * dx, y + i * dy, "black");
    expect(winningLine(board, x + 2 * dx, y + 2 * dy)).toHaveLength(5);
  });
  it("counts six in a row and does not mutate input", () => {
    const original = emptyBoard();
    let board = original;
    for (let x = 0; x < 6; x++) board = placeStone(board, x, 7, "white");
    expect(winningLine(board, 3, 7)).toHaveLength(6);
    expect(original.every((c) => c === null)).toBe(true);
  });
  it("rejects occupied, out of range, fractional, and nonfinite moves", () => {
    const board = placeStone(emptyBoard(), 7, 7, "black");
    for (const [x, y] of [
      [7, 7],
      [-1, 0],
      [15, 0],
      [0, 15],
      [0.5, 2],
      [NaN, 0],
      [0, Infinity],
    ]) {
      expect(isLegalMove(board, x, y)).toBe(false);
      expect(() => placeStone(board, x, y, "white")).toThrow("Illegal move");
    }
  });
  it("does not wrap across rows or win with four", () => {
    let board = emptyBoard();
    for (const x of [0, 1, 2, 3]) board = placeStone(board, x, 1, "black");
    board = placeStone(board, 14, 0, "black");
    expect(winningLine(board, 0, 1)).toEqual([]);
  });
  it("detects a full board with no winning lines", () => {
    const board: Board = Array.from({ length: 225 }, (_, i) =>
      ((i % 15) + 2 * Math.floor(i / 15)) % 4 < 2 ? "black" : "white",
    );
    expect(isDraw(board)).toBe(true);
    board.forEach((_, i) =>
      expect(winningLine(board, i % 15, Math.floor(i / 15))).toHaveLength(0),
    );
    expect(isDraw(emptyBoard())).toBe(false);
  });
});
