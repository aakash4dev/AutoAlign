import { AlignmentResult } from "./types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export async function alignBrd(
  brdContent: string,
  maxIterations = 5
): Promise<AlignmentResult> {
  const res = await fetch(`${API_BASE}/api/align`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      brd_content: brdContent,
      max_iterations: maxIterations,
    }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || "Alignment failed");
  }
  return res.json();
}

export async function queryPolicy(question: string): Promise<string> {
  const res = await fetch(`${API_BASE}/api/query`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ question }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || "Query failed");
  }
  const data = await res.json();
  return data.answer;
}

export async function healthCheck(): Promise<{
  status: string;
  model: string;
}> {
  const res = await fetch(`${API_BASE}/api/health`);
  if (!res.ok) throw new Error("API unreachable");
  return res.json();
}
