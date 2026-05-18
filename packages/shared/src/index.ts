export interface Item {
  id: string;
  label: string;
  expression: string;
  eml_tree: string;
  depth: number;
  known: boolean;
  known_key: string | null;
  created_at: string;
}

export interface Recipe {
  id: string;
  left_id: string;
  right_id: string;
  result_id: string;
  created_at: string;
}

export interface Goal {
  id: string;
  label: string;
  target_key: string;
  completed: boolean;
  completed_item_id: string | null;
}

export interface StateResponse {
  items: Item[];
  recipes: Recipe[];
  goals: Goal[];
}

export interface CraftRequest {
  left_id: string;
  right_id: string;
}

export interface CraftResponse {
  result: Item;
  recipe: Recipe;
  goals: Goal[];
  cached: boolean;
}

