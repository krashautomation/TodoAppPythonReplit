# TaskFlow

TaskFlow is a simple and intuitive web-based task manager application built with Flask and a modern frontend. It allows users to create, manage, and track their tasks with ease, featuring a clean and responsive user interface.

## Features

- **Create, Update, and Delete Tasks**: Easily add new tasks, edit existing ones, or remove them when completed.
- **Task Prioritization**: Assign priority levels (Low, Medium, High) to tasks to better organize your workflow.
- **Due Dates**: Set due dates for tasks to keep track of deadlines.
- **Filtering**: Filter tasks by their status (All, Pending, Completed) to focus on what matters most.
- **Responsive Design**: A mobile-friendly interface that works on any device.
- **Real-time Updates**: The task list updates automatically after any operation without a page reload.

## Technologies Used

- **Backend**:
  - Python
  - Flask
  - Flask-SQLAlchemy
- **Frontend**:
  - HTML5
  - CSS3
  - JavaScript (ES6+)
  - Bootstrap 5
  - Font Awesome
- **Database**:
  - PostgreSQL (or any other database compatible with SQLAlchemy)

## Installation and Setup

To get the project running locally, follow these steps:

1. **Clone the repository**:
   ```bash
   git clone https://github.com/your-username/TaskFlow.git
   cd TaskFlow
   ```

2. **Create a virtual environment and activate it**:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows, use `venv\Scripts\activate`
   ```

3. **Install the dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

4. **Set up the environment variables**:
   - Create a `.env` file in the root directory.
   - Add the following variables:
     ```
     SESSION_SECRET=your_secret_key
     DATABASE_URL=your_database_url
     ```
   - Replace `your_secret_key` with a random secret key and `your_database_url` with the connection string for your database.

5. **Run the application**:
   ```bash
   python main.py
   ```
   The application will be available at `http://127.0.0.1:5000`.

## API Endpoints

The application provides a RESTful API for managing tasks.

| Method | Endpoint                     | Description                               |
|--------|------------------------------|-------------------------------------------|
| GET    | `/api/tasks`                 | Get all tasks with optional filtering.    |
| POST   | `/api/tasks`                 | Create a new task.                        |
| PUT    | `/api/tasks/<int:task_id>`   | Update an existing task.                  |
| DELETE | `/api/tasks/<int:task_id>`   | Delete a task.                            |
| PATCH  | `/api/tasks/<int:task_id>/toggle` | Toggle the completion status of a task. |

## Folder Structure

```
TaskFlow/
├── .replit
├── app.py
├── main.py
├── models.py
├── pyproject.toml
├── replit.md
├── routes.py
├── uv.lock
├── __pycache__/
├── .git/
├── .local/
├── static/
│   ├── css/
│   │   └── style.css
│   └── js/
│       └── app.js
└── templates/
    └── index.html
```

