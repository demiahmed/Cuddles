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
    
    # Configure scheduler timezone from config
    app.config['SCHEDULER_TIMEZONE'] = app.config['TIMEZONE']
    scheduler.init_app(app)
    scheduler.start()

    # Initialize CORS
    CORS(app, resources={r"/api/*": {"origins": app.config['CORS_ORIGIN']}})


    # Register blueprints
    from app.routes.period_routes import bp as period_bp
    from app.routes.sex_routes import bp as sex_bp
    from app.routes.subscription_routes import bp as subscription_bp
    from app.routes.entries_route import bp as entries_bp
    from app.routes.health_routes import bp as health_bp
    from app.routes.wellness_routes import bp as wellness_bp

    app.register_blueprint(period_bp)
    app.register_blueprint(sex_bp)
    app.register_blueprint(subscription_bp)
    app.register_blueprint(entries_bp)
    app.register_blueprint(health_bp)
    app.register_blueprint(wellness_bp)

    # Register error handlers
    @app.errorhandler(404)
    def not_found_error(error):
        return {"error": "Resource not found"}, 404

    @app.errorhandler(500)
    def internal_error(error):
        db.session.rollback()
        return {"error": "Internal server error"}, 500

    # Create instance directory if it doesn't exist
    import os
    instance_dir = os.path.dirname(app.config['SQLALCHEMY_DATABASE_URI'].replace('sqlite:///', ''))
    if not os.path.exists(instance_dir):
        os.makedirs(instance_dir, exist_ok=True)
        print(f"Created instance directory: {instance_dir}")

    # Create database tables
    with app.app_context():
        db.create_all()
        print("Tables created!")

    # Schedule multiple daily notification jobs
    from app.services.notification_service import NotificationService
    
    # Define notification handlers with app context
    def morning_notifications_with_context():
        """09:00 - Period/Ovulation reminders"""
        with app.app_context():
            NotificationService.send_morning_period_notifications()
            
    def lunch_notifications_with_context():
        """13:00 - Health & nutrition tips"""
        with app.app_context():
            NotificationService.send_lunch_health_notifications()
            
    def evening_notifications_with_context():
        """18:30 - Wild sex tips & encouragement"""
        with app.app_context():
            NotificationService.send_evening_wild_notifications()
            
    def bedtime_notifications_with_context():
        """21:30 - Achievements & milestones"""
        with app.app_context():
            NotificationService.send_bedtime_achievement_notifications()
    
    # Map time slots to specific notification handlers
    notification_handlers = [
        morning_notifications_with_context,   # 09:00
        lunch_notifications_with_context,     # 13:00  
        evening_notifications_with_context,   # 18:30
        bedtime_notifications_with_context,   # 21:30
    ]
    
    handler_names = [
        "morning_period_notifications",
        "lunch_health_notifications", 
        "evening_wild_notifications",
        "bedtime_achievement_notifications"
    ]
    
    for i, (time_slot, handler, name) in enumerate(zip(app.config['NOTIFICATION_TIMES'], notification_handlers, handler_names)):
        job_id = f'{name}_{i+1}'
        scheduler.add_job(
            id=job_id,
            func=handler,
            trigger='cron',
            hour=time_slot['hour'],
            minute=time_slot['minute'],
            timezone=app.config['TIMEZONE'],
            replace_existing=True
        )
        print(f"Scheduled {job_id} job for {time_slot['hour']}:{time_slot['minute']:02d} SGT")
    
    print(f"Total notification windows configured: {len(app.config['NOTIFICATION_TIMES'])}")

    return app