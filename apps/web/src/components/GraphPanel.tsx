import type { Item } from "@eml-craft/shared";
import { Activity, Maximize2, Minimize2 } from "lucide-react";
import { useMemo, useState } from "react";
import { samplePlot } from "../lib/plot";

interface GraphPanelProps {
  item: Item | null;
}

const WIDTH = 320;
const HEIGHT = 188;
const PADDING = 16;
const X_MIN = -6;
const X_MAX = 6;

function mapPoint(x: number, y: number, yMin: number, yMax: number) {
  const px = PADDING + ((x - X_MIN) / (X_MAX - X_MIN)) * (WIDTH - PADDING * 2);
  const py = HEIGHT - PADDING - ((y - yMin) / (yMax - yMin)) * (HEIGHT - PADDING * 2);
  return { px, py };
}

function segmentPath(
  segment: Array<{ x: number; y: number }>,
  yMin: number,
  yMax: number,
) {
  return segment
    .map((point, index) => {
      const { px, py } = mapPoint(point.x, point.y, yMin, yMax);
      return `${index === 0 ? "M" : "L"}${px.toFixed(2)} ${py.toFixed(2)}`;
    })
    .join(" ");
}

export function GraphPanel({ item }: GraphPanelProps) {
  const [expanded, setExpanded] = useState(false);
  const plot = useMemo(() => (item ? samplePlot(item.expression) : null), [item]);

  const zeroX = mapPoint(0, 0, -1, 1).px;
  const zeroY = plot ? mapPoint(0, 0, plot.yMin, plot.yMax).py : HEIGHT / 2;
  const canShowXAxis = plot && plot.yMin <= 0 && plot.yMax >= 0;

  return (
    <section className={`rail-panel graph-panel ${expanded ? "is-expanded" : ""}`}>
      <div className="panel-heading">
        <span>Graph</span>
        <button
          className="icon-button"
          type="button"
          onClick={() => setExpanded((current) => !current)}
          title={expanded ? "Collapse graph" : "Expand graph"}
        >
          {expanded ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
        </button>
      </div>

      {item && plot ? (
        <svg className="graph-svg" viewBox={`0 0 ${WIDTH} ${HEIGHT}`} role="img">
          <rect x="0" y="0" width={WIDTH} height={HEIGHT} rx="8" />
          {[0.25, 0.5, 0.75].map((position) => (
            <line
              key={`grid-y-${position}`}
              className="graph-grid"
              x1={PADDING}
              x2={WIDTH - PADDING}
              y1={PADDING + position * (HEIGHT - PADDING * 2)}
              y2={PADDING + position * (HEIGHT - PADDING * 2)}
            />
          ))}
          <line className="graph-axis" x1={zeroX} x2={zeroX} y1={PADDING} y2={HEIGHT - PADDING} />
          {canShowXAxis ? (
            <line
              className="graph-axis"
              x1={PADDING}
              x2={WIDTH - PADDING}
              y1={zeroY}
              y2={zeroY}
            />
          ) : null}
          {plot.segments.map((segment, index) => (
            <path
              key={`${item.id}-${index}`}
              className="graph-line"
              d={segmentPath(segment, plot.yMin, plot.yMax)}
            />
          ))}
        </svg>
      ) : (
        <div className="graph-empty">
          <Activity size={18} />
          <span>{item ? "No real x-plot for this expression" : "Select an expression"}</span>
        </div>
      )}
    </section>
  );
}
