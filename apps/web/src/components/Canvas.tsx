import type { Item } from "@eml-craft/shared";
import { MousePointer2 } from "lucide-react";
import { useEffect, useState } from "react";
import { complexityLabel } from "../lib/expression";

export interface CanvasNode {
  id: string;
  itemId: string;
  x: number;
  y: number;
}

interface Selection {
  leftNodeId?: string;
  rightNodeId?: string;
}

interface CanvasProps {
  nodes: CanvasNode[];
  itemsById: Map<string, Item>;
  selection: Selection;
  onSelectNode: (nodeId: string) => void;
  onMoveNode: (nodeId: string, x: number, y: number) => void;
}

interface DragState {
  nodeId: string;
  startX: number;
  startY: number;
  originX: number;
  originY: number;
}

export function Canvas({
  nodes,
  itemsById,
  selection,
  onSelectNode,
  onMoveNode,
}: CanvasProps) {
  const [drag, setDrag] = useState<DragState | null>(null);

  useEffect(() => {
    if (!drag) return;
    const currentDrag = drag;

    function handleMove(event: PointerEvent) {
      const nextX = Math.max(12, currentDrag.originX + event.clientX - currentDrag.startX);
      const nextY = Math.max(12, currentDrag.originY + event.clientY - currentDrag.startY);
      onMoveNode(currentDrag.nodeId, nextX, nextY);
    }

    function handleUp() {
      setDrag(null);
    }

    window.addEventListener("pointermove", handleMove);
    window.addEventListener("pointerup", handleUp);
    return () => {
      window.removeEventListener("pointermove", handleMove);
      window.removeEventListener("pointerup", handleUp);
    };
  }, [drag, onMoveNode]);

  return (
    <div className="canvas-surface">
      <div className="canvas-watermark">
        <MousePointer2 size={18} />
        <span>Ordered EML workspace</span>
      </div>
      {nodes.map((node) => {
        const item = itemsById.get(node.itemId);
        if (!item) return null;
        const isLeft = selection.leftNodeId === node.id;
        const isRight = selection.rightNodeId === node.id;
        return (
          <button
            key={node.id}
            type="button"
            className={`canvas-node ${isLeft ? "is-left" : ""} ${isRight ? "is-right" : ""}`}
            style={{ transform: `translate(${node.x}px, ${node.y}px)` }}
            onPointerDown={(event) => {
              event.currentTarget.setPointerCapture(event.pointerId);
              onSelectNode(node.id);
              setDrag({
                nodeId: node.id,
                startX: event.clientX,
                startY: event.clientY,
                originX: node.x,
                originY: node.y,
              });
            }}
          >
            <span className="node-label">{item.label}</span>
            <span className="node-meta">{complexityLabel(item)}</span>
          </button>
        );
      })}
    </div>
  );
}
