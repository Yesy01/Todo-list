import { uid } from "../ids";

export function makeProject({
  id = uid(),
  name = "New Project",
  todos = [],
  createdAt = new Date().toISOString(),
  updatedAt = new Date().toISOString(),
} = {}) {
  return { id, name, todos, createdAt, updatedAt };
}
