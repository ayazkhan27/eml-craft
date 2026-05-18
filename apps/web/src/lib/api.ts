import type { CraftResponse, StateResponse } from "@eml-craft/shared";

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
    ...init,
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `Request failed with ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export function loadState(): Promise<StateResponse> {
  return request<StateResponse>("/api/state");
}

export function craft(leftId: string, rightId: string): Promise<CraftResponse> {
  return request<CraftResponse>("/api/craft", {
    method: "POST",
    body: JSON.stringify({ left_id: leftId, right_id: rightId }),
  });
}

