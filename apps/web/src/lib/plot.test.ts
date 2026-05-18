import { describe, expect, it } from "vitest";
import { compileRealExpression, samplePlot } from "./plot";

describe("plot helpers", () => {
  it("compiles backend-generated real expressions", () => {
    const evaluator = compileRealExpression("exp(x) - log(y)");

    expect(evaluator?.(0, 1)).toBeCloseTo(1);
  });

  it("rejects complex expressions for the real plot preview", () => {
    expect(compileRealExpression("I + x")).toBeNull();
  });

  it("samples finite segments for trigonometric expressions", () => {
    const plot = samplePlot("sin(x)");

    expect(plot?.segments.length).toBeGreaterThan(0);
    expect(plot?.yMin).toBeLessThan(0);
    expect(plot?.yMax).toBeGreaterThan(0);
  });
});
