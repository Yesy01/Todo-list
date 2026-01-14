import {
  format,
  parseISO,
  isBefore,
  isAfter,
  differenceInMinutes,
  startOfToday,
  addDays,
} from "date-fns";

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

function toDueDateTime(dueDateISO, dueTime) {
  if (!dueDateISO) return null;

  if (dueTime) {
    const dt = new Date(`${dueDateISO}T${dueTime}`);
    if (Number.isNaN(dt.getTime())) return null;
    return dt;
  }

  // date-only: treat as end of day (23:59) so "due today" stays "due today"
  const dt = new Date(`${dueDateISO}T23:59`);
  if (Number.isNaN(dt.getTime())) return null;
  return dt;
}

/**
 * Status buckets:
 * - none: no due date
 * - overdue: now > due datetime
 * - due-now: due within next 60 minutes
 * - due-today: due later today
 * - due-soon: due within next 3 days (excluding today)
 * - future: later than 3 days
 */
function getDueStatus(dueDateISO, dueTime) {
  const dt = toDueDateTime(dueDateISO, dueTime);
  if (!dt) return { key: "none", label: null, minutesLeft: null };

  const now = new Date();
  const mins = differenceInMinutes(dt, now);

  if (mins < 0) return { key: "overdue", label: "OVERDUE", minutesLeft: mins };

  // due within 60 minutes
  if (mins <= 60) return { key: "due-now", label: "DUE SOON", minutesLeft: mins };

  // due today (date-only or date+time)
  const todayStart = startOfToday();
  const tomorrowStart = addDays(todayStart, 1);
  if (isAfter(dt, todayStart) && isBefore(dt, tomorrowStart)) {
    return { key: "due-today", label: "DUE TODAY", minutesLeft: mins };
  }

  // due within next 3 days (not today)
  const in3Days = addDays(todayStart, 4); // today + 3 days window end
  if (isBefore(dt, in3Days)) {
    return { key: "due-soon", label: "DUE SOON", minutesLeft: mins };
  }

  return { key: "future", label: null, minutesLeft: mins };
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

    const aKey = `${a.dueDateISO || "9999-99-99"}T${a.dueTime || "23:59"}`;
    const bKey = `${b.dueDateISO || "9999-99-99"}T${b.dueTime || "23:59"}`;
    return aKey.localeCompare(bKey);
  });

  sorted.forEach((t) => {
    const row = document.createElement("div");

    const due = formatDue(t.dueDateISO, t.dueTime);
    const status = !t.completed
      ? getDueStatus(t.dueDateISO, t.dueTime)
      : { key: "future", label: null };

    row.className = `todoRow priority-${t.priority} ${t.completed ? "done" : ""} due-${status.key}`;
    row.dataset.todoId = t.id;

    const badgeHtml =
      status.label ? `<span class="badge badge--${status.key}">${status.label}</span>` : "";

    row.innerHTML = `
      <div class="todoRow__left">
        <input type="checkbox" class="todoCheck" ${t.completed ? "checked" : ""} />
        <div>
          <div class="todoTitle">
            ${escapeHtml(t.title || "(untitled)")}
            ${badgeHtml}
          </div>
          <div class="todoMeta">
            Due: ${escapeHtml(due)} &bull; Priority: ${t.priority}
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
