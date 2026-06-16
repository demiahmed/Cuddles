from app import db
from datetime import datetime

class BaseModel(db.Model):
    """Base model class that includes common fields and methods."""
    __abstract__ = True
    
    created_at = db.Column(db.String(40), default=lambda: datetime.utcnow().isoformat())