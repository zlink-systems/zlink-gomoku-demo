import { useState } from "react";
import { Button } from "../../shared/Button";
import type {
  Color,
  Difficulty,
  MatchOptions,
} from "../gomoku_game/model/types";
import { initialState } from "../gomoku_game/model/reducer";
import { Board } from "../gomoku_game/view/Board";
const previewMoves = [
  { x: 7, y: 7, color: "black" as const },
  { x: 8, y: 7, color: "white" as const },
  { x: 6, y: 8, color: "black" as const },
  { x: 8, y: 6, color: "white" as const },
  { x: 5, y: 9, color: "black" as const },
  { x: 8, y: 8, color: "white" as const },
  { x: 6, y: 7, color: "black" as const },
  { x: 7, y: 8, color: "white" as const },
  { x: 6, y: 6, color: "black" as const },
];
const previewBoard = [...initialState.board];
previewMoves.forEach((m) => {
  previewBoard[m.y * 15 + m.x] = m.color;
});
export function Home({
  onStart,
}: {
  onStart: (options: MatchOptions) => void;
}) {
  const [difficulty, setDifficulty] = useState<Difficulty>("normal");
  const [human, setHuman] = useState<Color>("black");
  return (
    <main className="home">
      <section className="home-copy">
        <span className="eyebrow">잠시 멈추고, 한 수</span>
        <h1>
          생각을 놓다.
          <br />
          <span>오목을 두다.</span>
        </h1>
        <p className="intro">
          작은 바둑판 위, 다섯 개의 돌을 잇는 시간.
          <br />
          나만의 속도로 컴퓨터와 한 판 즐겨보세요.
        </p>
        <div className="setup">
          <fieldset>
            <legend>난이도</legend>
            <div className="segments">
              {(
                [
                  ["easy", "쉬움"],
                  ["normal", "보통"],
                  ["hard", "어려움"],
                ] as const
              ).map(([value, label]) => (
                <button
                  key={value}
                  aria-pressed={difficulty === value}
                  onClick={() => setDifficulty(value)}
                >
                  {label}
                </button>
              ))}
            </div>
            <p className="field-help">
              {difficulty === "easy"
                ? "가볍게 시작하는 여유로운 대국"
                : difficulty === "normal"
                  ? "공격과 수비가 균형 잡힌 대국"
                  : "빈틈을 놓치지 않는 도전적인 대국"}
            </p>
          </fieldset>
          <fieldset>
            <legend>내 돌</legend>
            <div className="color-choices">
              {(["black", "white"] as const).map((color) => (
                <button
                  key={color}
                  aria-pressed={human === color}
                  onClick={() => setHuman(color)}
                >
                  <span className={`stone-swatch ${color}`} />
                  <span>
                    {color === "black" ? "흑돌" : "백돌"}
                    <small>
                      {color === "black" ? "먼저 두기" : "나중에 두기"}
                    </small>
                  </span>
                  <span className="choice-check">
                    {human === color ? "✓" : ""}
                  </span>
                </button>
              ))}
            </div>
          </fieldset>
          <Button
            className="primary start"
            onClick={() => onStart({ human, difficulty })}
          >
            컴퓨터와 대국
          </Button>
          <Button className="online" disabled>
            온라인 대전 <span className="badge">준비 중</span>
          </Button>
        </div>
      </section>
      <section className="home-visual" aria-label="오목 미리보기">
        <div className="board-caption">
          <span className="tiny-stones">● ○</span> 단순한 규칙, 깊어지는 생각
        </div>
        <Board
          state={{ ...initialState, board: previewBoard, moves: previewMoves }}
          preview
        />
        <div className="visual-note">
          <span>15 × 15</span>
          <span>다섯 개를 이으면, 승리.</span>
        </div>
      </section>
    </main>
  );
}
