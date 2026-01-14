import "./style.css";

import { createStore } from "./app/store";
import { mountLayout } from "./app/ui/layout";
import { renderProjects } from "./app/ui/projectsView";
import { renderTodos } from "./app/ui/todosView";
import { openTodoModal } from "./app/ui/todoModal";

const store = createStore();
const root = document.getElementById("app");
const ui = mountLayout(root);

const THEME_KEY = "todo_theme_v1";

function getPreferredTheme() {
  const saved = localStorage.getItem(THEME_KEY);
  if (saved === "light" || saved === "dark") return saved;

  return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
  localStorage.setItem(THEME_KEY, theme);
}

function toggleTheme() {
  const current = document.documentElement.dataset.theme || "light";
  applyTheme(current === "dark" ? "light" : "dark");
}

function findTodo(project, todoId) {
  return project.todos.find(t => t.id === todoId) || null;
}

function render() {
  const state = store.getState();
  const selected = store.getSelectedProject();

  renderProjects(ui.projectList, state, selected.id);

  ui.currentProjectName.textContent = selected.name;
  ui.projectMeta.textContent = `${selected.todos.length} todo(s)`;

  renderTodos(ui.todoList, selected);
}

applyTheme(getPreferredTheme());
render();

ui.themeToggleBtn.addEventListener("click", toggleTheme);

/* Projects */
ui.projectList.addEventListener("click", (e) => {
  const li = e.target.closest(".projectItem");
  if (!li) return;
  store.selectProject(li.dataset.projectId);
  render();
});

ui.addProjectBtn.addEventListener("click", () => {
  const name = prompt("Project name?");
  if (!name) return;
  store.addProject(name);
  render();
});

ui.renameProjectBtn.addEventListener("click", () => {
  const selected = store.getSelectedProject();
  const name = prompt("Rename project:", selected.name);
  if (!name) return;
  store.renameProject(selected.id, name);
  render();
});

ui.deleteProjectBtn.addEventListener("click", () => {
  const selected = store.getSelectedProject();
  const ok = confirm(`Delete project "${selected.name}"? (todos will be lost)`);
  if (!ok) return;
  store.deleteProject(selected.id);
  render();
});

/* Todos */
ui.addTodoBtn.addEventListener("click", () => {
  const state = store.getState();

  openTodoModal(
    { modal: ui.todoModal, backdrop: ui.modalBackdrop },
    {
      title: "New Todo",
      state,
      todo: { projectId: state.selectedProjectId },
      onSave: (payload) => {
        store.addTodo(payload.projectId, payload);
        // if user chose another project, switch to it so they see it
        store.selectProject(payload.projectId);
        render();
      },
    }
  );
});

ui.todoList.addEventListener("click", (e) => {
  const row = e.target.closest(".todoRow");
  if (!row) return;

  const selected = store.getSelectedProject();
  const todoId = row.dataset.todoId;

  if (e.target.classList.contains("todoCheck")) {
    store.toggleTodoComplete(selected.id, todoId);
    render();
    return;
  }

  const actionBtn = e.target.closest("button[data-action]");
  if (!actionBtn) return;

  const action = actionBtn.dataset.action;

  if (action === "delete") {
    store.deleteTodo(selected.id, todoId);
    render();
    return;
  }

  if (action === "open") {
    const state = store.getState();
    const currentProject = store.getSelectedProject();
    const todo = findTodo(currentProject, todoId);

    openTodoModal(
      { modal: ui.todoModal, backdrop: ui.modalBackdrop },
      {
        title: "Edit Todo",
        state,
        todo: { ...todo, projectId: currentProject.id },
        onSave: (payload) => {
          // update fields
          store.updateTodo(currentProject.id, todoId, payload);

          // move if project changed
          if (payload.projectId !== currentProject.id) {
            store.moveTodo(currentProject.id, payload.projectId, todoId);
            store.selectProject(payload.projectId);
          }
          render();
        },
        onDelete: () => {
          store.deleteTodo(currentProject.id, todoId);
          render();
        },
      }
    );
  }
});
