import { makeProject } from "./model/project";
import { makeTodo } from "./model/todo";
import { loadState, saveState } from "./storage";

function nowISO() {
  return new Date().toISOString();
}

function rehydrateState(maybeState) {
  // JSON can't store functions; rebuild objects via factories after JSON.parse
  if (!maybeState || !Array.isArray(maybeState.projects)) return null;

  const projects = maybeState.projects.map((p) =>
    makeProject({
      ...p,
      todos: Array.isArray(p.todos) ? p.todos.map((t) => makeTodo(t)) : [],
    })
  );

  const selectedProjectId =
    maybeState.selectedProjectId && projects.some(p => p.id === maybeState.selectedProjectId)
      ? maybeState.selectedProjectId
      : projects[0]?.id;

  return { projects, selectedProjectId };
}

export function createStore() {
  const loaded = rehydrateState(loadState());

  const state = loaded ?? {
    projects: [makeProject({ name: "Inbox" })],
    selectedProjectId: null,
  };

  if (!state.selectedProjectId) state.selectedProjectId = state.projects[0].id;

  function persist() { saveState(state); }

  function getState() { return structuredClone(state); }

  function selectProject(projectId) {
    if (!state.projects.some(p => p.id === projectId)) return;
    state.selectedProjectId = projectId;
    persist();
  }

  function getSelectedProject() {
    return state.projects.find(p => p.id === state.selectedProjectId) || state.projects[0];
  }

  function addProject(name) {
    const proj = makeProject({ name: name?.trim() || "Untitled Project" });
    state.projects.push(proj);
    state.selectedProjectId = proj.id;
    persist();
    return proj.id;
  }

  function renameProject(projectId, name) {
    const p = state.projects.find(p => p.id === projectId);
    if (!p) return;
    p.name = name?.trim() || p.name;
    p.updatedAt = nowISO();
    persist();
  }

  function deleteProject(projectId) {
    if (state.projects.length === 1) return; // keep at least one
    const idx = state.projects.findIndex(p => p.id === projectId);
    if (idx === -1) return;
    state.projects.splice(idx, 1);
    if (state.selectedProjectId === projectId) {
      state.selectedProjectId = state.projects[0].id;
    }
    persist();
  }

  function addTodo(projectId, todoData) {
    const p = state.projects.find(p => p.id === projectId);
    if (!p) return null;
    const todo = makeTodo(todoData);
    p.todos.push(todo);
    p.updatedAt = nowISO();
    persist();
    return todo.id;
  }

  function updateTodo(projectId, todoId, patch) {
    const p = state.projects.find(p => p.id === projectId);
    if (!p) return;
    const t = p.todos.find(t => t.id === todoId);
    if (!t) return;

    Object.assign(t, patch);
    t.updatedAt = nowISO();
    p.updatedAt = nowISO();
    persist();
  }

  function moveTodo(fromProjectId, toProjectId, todoId) {
    if (fromProjectId === toProjectId) return;

    const from = state.projects.find(p => p.id === fromProjectId);
    const to = state.projects.find(p => p.id === toProjectId);
    if (!from || !to) return;

    const idx = from.todos.findIndex(t => t.id === todoId);
    if (idx === -1) return;

    const [todo] = from.todos.splice(idx, 1);
    to.todos.push(todo);

    from.updatedAt = nowISO();
    to.updatedAt = nowISO();
    persist();
  }

  function deleteTodo(projectId, todoId) {
    const p = state.projects.find(p => p.id === projectId);
    if (!p) return;
    const idx = p.todos.findIndex(t => t.id === todoId);
    if (idx === -1) return;
    p.todos.splice(idx, 1);
    p.updatedAt = nowISO();
    persist();
  }

  function toggleTodoComplete(projectId, todoId) {
    const p = state.projects.find(p => p.id === projectId);
    if (!p) return;
    const t = p.todos.find(t => t.id === todoId);
    if (!t) return;

    t.completed = !t.completed;
    t.updatedAt = nowISO();
    p.updatedAt = nowISO();
    persist();
  }

  return {
    getState,
    selectProject,
    getSelectedProject,
    addProject,
    renameProject,
    deleteProject,
    addTodo,
    updateTodo,
    moveTodo,
    deleteTodo,
    toggleTodoComplete,
  };
}
