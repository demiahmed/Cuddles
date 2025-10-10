from flask import Flask
from flask_apscheduler import APScheduler
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from app.config import Config

db = SQLAlchemy()
scheduler = APScheduler()

def create_app():
    app = Flask(__name__)

    # Load configuration from Config class
    app.config.from_object(Config)

    # Initialize extensions
    db.init_app(app)
    scheduler.init_app(app)
    scheduler.start()

    # Initialize CORS
    CORS(app, resources={r"/api/*": {"origins": app.config['CORS_ORIGIN']}})


    # Register blueprints
    from app.routes.period_routes import bp as period_bp
    from app.routes.sex_routes import bp as sex_bp
    from app.routes.subscription_routes import bp as subscription_bp
    from app.routes.entries_route import bp as entries_bp
    
    app.register_blueprint(period_bp)
    app.register_blueprint(sex_bp)
    app.register_blueprint(subscription_bp)
    app.register_blueprint(entries_bp)

    # Register error handlers
    @app.errorhandler(404)
    def not_found_error(error):
        return {"error": "Resource not found"}, 404

    @app.errorhandler(500)
    def internal_error(error):
        db.session.rollback()
        return {"error": "Internal server error"}, 500

    # Create database tables
    with app.app_context():
        db.create_all()
        print("Tables created!")

    # Schedule notification job
    from app.services.notification_service import NotificationService
    scheduler.add_job(
        id='send_daily_notifications',
        func=NotificationService.send_daily_notifications,
        trigger='cron',
        hour=app.config['NOTIFICATION_HOUR'],
        minute=app.config['NOTIFICATION_MINUTE'],
        replace_existing=True
    )

    print(f"Scheduled send_daily_notifications job for {app.config['NOTIFICATION_HOUR']}:{app.config['NOTIFICATION_MINUTE']:02d} UTC+8")

    return app