document.addEventListener('DOMContentLoaded', () => {
    // DOM elements
    const taskForm = document.getElementById('task-form');
    const taskInput = document.getElementById('task-input');
    const taskList = document.getElementById('task-list');
    const taskCount = document.getElementById('task-count');
    const completedCount = document.getElementById('completed-count');
    const clearAllBtn = document.getElementById('clear-all');
    const submitBtn = document.getElementById('submit-btn');

    // State
    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    let currentEditId = null;

    // Initialize
    renderTasks();
    taskInput.focus();

    // Event Listeners
    taskForm.addEventListener('submit', handleSubmit);
    clearAllBtn.addEventListener('click', handleClearAll);
    taskList.addEventListener('click', handleTaskActions);
    taskList.addEventListener('change', handleToggleComplete);

    // Functions
    function handleSubmit(e) {
        e.preventDefault();
        const text = taskInput.value.trim();
        
        if (!text) return;

        if (currentEditId) {
            // Update existing task
            const task = tasks.find(t => t.id === currentEditId);
            if (task) {
                task.text = text;
                task.completed = false;
            }
        } else {
            // Add new task
            tasks.push({
                id: Date.now(),
                text,
                completed: false,
                createdAt: new Date().toISOString()
            });
        }
        
        saveTasks();
        resetForm();
        renderTasks();
    }

    function handleClearAll() {
        if (tasks.length > 0 && confirm('Are you sure you want to clear all tasks?')) {
            tasks = [];
            saveTasks();
            renderTasks();
            resetForm();
        }
    }

    function handleTaskActions(e) {
        // Check if click was on edit or delete button
        if (e.target.classList.contains('edit-btn') || e.target.closest('.edit-btn')) {
            const taskId = parseInt(e.target.closest('li').dataset.id);
            const task = tasks.find(t => t.id === taskId);
            if (task) {
                taskInput.value = task.text;
                taskInput.focus();
                currentEditId = taskId;
                submitBtn.innerHTML = `
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                    </svg>
                    Update
                `;
                submitBtn.classList.remove('bg-blue-600', 'hover:bg-blue-700');
                submitBtn.classList.add('bg-green-600', 'hover:bg-green-700');
            }
        } 
        else if (e.target.classList.contains('delete-btn') || e.target.closest('.delete-btn')) {
            const taskId = parseInt(e.target.closest('li').dataset.id);
            tasks = tasks.filter(t => t.id !== taskId);
            saveTasks();
            renderTasks();
            if (currentEditId === taskId) resetForm();
        }
    }

    function handleToggleComplete(e) {
        if (e.target.classList.contains('task-checkbox')) {
            const taskId = parseInt(e.target.closest('li').dataset.id);
            const task = tasks.find(t => t.id === taskId);
            if (task) {
                task.completed = e.target.checked;
                saveTasks();
                updateCounters();
                const taskText = e.target.closest('li').querySelector('.task-text');
                if (taskText) {
                    taskText.classList.toggle('line-through', task.completed);
                    taskText.classList.toggle('text-gray-400', task.completed);
                }
            }
        }
    }

    function renderTasks() {
        if (tasks.length === 0) {
            taskList.innerHTML = `
                <li class="text-center py-6 text-gray-500">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 mx-auto opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    <p class="mt-2">No tasks yet</p>
                </li>
            `;
        } else {
            taskList.innerHTML = '';
            tasks.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt)).forEach(task => {
                const taskEl = document.createElement('li');
                taskEl.className = 'group hover:bg-gray-50 transition-colors';
                taskEl.dataset.id = task.id;
                
                taskEl.innerHTML = `
                    <div class="flex items-center justify-between p-3">
                        <div class="flex items-center flex-1 min-w-0">
                            <input 
                                type="checkbox" 
                                ${task.completed ? 'checked' : ''}
                                class="task-checkbox h-5 w-5 text-blue-600 rounded focus:ring-blue-500 mr-3"
                            >
                            <span class="task-text truncate ${task.completed ? 'line-through text-gray-400' : 'text-gray-800'}">
                                ${task.text}
                            </span>
                        </div>
                        <div class="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button 
                                type="button"
                                class="edit-btn text-blue-500 hover:text-blue-700 p-1 rounded-full hover:bg-blue-50"
                                title="Edit task"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                            </button>
                            <button 
                                type="button"
                                class="delete-btn text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-50"
                                title="Delete task"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                            </button>
                        </div>
                    </div>
                `;
                taskList.appendChild(taskEl);
            });
        }
        
        updateCounters();
    }

    function updateCounters() {
        taskCount.textContent = tasks.length;
        completedCount.textContent = tasks.filter(t => t.completed).length;
    }

    function saveTasks() {
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }

    function resetForm() {
        taskInput.value = '';
        currentEditId = null;
        submitBtn.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clip-rule="evenodd" />
            </svg>
            Add
        `;
        submitBtn.classList.remove('bg-green-600', 'hover:bg-green-700');
        submitBtn.classList.add('bg-blue-600', 'hover:bg-blue-700');
        taskInput.focus();
    }
});