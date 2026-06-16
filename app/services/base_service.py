from sqlalchemy import func
from sqlalchemy.exc import SQLAlchemyError
from app.models import db
from app.utils.helpers import parse_iso
from datetime import datetime

class BaseService:
    model = None

    @classmethod
    def get_by_id(cls, id):
        return cls.model.query.get_or_404(id)

    @classmethod
    def get_all(cls):
        return cls.model.query.all()

    @classmethod
    def create(cls, **kwargs):
        instance = cls.model(**kwargs)
        db.session.add(instance)
        db.session.commit()
        return instance

    @classmethod
    def update(cls, id, **kwargs):
        instance = cls.get_by_id(id)
        for key, value in kwargs.items():
            setattr(instance, key, value)
        db.session.commit()
        return instance

    @classmethod
    def delete(cls, id):
        instance = cls.get_by_id(id)
        db.session.delete(instance)
        db.session.commit()
        return True

    @classmethod
    def get_by_date_range(cls, start_date=None, end_date=None):
        """Get entries within a date range."""
        query = cls.model.query
        
        if start_date:
            query = query.filter(func.substr(cls.model.datetime_iso, 1, 10) >= start_date)
        if end_date:
            query = query.filter(func.substr(cls.model.datetime_iso, 1, 10) <= end_date)
            
        return query.order_by(cls.model.datetime_iso).all()

    @staticmethod
    def validate_date(date_str):
        """Validate date string format."""
        try:
            dt = parse_iso(date_str)
            if not dt:
                return False, "Invalid date format"
            
            if dt.date() > datetime.now().date():
                return False, "Cannot create entries for future dates"
                
            return True, dt
        except Exception as e:
            return False, str(e)
            
    @staticmethod
    def handle_db_error(e):
        """Handle database errors uniformly"""
        if isinstance(e, SQLAlchemyError):
            return "Database error occurred", 500
        return str(e), 400