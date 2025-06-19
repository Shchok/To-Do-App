const newListForm = document.getElementById("new-list-form");
const listNameInput = document.getElementById("list-name");
const listsContainer = document.getElementById("lists-container");

let data = {
  lists: [],
};

let listIdCounter = 1;
let taskIdCounter = 1;

function saveToLocalStorage() {
  localStorage.setItem("todoData", JSON.stringify(data));
}

function loadFromLocalStorage() {
  const saved = localStorage.getItem("todoData");
  if (saved) {
    data = JSON.parse(saved);
    listIdCounter = Math.max(...data.lists.map((l) => l.id), 0) + 1;
    taskIdCounter =
      Math.max(...data.lists.flatMap((l) => l.tasks.map((t) => t.id)), 0) + 1;
    renderAll();
  }
}

// ========== РЕНДЕРИНГ ==========
function renderAll() {
  listsContainer.innerHTML = "";
  data.lists.forEach(renderList);
}

function renderList(list) {
  const listEl = document.createElement("article");
  listEl.className = "todo-list";
  listEl.dataset.listId = list.id;

  listEl.innerHTML = `
    <h3>${list.name}</h3>
    <form class="new-task-form">
      <input type="text" placeholder="Заголовок" class="task-title" required />
      <input type="text" placeholder="Опис" class="task-desc" />
      <input type="date" class="task-date" />
      <button type="submit">Додати справу</button>
    </form>
    <ul class="tasks"></ul>
    <button class="delete-list-btn">Видалити список</button>
  `;

  const tasksList = listEl.querySelector(".tasks");
  list.tasks.forEach((task) => {
    tasksList.appendChild(renderTask(task));
  });

  listsContainer.appendChild(listEl);
}

function renderTask(task) {
  const taskEl = document.createElement("li");
  taskEl.dataset.taskId = task.id;

  taskEl.innerHTML = `
    <input type="checkbox" ${task.done ? "checked" : ""}/>
    <span class="task-title-text" contenteditable="false">${task.title}</span> —
    <span class="task-desc-text" contenteditable="false">${
      task.description
    }</span>
    ${task.date ? `(<time>${task.date}</time>)` : ""}
    <button class="edit-task-btn">Редагувати</button>
    <button class="delete-task-btn">Видалити</button>
  `;

  return taskEl;
}

// ========== ДОДАТИ НОВИЙ СПИСОК ==========
newListForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const name = listNameInput.value.trim();
  if (!name) return;

  const newList = {
    id: listIdCounter++,
    name,
    tasks: [],
  };

  data.lists.push(newList);
  saveToLocalStorage();
  renderAll();
  listNameInput.value = "";
});

// ========== ДОДАТИ / РЕДАГУВАТИ / ВИДАЛИТИ ЗАВДАННЯ ТА СПИСКИ ==========
listsContainer.addEventListener("submit", (e) => {
  if (!e.target.classList.contains("new-task-form")) return;
  e.preventDefault();

  const form = e.target;
  const listEl = form.closest(".todo-list");
  const listId = +listEl.dataset.listId;
  const title = form.querySelector(".task-title").value.trim();
  const desc = form.querySelector(".task-desc").value.trim();
  const date = form.querySelector(".task-date").value;

  if (!title) return;

  const newTask = {
    id: taskIdCounter++,
    title,
    description: desc,
    date,
    done: false,
  };

  const list = data.lists.find((l) => l.id === listId);
  list.tasks.push(newTask);
  saveToLocalStorage();
  renderAll();
});

listsContainer.addEventListener("click", (e) => {
  const target = e.target;
  const listEl = target.closest(".todo-list");
  const listId = +listEl?.dataset.listId;
  const list = data.lists.find((l) => l.id === listId);

  // Видалити список
  if (target.classList.contains("delete-list-btn")) {
    data.lists = data.lists.filter((l) => l.id !== listId);
    saveToLocalStorage();
    renderAll();
  }

  // Видалити завдання
  if (target.classList.contains("delete-task-btn")) {
    const taskEl = target.closest("li");
    const taskId = +taskEl.dataset.taskId;
    list.tasks = list.tasks.filter((t) => t.id !== taskId);
    saveToLocalStorage();
    renderAll();
  }

  // Редагувати завдання
  if (target.classList.contains("edit-task-btn")) {
    const taskEl = target.closest("li");
    const taskId = +taskEl.dataset.taskId;
    const task = list.tasks.find((t) => t.id === taskId);

    const titleEl = taskEl.querySelector(".task-title-text");
    const descEl = taskEl.querySelector(".task-desc-text");

    const editable = titleEl.isContentEditable;
    if (editable) {
      // Зберегти
      task.title = titleEl.textContent.trim();
      task.description = descEl.textContent.trim();
      saveToLocalStorage();
      titleEl.contentEditable = "false";
      descEl.contentEditable = "false";
      target.textContent = "Редагувати";
    } else {
      // Увімкнути редагування
      titleEl.contentEditable = "true";
      descEl.contentEditable = "true";
      titleEl.focus();
      target.textContent = "Зберегти";
    }
  }

  // Позначити як виконане
  if (target.type === "checkbox") {
    const taskEl = target.closest("li");
    const taskId = +taskEl.dataset.taskId;
    const task = list.tasks.find((t) => t.id === taskId);
    task.done = target.checked;
    saveToLocalStorage();
  }
});

// ========== ІНІЦІАЛІЗАЦІЯ ==========
loadFromLocalStorage();
