import { format, parseISO, isBefore, startOfToday } from "date-fns";

function safeDate(iso) {
  if (!iso) return null;
  try {
    return parseISO(iso);
  } catch {
    return null;
  }
}

function formatDue(dueDateISO, dueTime) {
  const d = safeDate(dueDateISO);
  if (!d) return "No due date";

  const datePart = format(d, "yyyy-MM-dd");
  if (!dueTime) return datePart;

  return `${datePart} ${dueTime}`;
}

// Overdue rules:
// - If date+time: overdue if now > due datetime
// - If date only: overdue if date < today (not overdue during the day)
function isOverdue(dueDateISO, dueTime) {
  if (!dueDateISO) return false;

  if (dueTime) {
    const dt = new Date(`${dueDateISO}T${dueTime}`);
    if (Number.isNaN(dt.getTime())) return false;
    return Date.now() > dt.getTime();
  }

  const d = safeDate(dueDateISO);
  if (!d) return false;
  return isBefore(d, startOfToday());
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

    // sort by date then time
    const aKey = `${a.dueDateISO || "9999-99-99"}T${a.dueTime || "23:59"}`;
    const bKey = `${b.dueDateISO || "9999-99-99"}T${b.dueTime || "23:59"}`;
    return aKey.localeCompare(bKey);
  });

  sorted.forEach((t) => {
    const row = document.createElement("div");
    row.className = `todoRow priority-${t.priority} ${t.completed ? "done" : ""}`;
    row.dataset.todoId = t.id;

    const due = formatDue(t.dueDateISO, t.dueTime);
    const overdue = !t.completed && isOverdue(t.dueDateISO, t.dueTime);

    row.innerHTML = `
      <div class="todoRow__left">
        <input type="checkbox" class="todoCheck" ${t.completed ? "checked" : ""} />
        <div>
          <div class="todoTitle">${escapeHtml(t.title || "(untitled)")}</div>
          <div class="todoMeta ${overdue ? "overdue" : ""}">
            Due: ${escapeHtml(due)} • Priority: ${t.priority}${overdue ? " • OVERDUE" : ""}
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
