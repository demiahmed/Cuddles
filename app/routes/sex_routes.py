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