import { format, parseISO, isBefore, startOfToday } from "date-fns";

function safeFormat(iso) {
  if (!iso) return "No due date";
  try { return format(parseISO(iso), "yyyy-MM-dd"); }
  catch { return "Invalid date"; }
}

function isOverdue(iso) {
  if (!iso) return false;
  try { return isBefore(parseISO(iso), startOfToday()); }
  catch { return false; }
}

export function renderTodos(el, project) {
  el.innerHTML = "";

  if (!project.todos.length) {
    el.innerHTML = `<p class="muted">No todos yet.</p>`;
    return;
  }

  const priorityRank = { high: 0, medium: 1, low: 2 };

  const sorted = [...project.todos].sort((a, b) => {
    if (a.completed !== b.completed) return a.completed ? 1 : -1;
    if (priorityRank[a.priority] !== priorityRank[b.priority])
      return priorityRank[a.priority] - priorityRank[b.priority];
    return (a.dueDateISO || "9999-99-99").localeCompare(b.dueDateISO || "9999-99-99");
  });

  sorted.forEach((t) => {
    const row = document.createElement("div");
    row.className = `todoRow priority-${t.priority} ${t.completed ? "done" : ""}`;
    row.dataset.todoId = t.id;

    const due = safeFormat(t.dueDateISO);
    const overdue = !t.completed && isOverdue(t.dueDateISO);

    row.innerHTML = `
      <div class="todoRow__left">
        <input type="checkbox" class="todoCheck" ${t.completed ? "checked" : ""} />
        <div>
          <div class="todoTitle">${escapeHtml(t.title || "(untitled)")}</div>
          <div class="todoMeta ${overdue ? "overdue" : ""}">
            Due: ${due} • Priority: ${t.priority}${overdue ? " • OVERDUE" : ""}
          </div>
        </div>
      </div>

      <div class="todoRow__actions">
        <button class="btn tiny" data-action="open">Edit</button>
        <button class="btn tiny danger" data-action="delete">Delete</button>
      </div>
    `;

    el.appendChild(row);
  });
}

function escapeHtml(s) {
  return String(s)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
