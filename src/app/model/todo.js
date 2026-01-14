import { uid } from "../ids";

export const PRIORITIES = ["low", "medium", "high"];

export function makeTodo({
  id = uid(),
  title = "",
  description = "",
  dueDateISO = "",         // store as "YYYY-MM-DD"
  dueTime = "",            // "HH:mm" (optional)
  priority = "medium",
  notes = "",
  checklist = [],
  completed = false,
  createdAt = new Date().toISOString(),
  updatedAt = new Date().toISOString(),
} = {}) {
  if (!PRIORITIES.includes(priority)) priority = "medium";
  return {
    id, title, description, dueDateISO, dueTime, priority, notes, checklist,
    completed, createdAt, updatedAt,
  };
}
