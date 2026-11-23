import { useState } from "react";
import type { MatchGateway } from "../gateway/match-gateway";
import type { GameState } from "../model/types";
import { Board } from "./Board";
import { Button } from "../../../shared/Button";
import { Dialog } from "../../../shared/Dialog";
const difficulties = { easy: "쉬움", normal: "보통", hard: "어려움" };
export function GameScreen({
  state,
  gateway,
  onHome,
  onRestart,
}: {
  state: GameState;
  gateway: MatchGateway;
  onHome: () => void;
  onRestart: () => void;
}) {
  const [confirm, setConfirm] = useState<"home" | "resign" | null>(null);
  const [showResult, setShowResult] = useState(true);
  const thinking = state.turn !== state.options.human;
  const ended = state.status === "ended";
  const result =
    state.winner === null
      ? "무승부"
      : state.winner === state.options.human
        ? "승리"
        : "패배";
  const restart = () => {
    setShowResult(true);
    onRestart();
  };
  return (
    <main className="game">
      <div className="game-top">
        <button
          className="text-button"
          onClick={() => (ended ? onHome() : setConfirm("home"))}
        >
          홈으로
        </button>
        <span>
          컴퓨터와 대국{" "}
          <span className="badge">
            {difficulties[state.options.difficulty]}
          </span>
        </span>
        <span className="move-count">{state.moves.length}수</span>
      </div>
      <div className="game-layout">
        <div className="board-wrap">
          <Board state={state} onMove={(x, y) => gateway.requestMove(x, y)} />
          <p className="board-hint">
            흑돌이 먼저 시작합니다 · 다섯 개 이상을 이으면 승리
          </p>
        </div>
        <aside className="game-sidebar">
          <div className="section-label">오늘의 대국</div>
          <h1>
            한 수씩,
            <br />
            차분하게.
          </h1>
          <div className="players">
            {(["black", "white"] as const).map((color) => (
              <div
                className={`player ${!ended && state.turn === color ? "current" : ""}`}
                key={color}
              >
                <span className={`stone-swatch ${color}`} />
                <div>
                  <strong>
                    {color === state.options.human ? "나" : "컴퓨터"}
                  </strong>
                  <small>
                    {color === "black" ? "흑돌 · 선공" : "백돌 · 후공"}
                  </small>
                </div>
                {!ended && state.turn === color && (
                  <span className="turn-pill">차례</span>
                )}
              </div>
            ))}
          </div>
          <div className="turn-status" role="status" aria-live="polite">
            <span
              className={thinking && !ended ? "thinking-dot" : "status-dot"}
            />
            {ended
              ? `대국 종료 · ${result}`
              : thinking
                ? "컴퓨터가 생각하고 있어요"
                : "당신의 차례입니다"}
            <small>
              {ended
                ? "좋은 대국이었습니다."
                : thinking
                  ? "다음 수를 고르는 중입니다."
                  : "원하는 자리에 돌을 놓아주세요."}
            </small>
          </div>
          <div className="game-actions">
            <Button
              onClick={() => gateway.requestUndo()}
              disabled={
                ended ||
                !state.moves.some((m) => m.color === state.options.human)
              }
            >
              ↶ 한 수 무르기
            </Button>
            {ended ? (
              <Button className="primary" onClick={restart}>
                다시 하기
              </Button>
            ) : (
              <button
                className="text-button resign"
                onClick={() => setConfirm("resign")}
              >
                기권하기
              </button>
            )}
          </div>
          <p className="rule-note">
            금수 없는 자유 오목입니다.
            <br />
            장목도 승리로 인정합니다.
          </p>
        </aside>
      </div>
      {ended && showResult && (
        <Dialog onClose={() => setShowResult(false)}>
          <div className="result-symbol">{result === "승리" ? "✦" : "○"}</div>
          <p className="eyebrow">대국 종료</p>
          <h2 id="dialog-title">{result}</h2>
          <p>
            {state.reason === "resign"
              ? "기권으로 대국을 마쳤습니다."
              : result === "승리"
                ? "멋진 한 수, 다섯 개의 돌을 이었습니다."
                : result === "무승부"
                  ? "바둑판을 가득 채운 팽팽한 대국이었습니다."
                  : "다음 대국에서 새로운 수를 찾아보세요."}
          </p>
          <Button className="primary" onClick={restart}>
            다시 하기
          </Button>
          <Button onClick={onHome}>홈으로</Button>
          <button className="text-button" onClick={() => setShowResult(false)}>
            바둑판 보기
          </button>
        </Dialog>
      )}
      {confirm && (
        <Dialog onClose={() => setConfirm(null)}>
          <h2 id="dialog-title">
            {confirm === "home" ? "대국을 나갈까요?" : "기권하시겠어요?"}
          </h2>
          <p>
            {confirm === "home"
              ? "진행 중인 대국은 저장되지 않습니다."
              : "컴퓨터의 승리로 대국을 마칩니다."}
          </p>
          <Button
            className="primary"
            onClick={() => {
              if (confirm === "home") onHome();
              else gateway.resign();
              setConfirm(null);
            }}
          >
            {confirm === "home" ? "홈으로" : "기권하기"}
          </Button>
          <Button onClick={() => setConfirm(null)}>계속 두기</Button>
        </Dialog>
      )}
    </main>
  );
}
