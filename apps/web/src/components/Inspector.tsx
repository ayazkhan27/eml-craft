import type { Item } from "@eml-craft/shared";
import { Braces, FunctionSquare, Network } from "lucide-react";
import { complexityLabel, shortExpression } from "../lib/expression";

interface InspectorProps {
  item: Item | null;
}

export function Inspector({ item }: InspectorProps) {
  if (!item) {
    return (
      <section className="rail-panel inspector empty">
        <div className="panel-heading">
          <span>Inspector</span>
        </div>
        <p>No expression selected.</p>
      </section>
    );
  }

  return (
    <section className="rail-panel inspector">
      <div className="panel-heading">
        <span>Inspector</span>
        <strong>{complexityLabel(item)}</strong>
      </div>
      <div className="inspector-title">
        <FunctionSquare size={18} />
        <h2>{item.label}</h2>
      </div>
      <dl>
        <div>
          <dt>
            <Braces size={14} />
            Expression
          </dt>
          <dd>{shortExpression(item.expression)}</dd>
        </div>
        <div>
          <dt>
            <Network size={14} />
            EML tree
          </dt>
          <dd>{shortExpression(item.eml_tree, 120)}</dd>
        </div>
      </dl>
    </section>
  );
}

