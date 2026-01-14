export function mountLayout(root) {
  root.innerHTML = `
    <div class="shell">
      <aside class="sidebar">
        <div class="sidebar__top">
          <h1>Projects</h1>
          <button class="btn" id="addProjectBtn">+ Project</button>
        </div>
        <ul class="projectList" id="projectList"></ul>

        <div style="margin-top:12px; display:flex; gap:8px;">
          <button class="btn tiny" id="renameProjectBtn">Rename</button>
          <button class="btn tiny danger" id="deleteProjectBtn">Delete</button>
        </div>
      </aside>

      <main class="main">
        <div class="main__top">
          <div>
            <h2 id="currentProjectName"></h2>
            <p class="muted" id="projectMeta"></p>
          </div>
          <button class="btn primary" id="addTodoBtn">+ Todo</button>
        </div>

        <div class="todoList" id="todoList"></div>
      </main>
    </div>

    <div class="modalBackdrop hidden" id="modalBackdrop"></div>
    <div class="modal hidden" id="todoModal"></div>
  `;

  return {
    projectList: root.querySelector("#projectList"),
    todoList: root.querySelector("#todoList"),
    currentProjectName: root.querySelector("#currentProjectName"),
    projectMeta: root.querySelector("#projectMeta"),
    addProjectBtn: root.querySelector("#addProjectBtn"),
    renameProjectBtn: root.querySelector("#renameProjectBtn"),
    deleteProjectBtn: root.querySelector("#deleteProjectBtn"),
    addTodoBtn: root.querySelector("#addTodoBtn"),
    modalBackdrop: root.querySelector("#modalBackdrop"),
    todoModal: root.querySelector("#todoModal"),
  };
}
