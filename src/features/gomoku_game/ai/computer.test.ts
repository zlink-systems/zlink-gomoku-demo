import { expect, it } from "vitest";
import { chooseMove } from "./computer";
import { emptyBoard, placeStone, winningLine } from "../model/rules";
it("takes an immediate win before defending", () => {
  let board = emptyBoard();
  for (let x = 0; x < 4; x++) {
    board = placeStone(board, x, 0, "white");
    board = placeStone(board, x, 3, "black");
  }
  const p = chooseMove(board, "white", "hard")!;
  expect(p).toEqual({ x: 4, y: 0 });
});
it.each([
  [1, 0],
  [0, 1],
  [1, 1],
  [1, -1],
])("blocks opponent four in direction %i,%i", (dx, dy) => {
  let board = emptyBoard();
  const x = 4,
    y = dy < 0 ? 9 : 4;
  board = placeStone(board, x - dx, y - dy, "white");
  for (let i = 0; i < 4; i++)
    board = placeStone(board, x + i * dx, y + i * dy, "black");
  expect(chooseMove(board, "white", "hard")).toEqual({
    x: x + 4 * dx,
    y: y + 4 * dy,
  });
});
it("blocks an open three before it becomes an open four", () => {
  let board = emptyBoard();
  for (let x = 6; x <= 8; x++) board = placeStone(board, x, 7, "black");
  const p = chooseMove(board, "white", "hard")!;
  expect(p.y).toBe(7);
  expect([5, 9]).toContain(p.x);
});
it("blocks a broken four", () => {
  let board = emptyBoard();
  for (const x of [4, 5, 7, 8]) board = placeStone(board, x, 7, "black");
  expect(chooseMove(board, "white", "hard")).toEqual({ x: 6, y: 7 });
});
it("returns a legal opening, handles full boards, and stays within 300ms", () => {
  expect(chooseMove(emptyBoard(), "black", "hard")).toEqual({ x: 7, y: 7 });
  expect(chooseMove(Array(225).fill("black"), "white", "hard")).toBe(null);
  let board = emptyBoard();
  for (let i = 0; i < 60; i++)
    board = placeStone(
      board,
      (i * 7) % 15,
      Math.floor(i / 15) * 3 + (i % 3),
      i % 2 ? "black" : "white",
    );
  const start = performance.now();
  const p = chooseMove(board, "white", "hard");
  expect(performance.now() - start).toBeLessThan(300);
  if (p) expect(board[p.y * 15 + p.x]).toBe(null);
});
it("recognizes overline wins", () => {
  let board = emptyBoard();
  for (const x of [2, 3, 4, 6, 7]) board = placeStone(board, x, 7, "white");
  const p = chooseMove(board, "white", "hard")!;
  expect(
    winningLine(placeStone(board, p.x, p.y, "white"), p.x, p.y).length,
  ).toBeGreaterThanOrEqual(5);
});
