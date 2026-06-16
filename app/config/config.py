import os

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'dev-key-change-in-production'
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL') or 'sqlite:////app/instance/menses.db'
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    # CORS settings
    CORS_ORIGIN = os.environ.get('CORS_ORIGIN', '*')
    
    # Timezone settings
    TIMEZONE = os.environ.get('TZ', 'Asia/Singapore')
    
    # Push notification settings
    VAPID_PUBLIC_KEY = os.environ.get('VAPID_PUBLIC_KEY', 'BLyZJXj-_VRaYJYWFzXVxgL3Y0dNpJ8cGRmJHbCHsXNdyS7N4-_gFe__e8E_hW9EBGgwXFsf2FfF2FfF2FfF2Q')
    VAPID_PRIVATE_KEY = os.environ.get('VAPID_PRIVATE_KEY', 'yC7fFfF2FfF2FfF2FfF2FfF2FfF2FfF2FfF2FfF2FfF2FfF2FfF2FfF2FfF2FfF')
    VAPID_EMAIL = os.environ.get('VAPID_EMAIL', 'mailto:contact@demiahmed.com')
    
    # Notification schedule - Parse comma-separated times from environment
    @staticmethod
    def parse_notification_times():
        times_str = os.environ.get('NOTIFICATION_TIMES', '08:30,15:00,19:45')
        notification_times = []
        for time_str in times_str.split(','):
            time_str = time_str.strip()
            if ':' in time_str:
                hour, minute = map(int, time_str.split(':'))
                notification_times.append({'hour': hour, 'minute': minute})
        return notification_times
    
    NOTIFICATION_TIMES = parse_notification_times.__func__()
    
    @staticmethod
    def init_app(app):
        pass