import type { Color } from "../model/types";
export function Stone({
  x,
  y,
  color,
  last = false,
  ghost = false,
}: {
  x: number;
  y: number;
  color: Color;
  last?: boolean;
  ghost?: boolean;
}) {
  return (
    // Position on the outer group; animate the inner one so its scale origin is the stone centre.
    <g transform={`translate(${x} ${y})`} pointerEvents="none">
      <g className={ghost ? "ghost" : "stone"}>
        <circle
          r="14"
          fill={`url(#${color}-stone)`}
          filter={ghost ? undefined : "url(#stone-shadow)"}
        />
        {last && (
          <circle r="3.2" fill={color === "black" ? "#f2c98b" : "#826442"} />
        )}
      </g>
    </g>
  );
}
