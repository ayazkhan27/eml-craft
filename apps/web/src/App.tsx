import type { Goal, Item, Recipe } from "@eml-craft/shared";
import { Atom, FlaskConical, GitBranch, Loader2, Plus, Sparkles } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { craft, loadState } from "./lib/api";
import { Canvas, type CanvasNode } from "./components/Canvas";
import { GoalsPanel } from "./components/GoalsPanel";
import { Inspector } from "./components/Inspector";
import { Sidebar } from "./components/Sidebar";

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

export function App() {
  const [items, setItems] = useState<Item[]>([]);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [nodes, setNodes] = useState<CanvasNode[]>([]);
  const [selection, setSelection] = useState<Selection>({});
  const [activeItemId, setActiveItemId] = useState<string | null>(null);
  const [status, setStatus] = useState("Loading math engine");
  const [isCrafting, setIsCrafting] = useState(false);

  useEffect(() => {
    let active = true;
    loadState()
      .then((state) => {
        if (!active) return;
        setItems(state.items);
        setRecipes(state.recipes);
        setGoals(state.goals);
        setStatus("Ready");
        const one = state.items.find((item) => item.label === "1");
        const x = state.items.find((item) => item.label === "x");
        setNodes([
          ...(one ? [makeNode(one.id, 86, 132)] : []),
          ...(x ? [makeNode(x.id, 86, 226)] : []),
        ]);
        setActiveItemId(one?.id ?? x?.id ?? null);
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

  function selectNode(nodeId: string) {
    const node = nodes.find((candidate) => candidate.id === nodeId);
    if (node) {
      setActiveItemId(node.itemId);
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

  async function runCraft() {
    if (!leftItem || !rightItem) return;

    setIsCrafting(true);
    setStatus(`Crafting eml(${leftItem.label}, ${rightItem.label})`);
    try {
      const response = await craft(leftItem.id, rightItem.id);
      setItems((current) => upsertItem(current, response.result));
      setRecipes((current) => upsertRecipe(current, response.recipe));
      setGoals(response.goals);
      setActiveItemId(response.result.id);
      const leftX = leftNode?.x ?? 320;
      const leftY = leftNode?.y ?? 240;
      const rightX = rightNode?.x ?? leftX + 160;
      const rightY = rightNode?.y ?? leftY;
      setNodes((current) => [
        ...current,
        makeNode(response.result.id, Math.max(240, (leftX + rightX) / 2 + 96), (leftY + rightY) / 2),
      ]);
      setSelection({});
      setStatus(response.cached ? "Recipe recalled" : "Discovery recorded");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Craft failed");
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
              <strong>{leftItem?.label ?? "Select"}</strong>
            </div>
            <GitBranch size={20} />
            <div className="slot">
              <span>Second input</span>
              <strong>{rightItem?.label ?? "Select"}</strong>
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
            onMoveNode={moveNode}
            onSelectNode={selectNode}
          />
        </section>

        <aside className="right-rail">
          <GoalsPanel goals={goals} />
          <Inspector item={activeItem} />
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
