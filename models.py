from datetime import datetime
from app import db


class Task(db.Model):
    """Task model for storing task information"""
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text, nullable=True)
    completed = db.Column(db.Boolean, default=False, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    due_date = db.Column(db.DateTime, nullable=True)
    priority = db.Column(db.String(10), default='medium', nullable=False)  # low, medium, high

    def to_dict(self):
        """Convert task to dictionary for JSON serialization"""
        return {
            'id': self.id,
            'title': self.title,
            'description': self.description,
            'completed': self.completed,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'due_date': self.due_date.isoformat() if self.due_date else None,
            'priority': self.priority
        }

    def __repr__(self):
        return f'<Task {self.id}: {self.title}>'
