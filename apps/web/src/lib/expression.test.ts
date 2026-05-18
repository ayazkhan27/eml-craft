import { describe, expect, it } from "vitest";
import { complexityLabel, shortExpression } from "./expression";

describe("expression helpers", () => {
  it("labels seed expressions", () => {
    expect(
      complexityLabel({
        id: "item",
        label: "x",
        latex: "x",
        expression: "x",
        eml_tree: "x",
        depth: 0,
        known: true,
        known_key: "x",
        created_at: "now",
      }),
    ).toBe("seed");
  });

  it("truncates long expressions", () => {
    expect(shortExpression("abcdefghijklmnopqrstuvwxyz", 8)).toBe("abcdefg…");
  });
});
