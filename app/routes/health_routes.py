from flask import Blueprint, jsonify
from app.models import db
from sqlalchemy import text
from datetime import datetime

bp = Blueprint('health', __name__)

@bp.route('/api/health', methods=['GET'])
def health():
    """Comprehensive health check endpoint for Docker and monitoring."""
    try:
        # Test database connectivity by executing a simple query
        db.session.execute(text('SELECT 1')).fetchone()
        db.session.commit()
        
        return jsonify({
            "status": "healthy",
            "message": "API and database are running",
            "timestamp": datetime.utcnow().isoformat() + "Z"
        }), 200
    except Exception as e:
        return jsonify({
            "status": "unhealthy", 
            "message": f"Database error: {str(e)}",
            "timestamp": datetime.utcnow().isoformat() + "Z"
        }), 503

@bp.route('/health', methods=['GET'])  
def health_simple():
    """Simple health check endpoint that also tests database."""
    try:
        # Test database connectivity
        db.session.execute(text('SELECT 1')).fetchone()
        db.session.commit()
        return "OK", 200
    except Exception:
        return "DATABASE ERROR", 503