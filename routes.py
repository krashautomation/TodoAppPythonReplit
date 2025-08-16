from flask import render_template, request, jsonify, abort
from datetime import datetime
from app import app, db
from models import Task
import logging


@app.route('/')
def index():
    """Render the main task manager page"""
    return render_template('index.html')


@app.route('/api/tasks', methods=['GET'])
def get_tasks():
    """Get all tasks with optional filtering"""
    try:
        # Get query parameters for filtering
        completed = request.args.get('completed')
        priority = request.args.get('priority')
        
        # Build query
        query = Task.query
        
        if completed is not None:
            completed_bool = completed.lower() == 'true'
            query = query.filter(Task.completed == completed_bool)
            
        if priority:
            query = query.filter(Task.priority == priority)
        
        # Order by created_at descending (newest first)
        tasks = query.order_by(Task.created_at.desc()).all()
        
        return jsonify({
            'success': True,
            'tasks': [task.to_dict() for task in tasks],
            'count': len(tasks)
        })
    except Exception as e:
        logging.error(f"Error fetching tasks: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Failed to fetch tasks'
        }), 500


@app.route('/api/tasks', methods=['POST'])
def create_task():
    """Create a new task"""
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({
                'success': False,
                'error': 'No data provided'
            }), 400
            
        # Validate required fields
        if not data.get('title'):
            return jsonify({
                'success': False,
                'error': 'Title is required'
            }), 400
            
        if len(data.get('title', '').strip()) == 0:
            return jsonify({
                'success': False,
                'error': 'Title cannot be empty'
            }), 400
        
        # Create new task
        task = Task(
            title=data['title'].strip(),
            description=data.get('description', '').strip(),
            priority=data.get('priority', 'medium'),
            completed=data.get('completed', False)
        )
        
        # Handle due_date if provided
        if data.get('due_date'):
            try:
                task.due_date = datetime.fromisoformat(data['due_date'].replace('Z', '+00:00'))
            except ValueError:
                return jsonify({
                    'success': False,
                    'error': 'Invalid due date format'
                }), 400
        
        # Validate priority
        if task.priority not in ['low', 'medium', 'high']:
            task.priority = 'medium'
        
        db.session.add(task)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'task': task.to_dict(),
            'message': 'Task created successfully'
        }), 201
        
    except Exception as e:
        db.session.rollback()
        logging.error(f"Error creating task: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Failed to create task'
        }), 500


@app.route('/api/tasks/<int:task_id>', methods=['PUT'])
def update_task(task_id):
    """Update an existing task"""
    try:
        task = Task.query.get(task_id)
        if not task:
            return jsonify({
                'success': False,
                'error': 'Task not found'
            }), 404
            
        data = request.get_json()
        if not data:
            return jsonify({
                'success': False,
                'error': 'No data provided'
            }), 400
        
        # Update task fields if provided
        if 'title' in data:
            if not data['title'] or len(data['title'].strip()) == 0:
                return jsonify({
                    'success': False,
                    'error': 'Title cannot be empty'
                }), 400
            task.title = data['title'].strip()
            
        if 'description' in data:
            task.description = data['description'].strip() if data['description'] else ''
            
        if 'completed' in data:
            task.completed = bool(data['completed'])
            
        if 'priority' in data:
            if data['priority'] in ['low', 'medium', 'high']:
                task.priority = data['priority']
        
        if 'due_date' in data:
            if data['due_date']:
                try:
                    task.due_date = datetime.fromisoformat(data['due_date'].replace('Z', '+00:00'))
                except ValueError:
                    return jsonify({
                        'success': False,
                        'error': 'Invalid due date format'
                    }), 400
            else:
                task.due_date = None
        
        # Update the updated_at timestamp
        task.updated_at = datetime.utcnow()
        
        db.session.commit()
        
        return jsonify({
            'success': True,
            'task': task.to_dict(),
            'message': 'Task updated successfully'
        })
        
    except Exception as e:
        db.session.rollback()
        logging.error(f"Error updating task {task_id}: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Failed to update task'
        }), 500


@app.route('/api/tasks/<int:task_id>', methods=['DELETE'])
def delete_task(task_id):
    """Delete a task"""
    try:
        task = Task.query.get(task_id)
        if not task:
            return jsonify({
                'success': False,
                'error': 'Task not found'
            }), 404
            
        db.session.delete(task)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Task deleted successfully'
        })
        
    except Exception as e:
        db.session.rollback()
        logging.error(f"Error deleting task {task_id}: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Failed to delete task'
        }), 500


@app.route('/api/tasks/<int:task_id>/toggle', methods=['PATCH'])
def toggle_task_completion(task_id):
    """Toggle task completion status"""
    try:
        task = Task.query.get(task_id)
        if not task:
            return jsonify({
                'success': False,
                'error': 'Task not found'
            }), 404
            
        task.completed = not task.completed
        task.updated_at = datetime.utcnow()
        db.session.commit()
        
        return jsonify({
            'success': True,
            'task': task.to_dict(),
            'message': f'Task marked as {"completed" if task.completed else "incomplete"}'
        })
        
    except Exception as e:
        db.session.rollback()
        logging.error(f"Error toggling task {task_id}: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Failed to toggle task completion'
        }), 500


@app.errorhandler(404)
def not_found_error(error):
    return jsonify({
        'success': False,
        'error': 'Resource not found'
    }), 404


@app.errorhandler(500)
def internal_error(error):
    db.session.rollback()
    return jsonify({
        'success': False,
        'error': 'Internal server error'
    }), 500
