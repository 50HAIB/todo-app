// DOM Elements
const todoInput = document.getElementById('todoInput');
const addBtn = document.getElementById('addBtn');
const todoList = document.getElementById('todoList');
const filterBtns = document.querySelectorAll('.filter-btn');
const clearBtn = document.getElementById('clearBtn');
const totalCount = document.getElementById('totalCount');
const completedCount = document.getElementById('completedCount');
const progressFill = document.getElementById('progressFill');
const progressPercent = document.getElementById('progressPercent');

// State
let todos = [];
let currentFilter = 'all';
let editingId = null;

// Load todos from localStorage
function loadTodos() {
    const saved = localStorage.getItem('todos');
    todos = saved ? JSON.parse(saved) : [];
    render();
}

// Save todos to localStorage
function saveTodos() {
    localStorage.setItem('todos', JSON.stringify(todos));
}

// Add new todo
function addTodo() {
    const text = todoInput.value.trim();

    if (text === '') {
        alert('Please enter a task!');
        return;
    }

    const todo = {
        id: Date.now(),
        text: text,
        completed: false,
        createdAt: new Date().toLocaleString()
    };

    todos.unshift(todo);
    todoInput.value = '';
    saveTodos();
    render();
    todoInput.focus();
}

// Toggle todo completion
function toggleTodo(id) {
    const todo = todos.find(t => t.id === id);
    if (todo) {
        todo.completed = !todo.completed;
        saveTodos();
        render();
    }
}

// Delete todo
function deleteTodo(id) {
    todos = todos.filter(t => t.id !== id);
    saveTodos();
    render();
}

// Edit todo
function editTodo(id) {
    editingId = id;
    render();
}

// Save edited todo
function saveEdit(id) {
    const inputElement = document.querySelector(`input[data-edit-id="${id}"]`);
    const newText = inputElement.value.trim();

    if (newText === '') {
        alert('Task cannot be empty!');
        return;
    }

    const todo = todos.find(t => t.id === id);
    if (todo) {
        todo.text = newText;
        editingId = null;
        saveTodos();
        render();
    }
}

// Cancel edit
function cancelEdit() {
    editingId = null;
    render();
}

// Clear all todos
function clearAllTodos() {
    if (todos.length === 0) {
        alert('No todos to clear!');
        return;
    }

    if (confirm('Are you sure you want to delete all todos?')) {
        todos = [];
        saveTodos();
        render();
    }
}

// Filter todos
function filterTodos(filter) {
    currentFilter = filter;
    render();
}

// Get filtered todos
function getFilteredTodos() {
    switch (currentFilter) {
        case 'active':
            return todos.filter(t => !t.completed);
        case 'completed':
            return todos.filter(t => t.completed);
        case 'all':
        default:
            return todos;
    }
}

// Update stats and progress
function updateStats() {
    const completed = todos.filter(t => t.completed).length;
    const total = todos.length;

    totalCount.textContent = total;
    completedCount.textContent = completed;

    // Update progress bar
    const percentage = total === 0 ? 0 : Math.round((completed / total) * 100);
    progressFill.style.width = percentage + '%';
    progressPercent.textContent = percentage;
}

// Render todos
function render() {
    const filteredTodos = getFilteredTodos();

    // Clear list
    todoList.innerHTML = '';

    if (filteredTodos.length === 0) {
        todoList.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">✓</div>
                <p>No tasks yet. Start adding your tasks!</p>
            </div>
        `;
    } else {
        filteredTodos.forEach(todo => {
            const li = document.createElement('li');
            li.className = `todo-item ${todo.completed ? 'completed' : ''}`;

            if (editingId === todo.id) {
                li.innerHTML = `
                    <input 
                        type="text" 
                        class="edit-input" 
                        data-edit-id="${todo.id}"
                        value="${escapeHtml(todo.text)}"
                    >
                    <button class="save-btn" onclick="saveEdit(${todo.id})">
                        <i class="fas fa-check"></i> Save
                    </button>
                    <button class="cancel-btn" onclick="cancelEdit()">
                        <i class="fas fa-times"></i> Cancel
                    </button>
                `;
            } else {
                li.innerHTML = `
                    <input 
                        type="checkbox" 
                        class="checkbox" 
                        ${todo.completed ? 'checked' : ''}
                        onchange="toggleTodo(${todo.id})"
                    >
                    <span class="todo-text">${escapeHtml(todo.text)}</span>
                    <button class="edit-btn" onclick="editTodo(${todo.id})">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="delete-btn" onclick="deleteTodo(${todo.id})">
                        <i class="fas fa-trash-alt"></i> Delete
                    </button>
                `;
            }

            todoList.appendChild(li);
        });
    }

    // Focus on edit input if in edit mode
    if (editingId) {
        const editInput = document.querySelector('.edit-input');
        if (editInput) {
            editInput.focus();
            editInput.select();

            // Add keyboard listeners for edit input
            editInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    saveEdit(editingId);
                }
            });

            editInput.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') {
                    cancelEdit();
                }
            });
        }
    }

    updateStats();
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
}

// Event Listeners
addBtn.addEventListener('click', addTodo);
todoInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        addTodo();
    }
});

clearBtn.addEventListener('click', clearAllTodos);

filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        filterTodos(btn.dataset.filter);
    });
});

// Initialize app
loadTodos();