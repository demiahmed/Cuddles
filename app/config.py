import os
import pytz

class Config:
    # Flask Configuration
    FLASK_ENV = os.environ.get('FLASK_ENV', 'development')
    
    # CORS Configuration
    CORS_ORIGIN = os.environ.get('CORS_ORIGIN', 'http://localhost:3000')
    
    # Database Configuration
    SQLALCHEMY_DATABASE_URI = 'sqlite:///menses.db'
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    # Push Notification Configuration
    VAPID_PUBLIC_KEY = os.environ.get('VAPID_PUBLIC_KEY', 'YOUR_VAPID_PUBLIC_KEY_HERE')
    VAPID_PRIVATE_KEY = os.environ.get('VAPID_PRIVATE_KEY', 'YOUR_VAPID_PRIVATE_KEY_HERE')
    VAPID_EMAIL = os.environ.get('VAPID_EMAIL', 'mailto:admin@example.com')
    
    # Notification Schedule Configuration
    NOTIFICATION_HOUR = int(os.environ.get('NOTIFICATION_HOUR', 11))
    NOTIFICATION_MINUTE = int(os.environ.get('NOTIFICATION_MINUTE', 0))
    
    # Timezone Configuration
    TIMEZONE = pytz.timezone(os.environ.get('TZ', 'Asia/Singapore'))