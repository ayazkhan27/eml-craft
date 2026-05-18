import type { Item } from "@eml-craft/shared";
import { MousePointer2 } from "lucide-react";
import { type CSSProperties, useEffect, useState } from "react";
import { complexityLabel } from "../lib/expression";
import { MathLabel } from "./MathLabel";

const NODE_WIDTH = 176;
const NODE_HEIGHT = 70;

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
  shakingNodeIds: Set<string>;
  onSelectNode: (nodeId: string, intent: "click" | "drag") => void;
  onMoveNode: (nodeId: string, x: number, y: number) => void;
  onMergeNodes: (leftNodeId: string, rightNodeId: string) => void;
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
  shakingNodeIds,
  onSelectNode,
  onMoveNode,
  onMergeNodes,
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

    function handleUp(event: PointerEvent) {
      const travel = Math.hypot(event.clientX - currentDrag.startX, event.clientY - currentDrag.startY);
      const nextX = Math.max(12, currentDrag.originX + event.clientX - currentDrag.startX);
      const nextY = Math.max(12, currentDrag.originY + event.clientY - currentDrag.startY);
      onMoveNode(currentDrag.nodeId, nextX, nextY);
      const target = nodes.find((node) => {
        if (node.id === currentDrag.nodeId) return false;
        const centerX = nextX + NODE_WIDTH / 2;
        const centerY = nextY + NODE_HEIGHT / 2;
        return (
          centerX >= node.x &&
          centerX <= node.x + NODE_WIDTH &&
          centerY >= node.y &&
          centerY <= node.y + NODE_HEIGHT
        );
      });
      if (target) {
        onMergeNodes(currentDrag.nodeId, target.id);
      } else if (travel < 6) {
        onSelectNode(currentDrag.nodeId, "click");
      }
      setDrag(null);
    }

    window.addEventListener("pointermove", handleMove);
    window.addEventListener("pointerup", handleUp);
    return () => {
      window.removeEventListener("pointermove", handleMove);
      window.removeEventListener("pointerup", handleUp);
    };
  }, [drag, nodes, onMergeNodes, onMoveNode, onSelectNode]);

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
        const isShaking = shakingNodeIds.has(node.id);
        const nodeStyle = {
          "--node-x": `${node.x}px`,
          "--node-y": `${node.y}px`,
        } as CSSProperties;
        return (
          <button
            key={node.id}
            type="button"
            className={`canvas-node ${isLeft ? "is-left" : ""} ${isRight ? "is-right" : ""} ${
              isShaking ? "is-shaking" : ""
            }`}
            style={nodeStyle}
            onPointerDown={(event) => {
              event.currentTarget.setPointerCapture(event.pointerId);
              onSelectNode(node.id, "drag");
              setDrag({
                nodeId: node.id,
                startX: event.clientX,
                startY: event.clientY,
                originX: node.x,
                originY: node.y,
              });
            }}
          >
            <span className="node-label">
              <MathLabel latex={item.latex} label={item.label} />
            </span>
            <span className="node-meta">{complexityLabel(item)}</span>
          </button>
        );
      })}
    </div>
  );
}
