from flask import Blueprint, jsonify, request
from datetime import datetime, date
from app.models import db, Period
from app.services.period_service import PeriodService
from app.config.messages import get_period_soon_messages_html, get_period_countdown_messages_html, get_fertile_messages
import random

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

@bp.route("/api/special-message", methods=["GET"])
def get_special_message():
    """Get special message based on period timing and ovulation window."""
    try:
        stats = PeriodService.calculate_stats()
        if not stats or not stats.get("predicted_next") or not stats.get("avg_cycle"):
            return jsonify({"message": None, "type": "none"})

        today = date.today()
        # Handle both date objects and string dates
        if isinstance(stats["predicted_next"], str):
            # Parse GMT format from API
            predicted_next = datetime.strptime(stats["predicted_next"], '%a, %d %b %Y %H:%M:%S GMT').date()
        else:
            predicted_next = stats["predicted_next"]
        ovulation_window = stats.get("ovulation_window")
        diff_days = (predicted_next - today).days

        # Priority 1: Check if in ovulation window (fertile messages)
        if ovulation_window and len(ovulation_window) >= 2:
            # Handle both date objects and string dates
            if isinstance(ovulation_window[0], str):
                ovulation_start = datetime.strptime(ovulation_window[0], '%a, %d %b %Y %H:%M:%S GMT').date()
                ovulation_end = datetime.strptime(ovulation_window[1], '%a, %d %b %Y %H:%M:%S GMT').date()
            else:
                ovulation_start = ovulation_window[0]
                ovulation_end = ovulation_window[1]
            
            if ovulation_start <= today <= ovulation_end:
                # Return fertile message with HTML formatting
                fertile_messages = get_fertile_messages(use_html=True)
                message = random.choice(fertile_messages)
                return jsonify({"message": message, "type": "fertile"})
        
        # Priority 2: Check if period is incoming in 5 days or less (period soon messages)
        if 0 < diff_days <= 5:
            period_messages = get_period_soon_messages_html(diff_days)
            message = random.choice(period_messages)
            return jsonify({"message": message, "type": "period_soon"})
        
        # Priority 3: Regular period countdown messages for other days (6+ days away)
        if diff_days > 5:
            period_messages = get_period_countdown_messages_html(diff_days)
            message = random.choice(period_messages)
            return jsonify({"message": message, "type": "period_countdown"})
        
        # No message for past periods (diff_days <= 0)
        return jsonify({"message": None, "type": "none"})
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500