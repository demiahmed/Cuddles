from flask import Blueprint, jsonify, request
from app.services.wellness_service import WellnessService
from datetime import datetime

bp = Blueprint('wellness', __name__)


@bp.route('/api/wellness/stats', methods=['GET'])
def get_wellness_stats():
    try:
        days = request.args.get('days', 60, type=int)
        return jsonify(WellnessService.get_stats(days))
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@bp.route('/api/wellness/today', methods=['GET'])
def get_today():
    today = datetime.now().date().isoformat()
    entry = WellnessService.get_entry_by_date(today)
    return jsonify(entry.to_dict() if entry else None)


@bp.route('/api/wellness', methods=['GET'])
def get_wellness_month():
    year  = request.args.get('year',  type=int)
    month = request.args.get('month', type=int)
    if year and month:
        return jsonify(WellnessService.get_entries_for_month(year, month))
    return jsonify([])


@bp.route('/api/wellness/<date_str>', methods=['GET'])
def get_by_date(date_str):
    entry = WellnessService.get_entry_by_date(date_str)
    return jsonify(entry.to_dict() if entry else None)


@bp.route('/api/wellness', methods=['POST'])
def save_wellness():
    try:
        data = request.get_json()
        result = WellnessService.save_entry(data)
        return jsonify(result), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@bp.route('/api/wellness/<date_str>', methods=['DELETE'])
def delete_wellness(date_str):
    if WellnessService.delete_entry(date_str):
        return jsonify({'status': 'deleted'}), 200
    return jsonify({'error': 'Not found'}), 404
