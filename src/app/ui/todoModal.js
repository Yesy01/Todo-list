import { PRIORITIES } from "../model/todo";

export function openTodoModal({ modal, backdrop }, { title, state, todo, onSave, onDelete, onClose }) {
  backdrop.classList.remove("hidden");
  modal.classList.remove("hidden");

  const projects = state.projects;

  modal.innerHTML = `
    <div class="modal__header">
      <h1 style="font-size:20px; line-height:30px; margin:0;">${escapeHtml(title)}</h1>
      <button class="btn tiny" id="closeModalBtn">X</button>
    </div>

    <form id="todoForm" class="modal__body">
      <label>
        TITLE
        <input name="title" required value="${escapeAttr(todo?.title ?? "")}" />
      </label>

      <label>
        DESCRIPTION
        <textarea name="description" rows="3">${escapeText(todo?.description ?? "")}</textarea>
      </label>

      <div class="grid2">
        <label>
          DUE DATE
          <input name="dueDateISO" type="date" value="${escapeAttr(todo?.dueDateISO ?? "")}" />
        </label>

        <label>
          PRIORITY
          <select name="priority">
            ${PRIORITIES.map(p => `<option value="${p}" ${todo?.priority === p ? "selected" : ""}>${p}</option>`).join("")}
          </select>
        </label>
      </div>

      <label>
        PROJECT
        <select name="projectId">
          ${projects.map(p => {
            const selected = todo?.projectId ? (todo.projectId === p.id) : (state.selectedProjectId === p.id);
            return `<option value="${p.id}" ${selected ? "selected" : ""}>${escapeHtml(p.name)}</option>`;
          }).join("")}
        </select>
      </label>

      <label>
        NOTES
        <textarea name="notes" rows="3">${escapeText(todo?.notes ?? "")}</textarea>
      </label>

      <label class="checkboxRow">
        <input name="completed" type="checkbox" ${todo?.completed ? "checked" : ""}/>
        Completed
      </label>

      <div class="modal__actions">
        <div>
          ${onDelete ? `<button class="btn danger" type="button" id="deleteBtn">Delete</button>` : ""}
        </div>
        <div style="display:flex; gap:10px;">
          <button class="btn" type="button" id="cancelBtn">Cancel</button>
          <button class="btn primary" type="submit">Save</button>
        </div>
      </div>
    </form>
  `;

  const close = () => {
    backdrop.classList.add("hidden");
    modal.classList.add("hidden");
    modal.innerHTML = "";
    onClose?.();
  };

  modal.querySelector("#closeModalBtn").addEventListener("click", close);
  modal.querySelector("#cancelBtn").addEventListener("click", close);
  backdrop.addEventListener("click", close, { once: true });

  const form = modal.querySelector("#todoForm");
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const fd = new FormData(form);

    const payload = {
      title: String(fd.get("title") || "").trim(),
      description: String(fd.get("description") || ""),
      dueDateISO: String(fd.get("dueDateISO") || ""),
      priority: String(fd.get("priority") || "medium"),
      notes: String(fd.get("notes") || ""),
      completed: fd.get("completed") === "on",
      projectId: String(fd.get("projectId") || state.selectedProjectId),
    };

    onSave(payload);
    close();
  });

  const deleteBtn = modal.querySelector("#deleteBtn");
  if (deleteBtn) deleteBtn.addEventListener("click", () => { onDelete(); close(); });
}

function escapeHtml(s) {
  return String(s)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
function escapeAttr(s) { return escapeHtml(s).replaceAll("\n", " "); }
function escapeText(s) { return escapeHtml(s); }
