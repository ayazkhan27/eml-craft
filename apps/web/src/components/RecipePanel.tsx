import type { Item, Recipe } from "@eml-craft/shared";
import { History } from "lucide-react";
import { MathLabel } from "./MathLabel";

interface RecipePanelProps {
  recipes: Recipe[];
  itemsById: Map<string, Item>;
}

export function RecipePanel({ recipes, itemsById }: RecipePanelProps) {
  const recent = recipes.slice(-12).reverse();

  return (
    <section className="rail-panel recipes-panel">
      <div className="panel-heading">
        <span>Recent recipes</span>
        <strong>{recipes.length}</strong>
      </div>
      {recent.length === 0 ? (
        <p className="muted-copy">Merge tiles to build the recipe trail.</p>
      ) : (
        <div className="recipe-list">
          {recent.map((recipe) => {
            const left = itemsById.get(recipe.left_id);
            const right = itemsById.get(recipe.right_id);
            const result = itemsById.get(recipe.result_id);
            if (!left || !right || !result) return null;
            return (
              <div className="recipe-row" key={recipe.id}>
                <History size={14} />
                <span>
                  <MathLabel latex={left.latex} label={left.label} />
                </span>
                <span className="recipe-op">+</span>
                <span>
                  <MathLabel latex={right.latex} label={right.label} />
                </span>
                <span className="recipe-op">=</span>
                <strong>
                  <MathLabel latex={result.latex} label={result.label} />
                </strong>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

