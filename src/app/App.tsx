import { useEffect, useReducer, useState } from "react";
import { Home } from "../features/home/Home";
import { GameScreen } from "../features/gomoku_game/view/GameScreen";
import { LocalMatchGateway } from "../features/gomoku_game/gateway/local-match-gateway";
import type { MatchGateway } from "../features/gomoku_game/gateway/match-gateway";
import type { MatchOptions } from "../features/gomoku_game/model/types";
import {
  gameReducer,
  initialState,
} from "../features/gomoku_game/model/reducer";
function MatchSession({
  options,
  onHome,
}: {
  options: MatchOptions;
  onHome: () => void;
}) {
  // Composition root: replace this factory with OnlineMatchGateway for online play.
  const [gateway] = useState<MatchGateway>(() => new LocalMatchGateway());
  const [state, dispatch] = useReducer(gameReducer, initialState);
  useEffect(() => {
    const unsubscribe = gateway.subscribe(dispatch);
    gateway.start(options);
    return () => {
      unsubscribe();
      gateway.dispose();
    };
  }, [gateway, options]);
  return (
    <GameScreen
      state={state}
      gateway={gateway}
      onHome={onHome}
      onRestart={() => gateway.start(options)}
    />
  );
}
export function App() {
  const [options, setOptions] = useState<MatchOptions | null>(null);
  return (
    <div className="app-shell">
      <header className="site-header">
        <div className="brand">
          <span className="brand-mark">
            <i />
            <i />
            <i />
            <i />
          </span>
          오목
          <span className="brand-divider" />
          <span className="brand-sub">한 수의 여유</span>
        </div>
        <span className="demo-label">
          ZLink <span>PLAYGROUND</span>
        </span>
      </header>
      {options ? (
        <MatchSession options={options} onHome={() => setOptions(null)} />
      ) : (
        <Home onStart={setOptions} />
      )}
      <footer>
        <span>오롯이 집중하는, 나만의 한 판.</span>
        <span>
          Built with <strong>ZLink</strong>
        </span>
      </footer>
    </div>
  );
}
