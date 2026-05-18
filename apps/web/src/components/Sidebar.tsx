import type { Item } from "@eml-craft/shared";
import { Plus, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { complexityLabel, expressionTone } from "../lib/expression";
import { MathLabel } from "./MathLabel";

interface SidebarProps {
  items: Item[];
  activeItemId: string | null;
  onAddItem: (item: Item) => void;
  onInspect: (itemId: string) => void;
}

export function Sidebar({ items, activeItemId, onAddItem, onInspect }: SidebarProps) {
  const [query, setQuery] = useState("");
  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return items;
    return items.filter((item) => {
      return (
        item.label.toLowerCase().includes(normalized) ||
        item.expression.toLowerCase().includes(normalized)
      );
    });
  }, [items, query]);

  return (
    <aside className="sidebar">
      <div className="panel-heading">
        <span>Discoveries</span>
        <strong>{items.length}</strong>
      </div>
      <label className="search-box">
        <Search size={16} />
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search expressions"
        />
      </label>
      <div className="item-list">
        {filtered.map((item) => (
          <div
            className={`library-item ${activeItemId === item.id ? "is-active" : ""}`}
            key={item.id}
            role="button"
            tabIndex={0}
            onClick={() => onInspect(item.id)}
            onDoubleClick={() => onAddItem(item)}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                onInspect(item.id);
              }
            }}
          >
            <span className={`item-dot ${expressionTone(item)}`} />
            <span className="item-main">
              <strong>
                <MathLabel latex={item.latex} label={item.label} />
              </strong>
              <small>{complexityLabel(item)}</small>
            </span>
            <button
              className="icon-button"
              type="button"
              title="Add to canvas"
              aria-label={`Add ${item.label} to canvas`}
              onClick={(event) => {
                event.stopPropagation();
                onAddItem(item);
              }}
            >
              <Plus size={15} />
            </button>
          </div>
        ))}
      </div>
    </aside>
  );
}
