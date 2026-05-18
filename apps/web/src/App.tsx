import type { Goal, Item, Recipe } from "@eml-craft/shared";
import { Atom, Eraser, FlaskConical, GitBranch, Loader2, Plus, RotateCcw, Sparkles } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { craft, loadState, resetGame } from "./lib/api";
import { Canvas, type CanvasNode } from "./components/Canvas";
import { GraphPanel } from "./components/GraphPanel";
import { GoalsPanel } from "./components/GoalsPanel";
import { Inspector } from "./components/Inspector";
import { MathLabel } from "./components/MathLabel";
import { RecipePanel } from "./components/RecipePanel";
import { Sidebar } from "./components/Sidebar";
import { playSound } from "./lib/sound";

interface Selection {
  leftNodeId?: string;
  rightNodeId?: string;
}

function makeNode(itemId: string, x: number, y: number): CanvasNode {
  return {
    id: `node_${itemId}_${Date.now()}_${Math.random().toString(16).slice(2)}`,
    itemId,
    x,
    y,
  };
}

function upsertItem(items: Item[], next: Item): Item[] {
  if (items.some((item) => item.id === next.id)) {
    return items.map((item) => (item.id === next.id ? next : item));
  }
  return [...items, next];
}

function upsertRecipe(recipes: Recipe[], next: Recipe): Recipe[] {
  if (recipes.some((recipe) => recipe.id === next.id)) {
    return recipes.map((recipe) => (recipe.id === next.id ? next : recipe));
  }
  return [...recipes, next];
}

function starterNodes(items: Item[]): CanvasNode[] {
  const one = items.find((item) => item.label === "1");
  const x = items.find((item) => item.label === "x");
  const y = items.find((item) => item.label === "y");
  return [
    ...(one ? [makeNode(one.id, 86, 124)] : []),
    ...(x ? [makeNode(x.id, 86, 218)] : []),
    ...(y ? [makeNode(y.id, 86, 312)] : []),
  ];
}

export function App() {
  const [items, setItems] = useState<Item[]>([]);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [nodes, setNodes] = useState<CanvasNode[]>([]);
  const [selection, setSelection] = useState<Selection>({});
  const [activeItemId, setActiveItemId] = useState<string | null>(null);
  const [status, setStatus] = useState("Loading math engine");
  const [isCrafting, setIsCrafting] = useState(false);
  const [shakingNodeIds, setShakingNodeIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    let active = true;
    loadState()
      .then((state) => {
        if (!active) return;
        setItems(state.items);
        setRecipes(state.recipes);
        setGoals(state.goals);
        setStatus("Ready");
        setNodes(starterNodes(state.items));
        setActiveItemId(state.items[0]?.id ?? null);
      })
      .catch((error: Error) => {
        if (!active) return;
        setStatus(error.message);
      });
    return () => {
      active = false;
    };
  }, []);

  const itemsById = useMemo(() => {
    return new Map(items.map((item) => [item.id, item]));
  }, [items]);

  const leftNode = nodes.find((node) => node.id === selection.leftNodeId);
  const rightNode = nodes.find((node) => node.id === selection.rightNodeId);
  const leftItem = leftNode ? itemsById.get(leftNode.itemId) : undefined;
  const rightItem = rightNode ? itemsById.get(rightNode.itemId) : undefined;
  const activeItem = activeItemId ? itemsById.get(activeItemId) ?? null : null;

  function addItemToCanvas(item: Item) {
    const offset = nodes.length % 6;
    setNodes((current) => [...current, makeNode(item.id, 136 + offset * 34, 120 + offset * 46)]);
    setActiveItemId(item.id);
  }

  function moveNode(nodeId: string, x: number, y: number) {
    setNodes((current) =>
      current.map((node) => (node.id === nodeId ? { ...node, x, y } : node)),
    );
  }

  function selectNode(nodeId: string, intent: "click" | "drag") {
    const node = nodes.find((candidate) => candidate.id === nodeId);
    if (node) {
      setActiveItemId(node.itemId);
    }

    if (intent === "drag") {
      return;
    }

    setSelection((current) => {
      if (!current.leftNodeId || current.rightNodeId) {
        return { leftNodeId: nodeId };
      }
      if (current.leftNodeId === nodeId) {
        return { leftNodeId: nodeId };
      }
      return { ...current, rightNodeId: nodeId };
    });
  }

  function shakeNodes(nodeIds: string[]) {
    setShakingNodeIds(new Set(nodeIds));
    window.setTimeout(() => setShakingNodeIds(new Set()), 420);
  }

  async function craftNodes(left: CanvasNode, right: CanvasNode) {
    const first = itemsById.get(left.itemId);
    const second = itemsById.get(right.itemId);
    if (!first || !second || isCrafting) return;

    setIsCrafting(true);
    setStatus(`Crafting eml(${first.label}, ${second.label})`);
    try {
      const response = await craft(first.id, second.id);
      setItems((current) => upsertItem(current, response.result));
      setRecipes((current) => upsertRecipe(current, response.recipe));
      setGoals(response.goals);
      setActiveItemId(response.result.id);
      playSound(response.result.known ? "known" : "craft");
      setNodes((current) => [
        ...current,
        makeNode(response.result.id, Math.max(240, (left.x + right.x) / 2 + 96), (left.y + right.y) / 2),
      ]);
      setSelection({});
      setStatus(
        response.cached
          ? "Recipe recalled"
          : response.result.known
            ? "Discovery recorded"
            : "Expression generated",
      );
    } catch (error) {
      playSound("buzz");
      shakeNodes([left.id, right.id]);
      setStatus(error instanceof Error ? error.message : "Craft failed");
    } finally {
      setIsCrafting(false);
    }
  }

  function runCraft() {
    if (!leftNode || !rightNode) return;
    void craftNodes(leftNode, rightNode);
  }

  function mergeNodes(leftNodeId: string, rightNodeId: string) {
    const first = nodes.find((node) => node.id === leftNodeId);
    const second = nodes.find((node) => node.id === rightNodeId);
    if (!first || !second) return;
    setSelection({ leftNodeId, rightNodeId });
    void craftNodes(first, second);
  }

  function clearCanvas() {
    setNodes(starterNodes(items));
    setSelection({});
    setActiveItemId(items[0]?.id ?? null);
    playSound("reset");
    setStatus("Canvas cleared");
  }

  async function hardResetDiscoveries() {
    setIsCrafting(true);
    setStatus("Resetting discoveries");
    try {
      const state = await resetGame();
      setItems(state.items);
      setRecipes(state.recipes);
      setGoals(state.goals);
      setNodes(starterNodes(state.items));
      setSelection({});
      setActiveItemId(state.items[0]?.id ?? null);
      playSound("reset");
      setStatus("Discoveries reset");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Reset failed");
    } finally {
      setIsCrafting(false);
    }
  }

  return (
    <main className="app-shell">
      <header className="topbar">
        <div className="brand-mark">
          <Atom size={22} strokeWidth={1.8} />
          <div>
            <h1>EML Craft</h1>
            <p>eml(A, B) = exp(A) - log(B)</p>
          </div>
        </div>
        <div className="topbar-cluster">
          <span className="metric-pill">{recipes.length} recipes</span>
          <button
            className="quiet-action"
            type="button"
            onClick={clearCanvas}
            disabled={isCrafting}
            title="Clear canvas tiles and keep discoveries"
          >
            <Eraser size={16} />
            Clear canvas
          </button>
          <button
            className="quiet-action danger"
            type="button"
            onClick={hardResetDiscoveries}
            disabled={isCrafting}
            title="Delete discoveries, recipes, goals progress, and reset the canvas"
          >
            <RotateCcw size={16} />
            Hard reset
          </button>
          <div className="status-pill">
            {isCrafting ? <Loader2 size={16} className="spin" /> : <Sparkles size={16} />}
            <span>{status}</span>
          </div>
        </div>
      </header>

      <section className="workspace">
        <Sidebar
          items={items}
          activeItemId={activeItemId}
          onAddItem={addItemToCanvas}
          onInspect={setActiveItemId}
        />

        <section className="stage">
          <div className="craft-bar" aria-label="Crafting controls">
            <div className="slot">
              <span>First input</span>
              <strong>
                {leftItem ? <MathLabel latex={leftItem.latex} label={leftItem.label} /> : "Select"}
              </strong>
            </div>
            <GitBranch size={20} />
            <div className="slot">
              <span>Second input</span>
              <strong>
                {rightItem ? <MathLabel latex={rightItem.latex} label={rightItem.label} /> : "Select"}
              </strong>
            </div>
            <button
              className="primary-action"
              type="button"
              onClick={runCraft}
              disabled={!leftItem || !rightItem || isCrafting}
            >
              {isCrafting ? <Loader2 size={17} className="spin" /> : <FlaskConical size={17} />}
              Craft
            </button>
          </div>

          <Canvas
            nodes={nodes}
            itemsById={itemsById}
            selection={selection}
            shakingNodeIds={shakingNodeIds}
            onMoveNode={moveNode}
            onSelectNode={selectNode}
            onMergeNodes={mergeNodes}
          />
        </section>

        <aside className="right-rail">
          <GoalsPanel goals={goals} />
          <RecipePanel recipes={recipes} itemsById={itemsById} />
          <Inspector item={activeItem} />
          <GraphPanel item={activeItem} />
          {activeItem ? (
            <button className="rail-action" type="button" onClick={() => addItemToCanvas(activeItem)}>
              <Plus size={16} />
              Add tile
            </button>
          ) : null}
        </aside>
      </section>
    </main>
  );
}
