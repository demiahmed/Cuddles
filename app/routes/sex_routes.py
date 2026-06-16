from flask import Blueprint, jsonify, request
from app.services.sex_service import SexService

bp = Blueprint('sex', __name__)

@bp.route('/api/stats/sex', methods=['GET'])
def sex_stats():
    try:
        stats = SexService.calculate_stats()
        return jsonify(stats)
    except Exception as e:
        return jsonify({'error': f'Failed to compute sex stats: {str(e)}'}), 500

@bp.route('/api/stats/sex/monthly', methods=['GET'])
def sex_monthly_stats():
    try:
        monthly_data = SexService.get_monthly_entry_counts()
        return jsonify(monthly_data)
    except Exception as e:
        return jsonify({'error': f'Failed to get monthly sex stats: {str(e)}'}), 500

@bp.route('/api/stats/sex/time-distribution', methods=['GET'])
def sex_time_distribution():
    try:
        distribution = SexService.get_time_distribution()
        return jsonify(distribution)
    except Exception as e:
        return jsonify({'error': f'Failed to get time distribution: {str(e)}'}), 500