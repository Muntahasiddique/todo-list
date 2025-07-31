document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements
  const taskForm = document.getElementById('task-form');
  const taskInput = document.getElementById('task-input');
  const taskList = document.getElementById('task-list');
  const totalCount = document.getElementById('total-count');
  const doneCount = document.getElementById('done-count');
  const clearAllBtn = document.getElementById('clear-all');
  const submitBtn = document.getElementById('submit-btn');
  const priorityBtns = document.querySelectorAll('.priority-btn');
  const sortSelect = document.getElementById('sort-select');
  const taskSearch = document.getElementById('task-search');
  const exportBtn = document.getElementById('export-btn');
  const importBtn = document.getElementById('import-btn');
  const importInput = document.getElementById('import-input');
  const taskDue = document.getElementById('task-due');
  const taskCategories = document.getElementById('task-categories');

  // State
  let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
  let currentEditId = null;
  let selectedPriority = 'medium';

  // Initialize
  renderTasks();
  taskInput.focus();

  // Event Listeners
  taskForm.addEventListener('submit', handleSubmit);
  clearAllBtn.addEventListener('click', handleClearAll);
  sortSelect.addEventListener('change', () => sortTasks(sortSelect.value));
  taskSearch.addEventListener('input', () => searchTasks(taskSearch.value));
  exportBtn.addEventListener('click', exportTasks);
  importBtn.addEventListener('click', () => importInput.click());
  importInput.addEventListener('change', (e) => {
    if (e.target.files[0]) importTasks(e.target.files[0]);
  });

  priorityBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      priorityBtns.forEach(b => b.classList.remove('ring-2', 'ring-offset-2', 'ring-blue-500'));
      btn.classList.add('ring-2', 'ring-offset-2', 'ring-blue-500');
      selectedPriority = btn.dataset.priority;
    });
  });

  // Set medium as default priority
  document.querySelector('.priority-btn[data-priority="medium"]').classList.add('ring-2', 'ring-offset-2', 'ring-blue-500');

  // Functions
  function handleSubmit(e) {
    e.preventDefault();
    const text = taskInput.value.trim();
    
    if (!text) {
      taskInput.classList.add('animate-pulse', 'border-red-500');
      setTimeout(() => {
        taskInput.classList.remove('animate-pulse', 'border-red-500');
      }, 1000);
      return;
    }

    if (currentEditId) {
      // Update task
      const task = tasks.find(t => t.id === currentEditId);
      if (task) {
        task.text = text;
        task.priority = selectedPriority;
        task.dueDate = taskDue.value || null;
        task.categories = taskCategories.value.split(',').map(c => c.trim()).filter(c => c);
      }
    } else {
      // Add new task
      tasks.push({
        id: Date.now(),
        text,
        completed: false,
        priority: selectedPriority,
        dueDate: taskDue.value || null,
        categories: taskCategories.value.split(',').map(c => c.trim()).filter(c => c),
        createdAt: new Date().toISOString()
      });
    }
    
    saveTasks();
    resetForm();
    renderTasks();
  }

  function handleClearAll() {
    if (tasks.length === 0) return;
    
    const dialog = document.createElement('div');
    dialog.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
    dialog.innerHTML = `
      <div class="bg-white dark:bg-gray-800 p-6 rounded-lg max-w-sm w-full">
        <h3 class="text-lg font-bold mb-4">Clear All Tasks?</h3>
        <p class="mb-6">This will permanently delete all your tasks.</p>
        <div class="flex justify-end space-x-3">
          <button id="cancel-clear" class="px-4 py-2 rounded-lg border">Cancel</button>
          <button id="confirm-clear" class="px-4 py-2 rounded-lg bg-red-500 text-white">Clear All</button>
        </div>
      </div>
    `;
    
    document.body.appendChild(dialog);
    
    document.getElementById('cancel-clear').addEventListener('click', () => {
      document.body.removeChild(dialog);
    });
    
    document.getElementById('confirm-clear').addEventListener('click', () => {
      tasks = [];
      saveTasks();
      renderTasks();
      document.body.removeChild(dialog);
    });
  }

  function sortTasks(criteria) {
    const sortedTasks = [...tasks].sort((a, b) => {
      if (criteria === 'priority') {
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      } else if (criteria === 'date') {
        return new Date(a.createdAt) - new Date(b.createdAt);
      } else if (criteria === 'completed') {
        return a.completed - b.completed;
      } else if (criteria === 'dueDate') {
        if (!a.dueDate && !b.dueDate) return 0;
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return new Date(a.dueDate) - new Date(b.dueDate);
      }
      return 0;
    });
    tasks = sortedTasks;
    renderTasks();
  }

  function searchTasks(query) {
    if (!query) {
      renderTasks();
      return;
    }
    const filtered = tasks.filter(task => 
      task.text.toLowerCase().includes(query.toLowerCase()) ||
      (task.categories && task.categories.some(cat => 
        cat.toLowerCase().includes(query.toLowerCase())))
    );
    renderFilteredTasks(filtered);
  }

  function renderFilteredTasks(filteredTasks) {
    taskList.innerHTML = '';
    
    if (filteredTasks.length === 0) {
      taskList.innerHTML = `
        <li class="text-center py-8 text-gray-500 dark:text-gray-400">
          <svg class="w-12 h-12 mx-auto opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <p class="mt-2">No matching tasks found</p>
        </li>
      `;
    } else {
      filteredTasks.forEach(task => {
        const taskEl = createTaskElement(task);
        taskList.appendChild(taskEl);
      });
    }
    
    updateCounters();
  }

  function renderTasks() {
    taskList.innerHTML = '';
    
    if (tasks.length === 0) {
      taskList.innerHTML = `
        <li class="text-center py-8 text-gray-500 dark:text-gray-400">
          <svg class="w-12 h-12 mx-auto opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <p class="mt-2">No tasks yet</p>
        </li>
      `;
    } else {
      tasks.forEach(task => {
        const taskEl = createTaskElement(task);
        taskList.appendChild(taskEl);
      });
    }
    
    updateCounters();
  }

  function createTaskElement(task) {
    const taskEl = document.createElement('li');
    taskEl.className = 'flex items-center justify-between p-3 bg-white dark:bg-gray-700 rounded-lg mb-2 task-enter';
    taskEl.dataset.id = task.id;
    
    taskEl.innerHTML = `
      <div class="flex items-center flex-1">
        <input 
          type="checkbox" 
          ${task.completed ? 'checked' : ''}
          class="task-checkbox h-5 w-5 text-blue-600 rounded mr-3"
        >
        <div class="flex-1">
          <span class="${task.completed ? 'line-through text-gray-400' : 'text-gray-800 dark:text-gray-200'}">
            ${task.text}
          </span>
          <div class="flex flex-wrap mt-1 gap-1">
            <span class="priority-badge px-2 py-0.5 text-xs rounded-full ${
              task.priority === 'high' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200' :
              task.priority === 'low' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200' :
              'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200'
            }">
              ${task.priority}
            </span>
            ${task.dueDate ? `
              <span class="due-date-badge px-2 py-0.5 text-xs rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200">
                Due: ${new Date(task.dueDate).toLocaleDateString()}
              </span>
            ` : ''}
            ${task.categories && task.categories.length > 0 ? task.categories.map(cat => `
              <span class="category-badge px-2 py-0.5 text-xs rounded-full bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-200">
                ${cat}
              </span>
            `).join('') : ''}
          </div>
        </div>
        <div class="flex space-x-2">
          <button class="task-edit text-blue-500 hover:text-blue-700 dark:hover:text-blue-400">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button class="task-delete text-red-500 hover:text-red-700 dark:hover:text-red-400">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>
    `;
    
    // Add animation
    setTimeout(() => {
      taskEl.classList.remove('task-enter');
    }, 10);
    
    return taskEl;
  }

  function handleEdit(e) {
    const taskId = parseInt(e.target.closest('li').dataset.id);
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      taskInput.value = task.text;
      taskInput.focus();
      currentEditId = taskId;
      submitBtn.innerHTML = `
        <svg class="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
        Update
      `;
      
      // Set the priority
      priorityBtns.forEach(btn => btn.classList.remove('ring-2', 'ring-offset-2', 'ring-blue-500'));
      document.querySelector(`.priority-btn[data-priority="${task.priority}"]`)
        .classList.add('ring-2', 'ring-offset-2', 'ring-blue-500');
      selectedPriority = task.priority;
      
      // Set due date and categories
      if (task.dueDate) {
        taskDue.value = task.dueDate.split('T')[0];
      } else {
        taskDue.value = '';
      }
      taskCategories.value = task.categories ? task.categories.join(', ') : '';
    }
  }

  function handleDelete(e) {
    const taskId = parseInt(e.target.closest('li').dataset.id);
    tasks = tasks.filter(t => t.id !== taskId);
    if (currentEditId === taskId) resetForm();
    saveTasks();
    renderTasks();
  }

  function handleToggleComplete(e) {
    const taskId = parseInt(e.target.closest('li').dataset.id);
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      task.completed = e.target.checked;
      saveTasks();
      updateCounters();
      
      const taskText = e.target.closest('li').querySelector('span');
      if (taskText) {
        taskText.classList.toggle('line-through');
        taskText.classList.toggle('text-gray-400');
      }
    }
  }

  function updateCounters() {
    totalCount.textContent = tasks.length;
    doneCount.textContent = tasks.filter(t => t.completed).length;
    
    // Priority counts
    document.getElementById('high-count').textContent = 
      tasks.filter(t => t.priority === 'high').length;
    document.getElementById('medium-count').textContent = 
      tasks.filter(t => t.priority === 'medium').length;
    document.getElementById('low-count').textContent = 
      tasks.filter(t => t.priority === 'low').length;
  }

  function saveTasks() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
  }

  function exportTasks() {
    const data = JSON.stringify(tasks);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'todo-backup.json';
    a.click();
  }

  function importTasks(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedTasks = JSON.parse(e.target.result);
        if (Array.isArray(importedTasks)) {
          tasks = importedTasks;
          saveTasks();
          renderTasks();
        } else {
          alert('Invalid file format: Expected an array of tasks');
        }
      } catch (err) {
        alert('Invalid file format: Could not parse JSON');
      }
    };
    reader.readAsText(file);
  }

  function resetForm() {
    taskInput.value = '';
    currentEditId = null;
    taskDue.value = '';
    taskCategories.value = '';
    submitBtn.innerHTML = `
      <svg class="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
      </svg>
      Add
    `;
    
    // Reset priority to medium
    priorityBtns.forEach(btn => btn.classList.remove('ring-2', 'ring-offset-2', 'ring-blue-500'));
    document.querySelector('.priority-btn[data-priority="medium"]')
      .classList.add('ring-2', 'ring-offset-2', 'ring-blue-500');
    selectedPriority = 'medium';
  }

  // Add event listeners to new elements after rendering
  function addTaskEventListeners() {
    document.querySelectorAll('.task-edit').forEach(btn => {
      btn.addEventListener('click', handleEdit);
    });
    document.querySelectorAll('.task-delete').forEach(btn => {
      btn.addEventListener('click', handleDelete);
    });
    document.querySelectorAll('.task-checkbox').forEach(checkbox => {
      checkbox.addEventListener('change', handleToggleComplete);
    });
  }

  // Theme toggle functionality
  const themeToggle = document.getElementById('theme-toggle');
  const themeIcon = document.getElementById('theme-icon');
  const themeIconPath = document.getElementById('theme-icon-path');

  // Check for saved theme preference or use system preference
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  let darkMode = localStorage.getItem('darkMode') === 'true' || 
                (localStorage.getItem('darkMode') === null && prefersDark);

  // Apply the initial theme
  applyTheme();

  // Toggle theme on button click
  themeToggle.addEventListener('click', () => {
    darkMode = !darkMode;
    localStorage.setItem('darkMode', darkMode);
    applyTheme();
  });

  function applyTheme() {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      themeIconPath.setAttribute('d', 'M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z');
    } else {
      document.documentElement.classList.remove('dark');
      themeIconPath.setAttribute('d', 'M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z');
    }
  }
});