import type { Item } from "@eml-craft/shared";

export function complexityLabel(item: Item): string {
  if (item.depth === 0) {
    return "seed";
  }
  if (item.depth === 1) {
    return "depth 1";
  }
  return `depth ${item.depth}`;
}

export function expressionTone(item: Item): "known" | "unknown" {
  return item.known ? "known" : "unknown";
}

export function shortExpression(expression: string, limit = 72): string {
  if (expression.length <= limit) {
    return expression;
  }
  return `${expression.slice(0, limit - 1)}…`;
}

