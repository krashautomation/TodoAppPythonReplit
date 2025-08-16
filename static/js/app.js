// Task Manager Application JavaScript

class TaskManager {
    constructor() {
        this.tasks = [];
        this.currentFilter = 'all';
        this.editingTask = null;
        this.init();
    }

    init() {
        this.bindEvents();
        this.loadTasks();
    }

    bindEvents() {
        // Form submission
        document.getElementById('taskForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleFormSubmit();
        });

        // Cancel button
        document.getElementById('cancelBtn').addEventListener('click', () => {
            this.cancelEdit();
        });

        // Filter buttons
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.setFilter(e.target.dataset.filter);
            });
        });
    }

    async loadTasks() {
        this.showLoading(true);
        this.hideError();

        try {
            const response = await fetch('/api/tasks');
            const data = await response.json();

            if (data.success) {
                this.tasks = data.tasks;
                this.renderTasks();
                this.updateTaskCount();
            } else {
                this.showError(data.error || 'Failed to load tasks');
            }
        } catch (error) {
            console.error('Error loading tasks:', error);
            this.showError('Failed to connect to server');
        } finally {
            this.showLoading(false);
        }
    }

    async handleFormSubmit() {
        const form = document.getElementById('taskForm');
        const submitBtn = document.getElementById('submitBtn');
        const btnText = submitBtn.querySelector('.btn-text');
        
        // Get form data
        const formData = this.getFormData();
        
        // Validate form
        if (!this.validateForm(formData)) {
            return;
        }

        // Set loading state
        this.setButtonLoading(submitBtn, true);
        btnText.textContent = this.editingTask ? 'Updating...' : 'Adding...';

        try {
            let response;
            if (this.editingTask) {
                // Update existing task
                response = await fetch(`/api/tasks/${this.editingTask.id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(formData)
                });
            } else {
                // Create new task
                response = await fetch('/api/tasks', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(formData)
                });
            }

            const data = await response.json();

            if (data.success) {
                this.showNotification(data.message, 'success');
                this.resetForm();
                this.loadTasks(); // Reload to get updated data
            } else {
                this.showNotification(data.error || 'Operation failed', 'error');
            }
        } catch (error) {
            console.error('Error submitting form:', error);
            this.showNotification('Failed to connect to server', 'error');
        } finally {
            this.setButtonLoading(submitBtn, false);
            btnText.textContent = this.editingTask ? 'Update Task' : 'Add Task';
        }
    }

    getFormData() {
        return {
            title: document.getElementById('taskTitle').value.trim(),
            description: document.getElementById('taskDescription').value.trim(),
            priority: document.getElementById('taskPriority').value,
            due_date: document.getElementById('taskDueDate').value || null
        };
    }

    validateForm(data) {
        const titleInput = document.getElementById('taskTitle');
        const feedback = titleInput.nextElementSibling;
        
        // Reset validation state
        titleInput.classList.remove('is-invalid');
        
        if (!data.title) {
            titleInput.classList.add('is-invalid');
            feedback.textContent = 'Task title is required';
            titleInput.focus();
            return false;
        }

        if (data.title.length > 200) {
            titleInput.classList.add('is-invalid');
            feedback.textContent = 'Task title must be less than 200 characters';
            titleInput.focus();
            return false;
        }

        return true;
    }

    async deleteTask(taskId) {
        if (!confirm('Are you sure you want to delete this task?')) {
            return;
        }

        try {
            const response = await fetch(`/api/tasks/${taskId}`, {
                method: 'DELETE'
            });

            const data = await response.json();

            if (data.success) {
                this.showNotification(data.message, 'success');
                this.loadTasks();
            } else {
                this.showNotification(data.error || 'Failed to delete task', 'error');
            }
        } catch (error) {
            console.error('Error deleting task:', error);
            this.showNotification('Failed to connect to server', 'error');
        }
    }

    async toggleTaskCompletion(taskId) {
        try {
            const response = await fetch(`/api/tasks/${taskId}/toggle`, {
                method: 'PATCH'
            });

            const data = await response.json();

            if (data.success) {
                this.showNotification(data.message, 'success');
                this.loadTasks();
            } else {
                this.showNotification(data.error || 'Failed to update task', 'error');
            }
        } catch (error) {
            console.error('Error toggling task:', error);
            this.showNotification('Failed to connect to server', 'error');
        }
    }

    editTask(task) {
        this.editingTask = task;
        
        // Fill form with task data
        document.getElementById('taskTitle').value = task.title;
        document.getElementById('taskDescription').value = task.description || '';
        document.getElementById('taskPriority').value = task.priority;
        
        if (task.due_date) {
            // Convert ISO string to datetime-local format
            const date = new Date(task.due_date);
            const localISOTime = new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
            document.getElementById('taskDueDate').value = localISOTime;
        } else {
            document.getElementById('taskDueDate').value = '';
        }

        // Update form UI
        const submitBtn = document.getElementById('submitBtn');
        const cancelBtn = document.getElementById('cancelBtn');
        const btnText = submitBtn.querySelector('.btn-text');
        
        submitBtn.innerHTML = '<i class="fas fa-save me-1"></i><span class="btn-text">Update Task</span>';
        submitBtn.classList.remove('btn-primary');
        submitBtn.classList.add('btn-warning');
        cancelBtn.style.display = 'inline-block';

        // Scroll to form
        document.getElementById('taskForm').scrollIntoView({ behavior: 'smooth' });
        document.getElementById('taskTitle').focus();
    }

    cancelEdit() {
        this.editingTask = null;
        this.resetForm();
    }

    resetForm() {
        const form = document.getElementById('taskForm');
        const submitBtn = document.getElementById('submitBtn');
        const cancelBtn = document.getElementById('cancelBtn');
        const titleInput = document.getElementById('taskTitle');
        
        form.reset();
        titleInput.classList.remove('is-invalid');
        
        // Reset form UI
        submitBtn.innerHTML = '<i class="fas fa-plus me-1"></i><span class="btn-text">Add Task</span>';
        submitBtn.classList.remove('btn-warning');
        submitBtn.classList.add('btn-primary');
        cancelBtn.style.display = 'none';
        
        this.editingTask = null;
    }

    renderTasks() {
        const container = document.getElementById('tasksList');
        const filteredTasks = this.getFilteredTasks();

        if (filteredTasks.length === 0) {
            this.showEmptyState(true);
            container.innerHTML = '';
            return;
        }

        this.showEmptyState(false);

        const tasksHTML = filteredTasks.map(task => this.createTaskHTML(task)).join('');
        container.innerHTML = tasksHTML;

        // Add event listeners to task actions
        this.bindTaskEvents();
    }

    createTaskHTML(task) {
        const isCompleted = task.completed;
        const priorityClass = `priority-${task.priority}`;
        const completedClass = isCompleted ? 'task-completed' : '';
        const priorityBadge = this.getPriorityBadgeHTML(task.priority);
        const dueDateHTML = this.getDueDateHTML(task.due_date);
        
        const createdDate = new Date(task.created_at).toLocaleDateString();
        const updatedDate = new Date(task.updated_at).toLocaleDateString();

        return `
            <div class="card task-card ${priorityClass} ${completedClass}" data-task-id="${task.id}">
                <div class="card-body">
                    <div class="d-flex justify-content-between align-items-start mb-2">
                        <h5 class="card-title task-title mb-1">${this.escapeHtml(task.title)}</h5>
                        <div class="task-actions">
                            <div class="btn-group-vertical btn-group-sm" role="group">
                                <button class="btn ${isCompleted ? 'btn-outline-warning' : 'btn-outline-success'} toggle-task" 
                                        title="${isCompleted ? 'Mark as incomplete' : 'Mark as complete'}">
                                    <i class="fas ${isCompleted ? 'fa-undo' : 'fa-check'}"></i>
                                </button>
                                <button class="btn btn-outline-primary edit-task" title="Edit task">
                                    <i class="fas fa-edit"></i>
                                </button>
                                <button class="btn btn-outline-danger delete-task" title="Delete task">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                    
                    ${task.description ? `<p class="card-text task-description text-muted">${this.escapeHtml(task.description)}</p>` : ''}
                    
                    <div class="d-flex flex-wrap gap-2 align-items-center">
                        ${priorityBadge}
                        ${isCompleted ? '<span class="badge bg-success">Completed</span>' : '<span class="badge bg-secondary">Pending</span>'}
                        ${dueDateHTML}
                    </div>
                    
                    <div class="mt-2 text-muted small">
                        <i class="fas fa-calendar-plus me-1"></i>Created: ${createdDate}
                        ${updatedDate !== createdDate ? ` | <i class="fas fa-calendar-edit me-1"></i>Updated: ${updatedDate}` : ''}
                    </div>
                </div>
            </div>
        `;
    }

    getPriorityBadgeHTML(priority) {
        const priorityConfig = {
            high: { class: 'priority-high-badge', icon: 'fa-exclamation', text: 'High' },
            medium: { class: 'priority-medium-badge', icon: 'fa-minus', text: 'Medium' },
            low: { class: 'priority-low-badge', icon: 'fa-arrow-down', text: 'Low' }
        };

        const config = priorityConfig[priority] || priorityConfig.medium;
        return `<span class="badge ${config.class} priority-badge">
                    <i class="fas ${config.icon} me-1"></i>${config.text}
                </span>`;
    }

    getDueDateHTML(dueDate) {
        if (!dueDate) return '';

        const due = new Date(dueDate);
        const now = new Date();
        const diffTime = due - now;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        let className = 'due-date';
        let icon = 'fa-calendar';

        if (diffDays < 0) {
            className += ' overdue';
            icon = 'fa-exclamation-triangle';
        } else if (diffDays <= 1) {
            className += ' due-soon';
            icon = 'fa-clock';
        }

        const formatOptions = { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        };

        return `<span class="${className}">
                    <i class="fas ${icon} me-1"></i>
                    Due: ${due.toLocaleDateString('en-US', formatOptions)}
                </span>`;
    }

    bindTaskEvents() {
        // Toggle completion
        document.querySelectorAll('.toggle-task').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const taskId = e.target.closest('.task-card').dataset.taskId;
                this.toggleTaskCompletion(parseInt(taskId));
            });
        });

        // Edit task
        document.querySelectorAll('.edit-task').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const taskId = e.target.closest('.task-card').dataset.taskId;
                const task = this.tasks.find(t => t.id === parseInt(taskId));
                if (task) {
                    this.editTask(task);
                }
            });
        });

        // Delete task
        document.querySelectorAll('.delete-task').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const taskId = e.target.closest('.task-card').dataset.taskId;
                this.deleteTask(parseInt(taskId));
            });
        });
    }

    getFilteredTasks() {
        switch (this.currentFilter) {
            case 'completed':
                return this.tasks.filter(task => task.completed);
            case 'pending':
                return this.tasks.filter(task => !task.completed);
            default:
                return this.tasks;
        }
    }

    setFilter(filter) {
        this.currentFilter = filter;
        
        // Update filter buttons
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.filter === filter);
        });

        this.renderTasks();
        this.updateTaskCount();
    }

    updateTaskCount() {
        const filteredTasks = this.getFilteredTasks();
        const countElement = document.getElementById('taskCount');
        const count = filteredTasks.length;
        countElement.textContent = `${count} task${count !== 1 ? 's' : ''}`;
    }

    showLoading(show) {
        document.getElementById('loadingState').style.display = show ? 'block' : 'none';
    }

    showError(message) {
        const errorState = document.getElementById('errorState');
        const errorMessage = document.getElementById('errorMessage');
        errorMessage.textContent = message;
        errorState.style.display = 'block';
    }

    hideError() {
        document.getElementById('errorState').style.display = 'none';
    }

    showEmptyState(show) {
        document.getElementById('emptyState').style.display = show ? 'block' : 'none';
    }

    setButtonLoading(button, loading) {
        if (loading) {
            button.classList.add('btn-loading');
            button.disabled = true;
        } else {
            button.classList.remove('btn-loading');
            button.disabled = false;
        }
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `alert alert-${type === 'error' ? 'danger' : type === 'success' ? 'success' : 'info'} alert-dismissible fade show position-fixed`;
        notification.style.cssText = 'top: 20px; right: 20px; z-index: 1050; max-width: 300px;';
        
        const icon = type === 'error' ? 'fa-exclamation-triangle' : type === 'success' ? 'fa-check-circle' : 'fa-info-circle';
        
        notification.innerHTML = `
            <i class="fas ${icon} me-2"></i>
            ${this.escapeHtml(message)}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;

        document.body.appendChild(notification);

        // Auto remove after 5 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 5000);
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new TaskManager();
});
