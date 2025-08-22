document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const todoForm = document.getElementById('todo-form');
    const taskInput = document.getElementById('task');
    const dateInput = document.getElementById('date');
    const todoList = document.getElementById('todo-list');
    const filterButtons = document.querySelectorAll('.filter-btn');
    const taskError = document.getElementById('task-error');
    const dateError = document.getElementById('date-error');
    
    let currentFilter = 'all';
    let tasks = [];
    
    // Initialize the app
    init();
    
    function init() {
        loadTasks();
        renderTasks();
        setupEventListeners();
    }
    
    function setupEventListeners() {
        // Form submission
        todoForm.addEventListener('submit', function(e) {
            e.preventDefault();
            addTask();
        });
        
        // Filter buttons
        filterButtons.forEach(button => {
            button.addEventListener('click', function() {
                // Update active state
                filterButtons.forEach(btn => btn.classList.remove('active'));
                this.classList.add('active');
                
                // Set current filter and re-render
                currentFilter = this.dataset.filter;
                renderTasks();
            });
        });
    }
    
    function validateForm() {
        let isValid = true;
        
        // Validate task
        if (taskInput.value.trim() === '') {
            taskError.textContent = 'Task is required';
            isValid = false;
        } else if (taskInput.value.trim().length < 3) {
            taskError.textContent = 'Task must be at least 3 characters';
            isValid = false;
        } else {
            taskError.textContent = '';
        }
        
        // Validate date
        if (dateInput.value === '') {
            dateError.textContent = 'Date is required';
            isValid = false;
        } else {
            const selectedDate = new Date(dateInput.value);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            
            if (selectedDate < today) {
                dateError.textContent = 'Date cannot be in the past';
                isValid = false;
            } else {
                dateError.textContent = '';
            }
        }
        
        return isValid;
    }
    
    function addTask() {
        if (!validateForm()) return;
        
        const newTask = {
            id: Date.now(),
            text: taskInput.value.trim(),
            date: dateInput.value,
            completed: false,
            createdAt: new Date().toISOString()
        };
        
        tasks.push(newTask);
        saveTasks();
        renderTasks();
        
        // Reset form
        todoForm.reset();
        taskError.textContent = '';
        dateError.textContent = '';
    }
    
    function renderTasks() {
        // Clear the list
        todoList.innerHTML = '';
        
        // Filter tasks based on current filter
        let filteredTasks = [];
        
        switch (currentFilter) {
            case 'pending':
                filteredTasks = tasks.filter(task => !task.completed);
                break;
            case 'completed':
                filteredTasks = tasks.filter(task => task.completed);
                break;
            default:
                filteredTasks = [...tasks];
        }
        
        // Sort tasks by date (ascending)
        filteredTasks.sort((a, b) => new Date(a.date) - new Date(b.date));
        
        // Display tasks or empty message
        if (filteredTasks.length === 0) {
            const emptyMessage = document.createElement('li');
            emptyMessage.className = 'empty-message';
            emptyMessage.textContent = currentFilter === 'all' 
                ? 'No tasks yet. Add your first task!' 
                : `No ${currentFilter} tasks.`;
            todoList.appendChild(emptyMessage);
        } else {
            filteredTasks.forEach(task => {
                const taskItem = createTaskElement(task);
                todoList.appendChild(taskItem);
            });
        }
    }
    
    function createTaskElement(task) {
        const taskItem = document.createElement('li');
        taskItem.className = 'todo-item';
        if (task.completed) taskItem.classList.add('completed');
        taskItem.dataset.id = task.id;
        
        // Format date for display
        const formattedDate = formatDate(task.date);
        
        taskItem.innerHTML = `
            <div class="task-info">
                <div class="task-text">${task.text}</div>
                <div class="task-date">Due: ${formattedDate}</div>
            </div>
            <div class="task-actions">
                <button class="action-btn complete-btn">${task.completed ? 'Undo' : 'Complete'}</button>
                <button class="action-btn delete-btn">Delete</button>
            </div>
        `;
        
        // Add event listeners to the buttons
        const completeBtn = taskItem.querySelector('.complete-btn');
        const deleteBtn = taskItem.querySelector('.delete-btn');
        
        completeBtn.addEventListener('click', () => toggleComplete(task.id));
        deleteBtn.addEventListener('click', () => deleteTask(task.id));
        
        return taskItem;
    }
    
    function toggleComplete(taskId) {
        const taskIndex = tasks.findIndex(task => task.id === taskId);
        if (taskIndex !== -1) {
            tasks[taskIndex].completed = !tasks[taskIndex].completed;
            saveTasks();
            renderTasks();
        }
    }
    
    function deleteTask(taskId) {
        tasks = tasks.filter(task => task.id !== taskId);
        saveTasks();
        renderTasks();
    }
    
    function formatDate(dateString) {
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    }
    
    function saveTasks() {
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }
    
    function loadTasks() {
        const savedTasks = localStorage.getItem('tasks');
        if (savedTasks) {
            tasks = JSON.parse(savedTasks);
        }
    }
});
