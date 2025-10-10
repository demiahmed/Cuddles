import json
from flask import current_app
from pywebpush import webpush, WebPushException
from app.models import Subscription, db
from app.utils.helpers import remove_html_tags
import random
from datetime import datetime
from app.services.period_service import PeriodService

class NotificationService:
    # Message templates for notifications
    @staticmethod
    def get_period_soon_messages(diff_days):
        return [
            f"🌸 Your next period is in {diff_days} day{'s' if diff_days > 1 else ''} — stock up on chocolate 🍫",
            f"⏳ Tick-tock… {diff_days} day{'s' if diff_days > 1 else ''} until period time — you got this 💪",
            f"💖 Heads up! Only {diff_days} day{'s' if diff_days > 1 else ''} left before your flow arrives 🌊",
            f"🩸 Aunt Jaibu's packing her bags… ETA: {diff_days} day{'s' if diff_days > 1 else ''} 😉",
            f"🌹 Period incoming in {diff_days} day{'s' if diff_days > 1 else ''} — be kind to yourself 💕",
        ]

    FERTILE_MESSAGES = [
        "🔥 Looks like you're in the FERTILE ZONE — high chance of baby magic if you don't behave 😉",
        "💋 The stars say it's your WILD WINDOW — fun now could mean little feet later 👶",
        "🌶️ Fertility's peaking! A little playtime now could turn into a whole new adventure 😏",
        "💃 Your body's screaming YES — stay naughty, but careful 😉",
        "⚡ You're basically a PREGNANCY POWERHOUSE right now — handle with caution 😜",
        "🩸 Aunt Jaibu's packing her bags… 😉 Your ovaries are on VIP mode — fertile and ready! 💃✨"
    ]
    @staticmethod
    def send_daily_notifications():
        """Cron job to send daily period and ovulation reminders."""
        today = datetime.now().date()
        stats = PeriodService.calculate_stats()
        if not stats or not stats["predicted_next"]:
            print(f"No valid stats for notifications at {datetime.now()}")
            return

        predicted_next = stats["predicted_next"]
        ovulation_window = stats["ovulation_window"]
        diff_days = (predicted_next - today).days

        # Period reminder: send if period is in 5 days or less
        if 0 < diff_days <= 5:
            message = random.choice(NotificationService.get_period_soon_messages(diff_days))
            NotificationService.send_push_notification("Period Reminder", message)
            print(f"Sent period reminder: {message}")

        # Ovulation reminder: send if today is in ovulation window
        if ovulation_window and ovulation_window[0] <= today <= ovulation_window[1]:
            message = random.choice(NotificationService.FERTILE_MESSAGES)
            NotificationService.send_push_notification("Ovulation Alert", message)
            print(f"Sent ovulation alert: {message}")

    @staticmethod
    def send_push_notification(title, body):
        """
        Sends a push notification to all subscribed clients.
        This function cleans the HTML from the body to ensure
        mobile notifications render as plain text.
        """
        all_subscriptions = Subscription.query.all()
        if not all_subscriptions:
            print("No subscriptions found in the database.")
            return
            
        # Clean the body of any HTML tags for mobile rendering
        clean_body = remove_html_tags(body)
        
        for sub_obj in all_subscriptions:
            try:
                webpush(
                    subscription_info=sub_obj.subscription_info,
                    data=json.dumps({"title": title, "body": clean_body}),
                    vapid_private_key=current_app.config['VAPID_PRIVATE_KEY'],
                    vapid_claims={"sub": current_app.config['VAPID_EMAIL']}
                )
                print(f"Successfully sent push to subscription {sub_obj.id}")
            except WebPushException as e:
                print(f"Push failed for subscription {sub_obj.id}: {e}")
                if e.response and e.response.status_code == 410:
                    print(f"Subscription {sub_obj.id} is no longer valid. Deleting from database.")
                    db.session.delete(sub_obj)
                    db.session.commit()