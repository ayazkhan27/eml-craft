import type { Goal } from "@eml-craft/shared";
import { Check, Circle } from "lucide-react";

interface GoalsPanelProps {
  goals: Goal[];
}

export function GoalsPanel({ goals }: GoalsPanelProps) {
  return (
    <section className="rail-panel">
      <div className="panel-heading">
        <span>Goals</span>
        <strong>{goals.filter((goal) => goal.completed).length}/{goals.length}</strong>
      </div>
      <div className="goal-list">
        {goals.map((goal) => (
          <div className={`goal-row ${goal.completed ? "is-complete" : ""}`} key={goal.id}>
            {goal.completed ? <Check size={16} /> : <Circle size={16} />}
            <span>{goal.label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

