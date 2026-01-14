export function renderProjects(el, state, selectedId) {
  el.innerHTML = "";
  state.projects.forEach((p) => {
    const li = document.createElement("li");
    li.className = `projectItem ${p.id === selectedId ? "active" : ""}`;
    li.dataset.projectId = p.id;
    li.textContent = p.name;

    const count = document.createElement("span");
    count.className = "pill";
    count.textContent = String(p.todos.length);

    li.appendChild(count);
    el.appendChild(li);
  });
}
