import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { DashboardTask } from "@/lib/dashboard-config";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Tasks whose title matches the query (any case), most important first when `prioritized`. */
export function visibleTasks(tasks: DashboardTask[], query: string, prioritized: boolean) {
  const q = query.trim().toLowerCase();
  const hits = q ? tasks.filter((t) => t.title.toLowerCase().includes(q)) : tasks;
  return prioritized ? [...hits].sort((a, b) => a.priority - b.priority) : hits;
}

/** "Welcome, {firstName}!" with the name filled in. */
export const fill = (text: string, values: Record<string, string>) => text.replace(/\{(\w+)\}/g, (m, k: string) => values[k] ?? m);
