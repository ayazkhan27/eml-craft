import { describe, expect, it } from "vitest";
import type { Item } from "./index";

describe("shared item shape", () => {
  it("supports known expression metadata", () => {
    const item: Item = {
      id: "item_1",
      label: "exp(x)",
      expression: "exp(x)",
      eml_tree: "eml(x, 1)",
      depth: 1,
      known: true,
      known_key: "exp_x",
      created_at: "2026-01-01 00:00:00",
    };

    expect(item.known_key).toBe("exp_x");
  });
});

