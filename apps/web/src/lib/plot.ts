const ALLOWED_TOKENS = new Set([
  "E",
  "cos",
  "cosh",
  "exp",
  "log",
  "pi",
  "sin",
  "sinh",
  "sqrt",
  "tan",
  "tanh",
  "x",
  "y",
]);

const FUNCTION_REPLACEMENTS: Record<string, string> = {
  cos: "Math.cos",
  cosh: "Math.cosh",
  exp: "Math.exp",
  log: "Math.log",
  sin: "Math.sin",
  sinh: "Math.sinh",
  sqrt: "Math.sqrt",
  tan: "Math.tan",
  tanh: "Math.tanh",
};

export interface PlotPoint {
  x: number;
  y: number;
}

export interface PlotData {
  segments: PlotPoint[][];
  yMin: number;
  yMax: number;
}

export function compileRealExpression(expression: string): ((x: number, y: number) => number) | null {
  if (expression.includes("I")) {
    return null;
  }

  const tokens = expression.match(/[A-Za-z_]+/g) ?? [];
  if (tokens.some((token) => !ALLOWED_TOKENS.has(token))) {
    return null;
  }

  if (!/^[0-9A-Za-z_+\-*/().\s]+$/.test(expression)) {
    return null;
  }

  let source = expression;
  for (const [token, replacement] of Object.entries(FUNCTION_REPLACEMENTS)) {
    source = source.replace(new RegExp(`\\b${token}\\b`, "g"), replacement);
  }
  source = source.replace(/\bpi\b/g, "Math.PI").replace(/\bE\b/g, "Math.E");

  try {
    const evaluator = new Function(
      "x",
      "y",
      `"use strict"; return (${source});`,
    ) as (x: number, y: number) => number;
    evaluator(0, 1);
    return evaluator;
  } catch {
    return null;
  }
}

export function samplePlot(
  expression: string,
  xMin = -6,
  xMax = 6,
  samples = 220,
): PlotData | null {
  const evaluator = compileRealExpression(expression);
  if (!evaluator) {
    return null;
  }

  const segments: PlotPoint[][] = [];
  let currentSegment: PlotPoint[] = [];
  const finiteValues: number[] = [];

  for (let index = 0; index < samples; index += 1) {
    const x = xMin + (index / (samples - 1)) * (xMax - xMin);
    const y = evaluator(x, 1);
    if (Number.isFinite(y) && Math.abs(y) < 1e6) {
      const point = { x, y };
      currentSegment.push(point);
      finiteValues.push(y);
    } else if (currentSegment.length > 0) {
      segments.push(currentSegment);
      currentSegment = [];
    }
  }

  if (currentSegment.length > 0) {
    segments.push(currentSegment);
  }

  if (finiteValues.length < 2) {
    return null;
  }

  const sortedValues = [...finiteValues].sort((left, right) => left - right);
  const low = sortedValues[Math.floor(sortedValues.length * 0.05)];
  const high = sortedValues[Math.floor(sortedValues.length * 0.95)];
  const padding = Math.max(0.5, (high - low) * 0.12);

  return {
    segments,
    yMin: low - padding,
    yMax: high + padding,
  };
}
