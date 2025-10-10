from app.routes.period_routes import bp as period_bp
from app.routes.sex_routes import bp as sex_bp
from app.routes.subscription_routes import bp as subscription_bp
from app.routes.entries_route import bp as entries_bp

__all__ = ['period_bp', 'sex_bp', 'subscription_bp', 'entries_bp']