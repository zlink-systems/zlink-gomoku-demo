import { useState, type KeyboardEvent } from "react";
import { BOARD_SIZE, type GameState, type Point } from "../model/types";
import { Stone } from "./Stone";
const pos = (n: number) => 36 + n * 32;
export function Board({
  state,
  preview = false,
  onMove,
}: {
  state: GameState;
  preview?: boolean;
  onMove?: (x: number, y: number) => void;
}) {
  const [hover, setHover] = useState<Point | null>(null);
  const [cursor, setCursor] = useState<Point>({ x: 7, y: 7 });
  const active =
    !preview &&
    state.status === "playing" &&
    state.turn === state.options.human;
  const last = state.moves.at(-1);
  const play = (p: Point) => {
    if (active) onMove?.(p.x, p.y);
  };
  function key(event: KeyboardEvent<SVGSVGElement>) {
    const directions: Record<string, Point> = {
      ArrowLeft: { x: -1, y: 0 },
      ArrowRight: { x: 1, y: 0 },
      ArrowUp: { x: 0, y: -1 },
      ArrowDown: { x: 0, y: 1 },
    };
    if (directions[event.key]) {
      event.preventDefault();
      const d = directions[event.key];
      const p = {
        x: Math.max(0, Math.min(14, cursor.x + d.x)),
        y: Math.max(0, Math.min(14, cursor.y + d.y)),
      };
      setCursor(p);
      setHover(p);
    }
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      play(cursor);
    }
  }
  return (
    <svg
      className={`board ${preview ? "board-preview" : ""}`}
      viewBox="0 0 520 520"
      role="group"
      aria-label={
        preview
          ? "오목 바둑판"
          : `오목 바둑판, ${state.moves.length}수. 방향키로 이동하고 Enter로 착수`
      }
      tabIndex={preview ? undefined : 0}
      onKeyDown={key}
      onFocus={() => setHover(cursor)}
      onBlur={() => setHover(null)}
      onPointerLeave={() => setHover(null)}
    >
      <defs>
        <linearGradient id="wood" x2="0.9" y2="1">
          <stop stopColor="#e9c58d" />
          <stop offset=".5" stopColor="#d9ad70" />
          <stop offset="1" stopColor="#d1a36a" />
        </linearGradient>
        <pattern
          id="grain"
          width="130"
          height="9"
          patternUnits="userSpaceOnUse"
        >
          <path
            d="M0 2 Q35 -1 80 3 T160 2 M0 7 Q60 4 130 8"
            fill="none"
            stroke="#805122"
            strokeOpacity=".075"
            strokeWidth=".7"
          />
        </pattern>
        <radialGradient id="black-stone" cx=".32" cy=".24" r=".8">
          <stop stopColor="#535958" />
          <stop offset=".45" stopColor="#252d2d" />
          <stop offset="1" stopColor="#0c1112" />
        </radialGradient>
        <radialGradient id="white-stone" cx=".32" cy=".24" r=".8">
          <stop stopColor="#fffef8" />
          <stop offset=".65" stopColor="#f3eee2" />
          <stop offset="1" stopColor="#c5c1b6" />
        </radialGradient>
        <filter id="stone-shadow" x="-40%" y="-40%" width="190%" height="190%">
          <feDropShadow dx="1" dy="2" stdDeviation="1.6" floodOpacity=".35" />
        </filter>
      </defs>
      <rect width="520" height="520" rx="9" fill="url(#wood)" />
      <rect
        x="3"
        y="3"
        width="514"
        height="514"
        rx="7"
        fill="url(#grain)"
        stroke="#f5d7a5"
        strokeOpacity=".55"
      />
      {Array.from({ length: BOARD_SIZE }, (_, n) => (
        <g key={n}>
          <path
            d={`M${pos(n)} 36V484 M36 ${pos(n)}H484`}
            stroke="#725434"
            strokeWidth={n === 0 || n === 14 ? 1.25 : 0.7}
            opacity=".8"
          />
          <text x={pos(n)} y="21" textAnchor="middle" className="coordinate">
            {String.fromCharCode(65 + n)}
          </text>
          <text
            x="17"
            y={pos(n) + 4}
            textAnchor="middle"
            className="coordinate"
          >
            {15 - n}
          </text>
        </g>
      ))}
      {[3, 7, 11].flatMap((y) =>
        [3, 7, 11].map((x) => (
          <circle
            key={`${x}-${y}`}
            cx={pos(x)}
            cy={pos(y)}
            r="2.6"
            fill="#725434"
          />
        )),
      )}
      {state.board.map(
        (color, i) =>
          color && (
            <Stone
              key={i}
              x={pos(i % 15)}
              y={pos(Math.floor(i / 15))}
              color={color}
              last={last?.x === i % 15 && last?.y === Math.floor(i / 15)}
            />
          ),
      )}
      {state.line.length > 0 && (
        <line
          className="winning-line"
          x1={pos(state.line[0].x)}
          y1={pos(state.line[0].y)}
          x2={pos(state.line.at(-1)!.x)}
          y2={pos(state.line.at(-1)!.y)}
        />
      )}
      {active && hover && state.board[hover.y * 15 + hover.x] === null && (
        <Stone
          x={pos(hover.x)}
          y={pos(hover.y)}
          color={state.options.human}
          ghost
        />
      )}
      {!preview &&
        state.board.map((cell, i) => (
          <rect
            key={i}
            x={pos(i % 15) - 16}
            y={pos(Math.floor(i / 15)) - 16}
            width="32"
            height="32"
            fill="transparent"
            className={
              active && cell === null ? "intersection active" : "intersection"
            }
            onPointerEnter={() =>
              setHover({ x: i % 15, y: Math.floor(i / 15) })
            }
            onClick={() => play({ x: i % 15, y: Math.floor(i / 15) })}
          />
        ))}
    </svg>
  );
}
