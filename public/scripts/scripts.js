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
// In your handleSubmit function, make sure to properly capture all task properties
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

    // Get all task properties
    const dueDate = document.getElementById('task-due').value || null;
    const categories = document.getElementById('task-categories').value
        .split(',')
        .map(c => c.trim())
        .filter(c => c); // Remove empty categories

    if (currentEditId) {
        // Update existing task
        const task = tasks.find(t => t.id === currentEditId);
        if (task) {
            task.text = text;
            task.priority = selectedPriority;
            task.dueDate = dueDate;
            task.categories = categories;
        }
    } else {
        // Add new task with all properties
        tasks.push({
            id: Date.now(),
            text,
            completed: false,
            priority: selectedPriority,
            dueDate,
            categories,
            createdAt: new Date().toISOString()
        });
    }
    
    saveTasks();
    resetForm();
    renderTasks();
}

// Update your renderTasks function to properly display all task properties
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
        // Sort by priority (high first) then by creation date
        const sortedTasks = [...tasks].sort((a, b) => {
            const priorityOrder = { high: 3, medium: 2, low: 1 };
            return (priorityOrder[b.priority] - priorityOrder[a.priority]) || 
                   (new Date(a.createdAt) - new Date(b.createdAt));
        });

        sortedTasks.forEach(task => {
            const taskEl = document.createElement('li');
            taskEl.className = 'task-item p-4 bg-white dark:bg-gray-700 rounded-lg shadow mb-3 transition-all hover:shadow-md';
            taskEl.dataset.id = task.id;
            
            // Format due date if it exists
            const formattedDueDate = task.dueDate 
                ? new Date(task.dueDate).toLocaleDateString() 
                : 'No due date';
            
            // Format categories if they exist
            const formattedCategories = task.categories && task.categories.length > 0 
                ? task.categories.join(', ') 
                : 'No categories';
            
            taskEl.innerHTML = `
                <div class="flex items-start">
                    <button class="complete-btn mr-3" data-id="${task.id}">
                        <svg class="w-6 h-6 ${task.completed ? 'text-green-500' : 'text-gray-400'}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="${task.completed ? 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' : 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z'}" />
                        </svg>
                    </button>
                    <div class="flex-1">
                        <div class="flex justify-between items-start">
                            <span class="${task.completed ? 'line-through text-gray-500 dark:text-gray-400' : 'text-gray-800 dark:text-gray-200'}">
                                ${task.text}
                            </span>
                            <div class="flex space-x-2">
                                <button class="task-edit text-blue-500 hover:text-blue-700 dark:hover:text-blue-400" data-id="${task.id}">
                                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                    </svg>
                                </button>
                                <button class="task-delete text-red-500 hover:text-red-700 dark:hover:text-red-400" data-id="${task.id}">
                                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                        <div class="mt-2 flex flex-wrap items-center gap-2 text-sm">
                            <span class="px-2 py-1 rounded-full text-xs font-medium ${
                                task.priority === 'high' ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200' :
                                task.priority === 'medium' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200' :
                                'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200'
                            }">
                                ${task.priority} priority
                            </span>
                            ${task.dueDate ? `
                            <span class="flex items-center text-gray-500 dark:text-gray-400">
                                <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                ${formattedDueDate}
                            </span>
                            ` : ''}
                            ${task.categories && task.categories.length > 0 ? `
                            <span class="flex items-center text-gray-500 dark:text-gray-400">
                                <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                                </svg>
                                ${formattedCategories}
                            </span>
                            ` : ''}
                        </div>
                    </div>
                </div>
            `;
            taskList.appendChild(taskEl);
        });

        // Add event listeners to new elements
        document.querySelectorAll('.complete-btn').forEach(btn => {
            btn.addEventListener('click', toggleTaskComplete);
        });
        document.querySelectorAll('.task-edit').forEach(btn => {
            btn.addEventListener('click', handleEdit);
        });
        document.querySelectorAll('.task-delete').forEach(btn => {
            btn.addEventListener('click', handleDelete);
        });
    }
    
    updateCounters();
}

// Update your handleEdit function to populate all fields
function handleEdit(e) {
    const taskId = parseInt(e.target.closest('button').dataset.id);
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
        
        // Set all fields
        document.getElementById('task-due').value = task.dueDate || '';
        document.getElementById('task-categories').value = task.categories?.join(', ') || '';
        
        // Set the priority
        priorityBtns.forEach(btn => btn.classList.remove('ring-2', 'ring-offset-2', 'ring-blue-500'));
        document.querySelector(`.priority-btn[data-priority="${task.priority}"]`)
            .classList.add('ring-2', 'ring-offset-2', 'ring-blue-500');
        selectedPriority = task.priority;
    }
}

  function handleClearAll() {
    if (tasks.length === 0) return;
    
    if (confirm('Are you sure you want to clear all tasks?')) {
      tasks = [];
      saveTasks();
      renderTasks();
    }
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
      // Sort by priority (high first) then by creation date
      const sortedTasks = [...tasks].sort((a, b) => {
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        return (priorityOrder[b.priority] - priorityOrder[a.priority]) || 
               (new Date(a.createdAt) - new Date(b.createdAt));
      });

      sortedTasks.forEach(task => {
        const taskEl = document.createElement('li');
        taskEl.className = 'flex items-center justify-between p-3 bg-white dark:bg-gray-700 rounded-lg';
        taskEl.dataset.id = task.id;
        
        taskEl.innerHTML = `
          <div class="flex items-center flex-1">
            <input 
              type="checkbox" 
              ${task.completed ? 'checked' : ''}
              class="task-checkbox h-5 w-5 text-blue-600 rounded mr-3"
            >
            <span class="${task.completed ? 'line-through text-gray-400' : 'text-gray-800 dark:text-gray-200'}">
              ${task.text}
            </span>
            <span class="priority-badge ml-2 px-2 py-0.5 text-xs rounded-full ${
              task.priority === 'high' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200' :
              task.priority === 'low' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200' :
              'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200'
            }">
              ${task.priority}
            </span>
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
        `;
        taskList.appendChild(taskEl);
      });

      // Add event listeners to new elements
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
    
    updateCounters();
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
  }

  function saveTasks() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
  }

  function resetForm() {
    taskInput.value = '';
    currentEditId = null;
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
});
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

// In scripts.js
function sortTasks(criteria) {
  const sortedTasks = [...tasks].sort((a, b) => {
    if (criteria === 'priority') {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    } else if (criteria === 'date') {
      return new Date(a.createdAt) - new Date(b.createdAt);
    } else if (criteria === 'completed') {
      return a.completed - b.completed;
    }
    return 0;
  });
  tasks = sortedTasks;
  renderTasks();
}

// Add event listener:
document.getElementById('sort-select').addEventListener('change', (e) => {
  sortTasks(e.target.value);
});


// Add to scripts.js
function searchTasks(query) {
  if (!query) {
    renderTasks();
    return;
  }
  const filtered = tasks.filter(task => 
    task.text.toLowerCase().includes(query.toLowerCase())
  );
  renderFilteredTasks(filtered);
}

// Add event listener:
document.getElementById('task-search').addEventListener('input', (e) => {
  searchTasks(e.target.value);
});
// Add to task object:
categories: document.getElementById('task-categories').value.split(',').map(c => c.trim())



// Add filtering by category
function filterByCategory(category) {
  const filtered = tasks.filter(task => 
    task.categories?.includes(category)
  );
  renderFilteredTasks(filtered);
}


// Export function
// Add this to your existing JavaScript code

// Export tasks to JSON file
// 1. First, ensure your tasks array is properly initialized
let tasks = JSON.parse(localStorage.getItem('tasks')) || [];

// 2. Enhanced export function with better error handling
function exportTasks() {
    try {
        console.log('Current tasks:', tasks); // Debug log
        
        // Validate tasks array
        if (!Array.isArray(tasks)) {
            throw new Error('Tasks is not an array');
        }
        
        // Stringify with error handling
        let dataStr;
        try {
            dataStr = JSON.stringify(tasks, null, 2);
            if (!dataStr) throw new Error('Stringify returned empty result');
        } catch (stringifyError) {
            console.error('JSON.stringify error:', stringifyError);
            throw new Error('Failed to convert tasks to JSON');
        }
        
        // Create download link
        const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`;
        const fileName = `tasks-${new Date().toISOString().slice(0, 10)}.json`;
        
        // Create and trigger download
        const link = document.createElement('a');
        link.href = dataUri;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        console.log('Export successful'); // Debug log
        alert('Tasks exported successfully!'); // Simple feedback
        
    } catch (error) {
        console.error('Export failed:', error);
        alert(`Export failed: ${error.message}`);
    }
}

// 3. Proper event listener attachment
document.addEventListener('DOMContentLoaded', () => {
    // Other initialization code...
    
    // Get the export button properly
    const exportBtn = document.getElementById('export-btn');
    if (!exportBtn) {
        console.error('Export button not found!');
        return;
    }
    
    // Remove any existing listeners to avoid duplicates
    exportBtn.replaceWith(exportBtn.cloneNode(true));
    
    // Add fresh event listener
    document.getElementById('export-btn').addEventListener('click', exportTasks);
    
    console.log('Export button listener attached'); // Debug log
});
// Helper function to show toast notifications (optional but recommended)
function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `fixed bottom-4 right-4 px-4 py-2 rounded-lg shadow-lg text-white ${
        type === 'success' ? 'bg-green-500' : 
        type === 'error' ? 'bg-red-500' : 
        'bg-blue-500'
    }`;
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.classList.add('opacity-0', 'transition-opacity', 'duration-300');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Add event listener for export button
document.getElementById('export-btn').addEventListener('click', exportTasks);
// Import function
function importTasks(file) {
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      tasks = JSON.parse(e.target.result);
      saveTasks();
      renderTasks();
    } catch (err) {
      alert('Invalid file format');
    }
  };
  reader.readAsText(file);
}



// Add event listeners:
document.getElementById('export-btn').addEventListener('click', exportTasks);
document.getElementById('import-btn').addEventListener('click', () => {
  document.getElementById('import-input').click();
});
document.getElementById('import-input').addEventListener('change', (e) => {
  if (e.target.files[0]) importTasks(e.target.files[0]);
});


// Replace your current clear all with this:
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
// Update your updateCounters function:
function updateCounters() {
  totalCount.textContent = tasks.length;
  doneCount.textContent = tasks.filter(t => t.completed).length;
  
  // Add priority counts
  const highCount = tasks.filter(t => t.priority === 'high').length;
  const mediumCount = tasks.filter(t => t.priority === 'medium').length;
  const lowCount = tasks.filter(t => t.priority === 'low').length;
  
  document.getElementById('high-count').textContent = highCount;
  document.getElementById('medium-count').textContent = mediumCount;
  document.getElementById('low-count').textContent = lowCount;
}

// Add this to your existing JavaScript file

// AI Suggestion Functionality
document.getElementById('ai-suggest-btn').addEventListener('click', generateAISuggestions);
document.getElementById('close-ai-modal').addEventListener('click', () => {
    document.getElementById('ai-suggest-modal').classList.add('hidden');
});

async function generateAISuggestions() {
    const modal = document.getElementById('ai-suggest-modal');
    const content = document.getElementById('ai-suggestions-content');
    const applyBtn = document.getElementById('apply-suggestion');
    
    // Show loading state
    modal.classList.remove('hidden');
    applyBtn.classList.add('hidden');
    content.innerHTML = `
        <div class="animate-pulse flex space-x-4">
            <div class="flex-1 space-y-4 py-1">
                <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                <div class="space-y-2">
                    <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
                </div>
            </div>
        </div>
    `;
    
    try {
        // Prepare task data for AI analysis
        const taskData = {
            currentTasks: tasks.map(task => ({
                text: task.text,
                priority: task.priority,
                completed: task.completed,
                dueDate: task.dueDate
            })),
            stats: {
                total: tasks.length,
                completed: tasks.filter(t => t.completed).length,
                highPriority: tasks.filter(t => t.priority === 'high').length,
                overdue: tasks.filter(t => t.dueDate && new Date(t.dueDate) < new Date()).length
            }
        };
        
        // In a real app, you would call your AI API here
        // For this example, we'll use mock suggestions
        const suggestions = await getMockAISuggestions(taskData);
        
        // Display suggestions
        content.innerHTML = `
            <div class="space-y-4">
                ${suggestions.map((suggestion, index) => `
                    <div class="p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
                        <h4 class="font-medium mb-2">${suggestion.title}</h4>
                        <p class="text-sm text-gray-600 dark:text-gray-300">${suggestion.description}</p>
                        ${suggestion.action ? `
                            <button data-action="${index}" class="mt-2 text-sm px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200 rounded-full hover:bg-purple-200 dark:hover:bg-purple-800/50">
                                ${suggestion.actionText}
                            </button>
                        ` : ''}
                    </div>
                `).join('')}
            </div>
        `;
        
        // Add event listeners to action buttons
        document.querySelectorAll('[data-action]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const actionIndex = e.target.getAttribute('data-action');
                handleAIAction(suggestions[actionIndex].action);
            });
        });
        
    } catch (error) {
        console.error('AI suggestion error:', error);
        content.innerHTML = `
            <div class="p-4 bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-200 rounded-lg">
                Failed to get AI suggestions. Please try again later.
            </div>
        `;
    }
}

// Mock AI function - replace with actual API call in production
async function getMockAISuggestions(taskData) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const suggestions = [];
    
    // Suggestion 1: Prioritization
    if (taskData.stats.highPriority > 3) {
        suggestions.push({
            title: "Too many high-priority tasks",
            description: "You have several high-priority tasks. Consider delegating some or breaking them into smaller tasks.",
            actionText: "See delegation suggestions",
            action: () => {
                // This would be more sophisticated in a real app
                alert("Consider which tasks could be delegated to team members or automated.");
            }
        });
    }
    
    // Suggestion 2: Overdue tasks
    const overdueTasks = taskData.currentTasks.filter(t => t.dueDate && new Date(t.dueDate) < new Date() && !t.completed);
    if (overdueTasks.length > 0) {
        suggestions.push({
            title: "Overdue tasks",
            description: `You have ${overdueTasks.length} overdue task${overdueTasks.length > 1 ? 's' : ''}. Focus on completing these first.`,
            actionText: "View overdue tasks",
            action: () => {
                document.getElementById('task-search').value = 'overdue:true';
                document.getElementById('task-search').dispatchEvent(new Event('input'));
                document.getElementById('ai-suggest-modal').classList.add('hidden');
            }
        });
    }
    
    // Suggestion 3: Task distribution
    if (taskData.currentTasks.length > 10) {
        const completionRate = (taskData.stats.completed / taskData.stats.total) * 100;
        suggestions.push({
            title: completionRate < 30 ? "Low completion rate" : "Good progress!",
            description: completionRate < 30 
                ? `Your completion rate is ${Math.round(completionRate)}%. Try focusing on fewer tasks at a time.` 
                : `Your completion rate is ${Math.round(completionRate)}%. Keep up the good work!`,
            action: null,
            actionText: null
        });
    }
    
    // Default suggestion if no others apply
    if (suggestions.length === 0) {
        suggestions.push({
            title: "General productivity tip",
            description: "Consider time-blocking your schedule to dedicate specific periods for different types of tasks.",
            actionText: "Learn about time-blocking",
            action: () => {
                window.open('https://en.wikipedia.org/wiki/Time_blocking', '_blank');
            }
        });
    }
    
    return suggestions;
}

function handleAIAction(action) {
    if (typeof action === 'function') {
        action();
    } else {
        console.log('No action defined for this suggestion');
    }
    document.getElementById('ai-suggest-modal').classList.add('hidden');
}