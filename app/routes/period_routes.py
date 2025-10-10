from flask import Blueprint, jsonify, request
from datetime import datetime
from app.models import db, Period
from app.services.period_service import PeriodService

bp = Blueprint('period', __name__)

@bp.route("/api/debug/periods", methods=["GET"])
def debug_periods():
    """Debug endpoint to list all period entries with their details."""
    try:
        periods = Period.query.order_by(Period.datetime_iso).all()
        return jsonify([{
            'id': p.id,
            'entry_type': p.entry_type,
            'datetime': p.datetime_iso,
            'flow': p.flow,
            'created_at': str(p.created_at)
        } for p in periods])
    except Exception as e:
        print(f"Error in debug_periods: {e}")
        return jsonify({"error": str(e)}), 500

@bp.route("/api/stats/periods", methods=["GET"])
def stats_periods():
    try:
        stats = PeriodService.calculate_stats()
        if not stats:
            return jsonify({"error": "Failed to compute period stats"}), 500
        
        return jsonify(stats)
    except Exception as e:
        return jsonify({"error": f"Failed to compute period stats: {str(e)}"}), 500