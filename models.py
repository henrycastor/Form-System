from extensions import db
from datetime import datetime
import json

class Submission(db.Model):
    __tablename__ = 'diagnostico_submissions'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    # Storing JSON as Text to match existing SQLite setup, 
    # but SQLAlchemy can handle JSON type directly too.
    # Given the existing setup used TEXT, we can use JSON type for better abstraction.
    data = db.Column(db.JSON, nullable=False) 
    submitted_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'data': self.data,  # SQLAlchemy handles JSON serialization/deserialization
            'submitted_at': self.submitted_at.isoformat() if self.submitted_at else None
        }
