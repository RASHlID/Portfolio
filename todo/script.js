const $ = (sel, ctx=document) => ctx.querySelector(sel);
const $$ = (sel, ctx=document) => Array.from(ctx.querySelectorAll(sel));

const form = $('#todo-form');
const input = $('#todo-input');
const list = $('#todo-list');
const countEl = $('#count');
const filters = $$('.filter');
const clearBtn = $('#clear-completed');

const STORAGE_KEY = 'todo.items.v1';
let items = load();
let currentFilter = 'all';

render();

form.addEventListener('submit', (e) => {
  e.preventDefault();
  const text = input.value.trim();
  if (!text) return;
  items.push({ id: crypto.randomUUID(), text, done: false, createdAt: Date.now() });
  input.value = '';
  save(); render();
});

list.addEventListener('click', (e) => {
  const li = e.target.closest('li.todo');
  if (!li) return;
  const id = li.dataset.id;

  if (e.target.matches('input[type="checkbox"]')) {
    toggleDone(id);
  } else if (e.target.matches('.btn-danger')) {
    remove(id);
  } else if (e.target.matches('.btn-edit')) {
    startEdit(li, id);
  }
});

filters.forEach(btn => {
  btn.addEventListener('click', () => {
    filters.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentFilter = btn.dataset.filter;
    render();
  });
});

clearBtn.addEventListener('click', () => {
  items = items.filter(i => !i.done);
  save(); render();
});

function startEdit(li, id) {
  const item = items.find(i => i.id === id);
  if (!item) return;
  const current = item.text;
  const inputEl = document.createElement('input');
  inputEl.type = 'text';
  inputEl.value = current;
  inputEl.className = 'edit';
  const textEl = li.querySelector('.text');
  textEl.replaceWith(inputEl);
  inputEl.focus();
  inputEl.setSelectionRange(current.length, current.length);

  const commit = () => {
    const v = inputEl.value.trim();
    item.text = v || current;
    save(); render();
  };

  inputEl.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') commit();
    if (e.key === 'Escape') render();
  });
  inputEl.addEventListener('blur', commit);
}

function toggleDone(id) {
  const it = items.find(i => i.id === id);
  if (!it) return;
  it.done = !it.done;
  save(); render();
}

function remove(id) {
  items = items.filter(i => i.id !== id);
  save(); render();
}

function render() {
  const filtered = items.filter(i =>
    currentFilter === 'all' ? true :
    currentFilter === 'active' ? !i.done :
    i.done
  );

  list.innerHTML = filtered.map(toItemHTML).join('');
  const remaining = items.filter(i => !i.done).length;
  countEl.textContent = `${remaining} ${remaining === 1 ? 'item' : 'items'}`;
}

function toItemHTML(item) {
  return `
    <li class="todo ${item.done ? 'completed' : ''}" data-id="${item.id}">
      <input type="checkbox" ${item.done ? 'checked' : ''} aria-label="Mark complete">
      <span class="text">${escapeHTML(item.text)}</span>
      <div class="actions">
        <button class="btn btn-edit" aria-label="Edit">Edit</button>
        <button class="btn btn-danger" aria-label="Delete">Delete</button>
      </div>
    </li>
  `;
}

function save() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

function load() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) ?? []; }
  catch { return []; }
}

function escapeHTML(s) {
  const map = { '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;' };
  return s.replace(/[&<>"']/g, c => map[c]);
}