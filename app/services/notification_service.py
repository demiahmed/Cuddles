import json
from flask import current_app
from pywebpush import webpush, WebPushException
from app.models import Subscription, db
from app.utils.helpers import remove_html_tags
from app.config.messages import (
    get_period_soon_messages, get_fertile_messages, NOTIFICATION_MESSAGES,
    WELLNESS_REMINDER_MESSAGES,
)
import random
from datetime import datetime, timedelta
from app.services.period_service import PeriodService
from app.services.sex_service import SexService


def _wellness_not_logged_today() -> bool:
    try:
        from app.services.wellness_service import WellnessService
        return not WellnessService.has_entry_today()
    except Exception:
        return False

class NotificationService:
    @staticmethod 
    def send_daily_notifications():
        """LEGACY: Cron job for period/ovulation reminders (09:00)."""
        NotificationService.send_morning_period_notifications()
    
    @staticmethod
    def send_morning_period_notifications():
        """09:00 SGT - Period/Ovulation reminders"""
        print("=" * 80)
        print(f"🌅 MORNING NOTIFICATION JOB STARTED - 9:00 AM SGT")
        print(f"⏰ Execution time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        
        try:
            # Get period stats
            print("📊 Calculating period stats...")
            today = datetime.now().date()
            stats = PeriodService.calculate_stats()
            
            if not stats:
                print("⚠️ No period stats available - skipping notifications")
                print("=" * 80)
                return
                
            if not stats.get("predicted_next"):
                print("⚠️ No predicted next period - skipping notifications")
                print("=" * 80)
                return
            
            print(f"✅ Period stats retrieved successfully")

            predicted_next = stats["predicted_next"] 
            ovulation_window = stats["ovulation_window"]
            diff_days = (predicted_next - today).days
            
            print(f"📅 Days until next period: {diff_days}")

            # Check ovulation window
            in_ovulation = False
            if ovulation_window and len(ovulation_window) >= 2:
                in_ovulation = ovulation_window[0] <= today <= ovulation_window[1]
                print(f"🌸 In ovulation window: {in_ovulation}")

            # Determine notification type
            notification_sent = False
            
            if in_ovulation:
                fertile_messages = get_fertile_messages()
                message = random.choice(fertile_messages)
                print(f"💬 Notification type: 🌸 Fertility Window")
                print(f"📝 Message: {message[:100]}...")
                NotificationService.send_push_notification("🌸 Fertility Window", message)
                notification_sent = True
                print(f"✅ Sent ovulation alert successfully")

            elif 0 < diff_days <= 5:
                period_messages = get_period_soon_messages(diff_days)
                message = random.choice(period_messages)
                print(f"💬 Notification type: 📅 Period Reminder ({diff_days} days)")
                print(f"📝 Message: {message[:100]}...")
                NotificationService.send_push_notification("📅 Period Reminder", message)
                notification_sent = True
                print(f"✅ Sent period reminder successfully")
                
            else:
                print(f"ℹ️ No notification needed (Period in {diff_days} days, not in ovulation)")
                print("💡 Notifications only sent when: period ≤5 days OR in ovulation window")
            
            print("=" * 80)
            
        except Exception as e:
            print(f"❌ CRITICAL ERROR in morning notifications: {str(e)}")
            import traceback
            traceback.print_exc()
            print("=" * 80)

    @staticmethod
    def send_lunch_health_notifications():
        """13:00 SGT - Health tips with nurturing encouragement"""
        print("=" * 80)
        print(f"🌤️ LUNCH HEALTH NOTIFICATION JOB STARTED - 1:00 PM SGT")
        print(f"⏰ Execution time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        
        try:
            print("📊 Calculating context for health tips...")
            period_stats = PeriodService.calculate_stats()
            sex_stats = SexService.calculate_stats()
            today = datetime.now().date()
            
            # Check if currently on period for appropriate health messaging
            is_on_period = False
            if period_stats and period_stats.get("last_period_start"):
                last_period = period_stats["last_period_start"]
                days_since_start = (today - last_period).days
                avg_length = period_stats.get("avg_period_length", 5)
                if 0 <= days_since_start <= avg_length:
                    is_on_period = True
                    print(f"🩸 On period: Day {days_since_start} of {avg_length}")
                else:
                    print(f"ℹ️ Not on period: {days_since_start} days since last period")
            else:
                print(f"ℹ️ No period tracking data available")
            
            # Context-aware message selection: health tips + encouragement when needed
            messages_to_send = []
            
            # Add encouragement for dry spells (5+ days without intimacy) - but not during period
            dry_spell = False
            if not is_on_period and sex_stats:
                last_entry = sex_stats.get("last_entry_date")
                days_since = (today - last_entry).days if last_entry else 30
                print(f"� Days since last intimacy: {days_since}")
                if days_since >= 5:  # Dry spell detected
                    dry_spell = True
                    encouragement_messages = NOTIFICATION_MESSAGES.get('sex_encouragement', [])
                    if encouragement_messages:
                        # Format encouragement messages with days count
                        formatted_encouragement = [msg.format(days=days_since) for msg in encouragement_messages]
                        messages_to_send.extend(formatted_encouragement)
                        print(f"💪 Dry spell detected - adding {len(formatted_encouragement)} encouragement messages")
                else:
                    print(f"✅ Regular intimacy rhythm (last {days_since} days ago)")
            else:
                if is_on_period:
                    print(f"ℹ️ Skipping intimacy check (currently on period)")
                else:
                    print(f"ℹ️ No intimacy tracking data available")
            
            # Include health/nutrition tips if not dry spell
            if not dry_spell:
                if is_on_period:
                    period_health_messages = NOTIFICATION_MESSAGES.get('period_health', [])
                    if period_health_messages:
                        messages_to_send.extend(period_health_messages)
                        print(f"💚 Adding {len(period_health_messages)} period-specific health messages")
                else:
                    health_messages = NOTIFICATION_MESSAGES.get('health_nutrition', [])
                    if health_messages:
                        messages_to_send.extend(health_messages)
                        print(f"� Adding {len(health_messages)} general health messages")
            
            # Send a random message from available pool
            if messages_to_send:
                message = random.choice(messages_to_send)
                title = "💚 Health Reminder" if is_on_period else "💪 Wellness Check"
                print(f"📢 Notification type: {title}")
                print(f"📝 Message: {message[:100]}...")
                NotificationService.send_push_notification(title, message)
                print(f"✅ Sent lunch notification successfully")
            else:
                print(f"⚠️ No messages available - sending fallback")
                NotificationService.send_push_notification("💚 Wellness Reminder", "Remember to hydrate and take care of yourself! 💖")
                print("✅ Sent fallback message")
            
            print("=" * 80)
            
        except Exception as e:
            print(f"❌ CRITICAL ERROR in lunch notifications: {str(e)}")
            import traceback
            traceback.print_exc()
            print("=" * 80)

    @staticmethod
    def send_evening_wild_notifications():
        """18:30 SGT - Creative intimacy encouragement with playful energy"""
        print("=" * 80)
        print(f"🌆 EVENING NOTIFICATION JOB STARTED - 6:30 PM SGT")
        print(f"⏰ Execution time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        
        try:
            print("📊 Calculating context for evening messages...")
            period_stats = PeriodService.calculate_stats()
            sex_stats = SexService.calculate_stats()
            today = datetime.now().date()
            
            # Context-aware evening message selection
            messages_to_send = []
            title = "🔥 Evening Vibes"
            
            # Check if currently on period for period-specific encouragement
            is_on_period = False
            if period_stats and period_stats.get("last_period_start"):
                last_period = period_stats["last_period_start"]
                days_since_start = (today - last_period).days
                avg_length = period_stats.get("avg_period_length", 5)
                if 0 <= days_since_start <= avg_length:
                    is_on_period = True
                    print(f"🩸 On period: Day {days_since_start} of {avg_length}")
                else:
                    print(f"ℹ️ Not on period")
            else:
                print(f"ℹ️ No period tracking data")
            
            # Check for double entries (multiple sex entries same day)
            has_double_entry = False
            if sex_stats:
                entries_today = sex_stats.get("entries_today", 0)  # Would need to add this to sex_service
                if entries_today >= 2:
                    has_double_entry = True
                    print(f"🔥 Double entry today: {entries_today} entries!")
            
            # Message selection based on context
            if has_double_entry:
                title = "🔥 You're on Fire!"
                double_entry_messages = NOTIFICATION_MESSAGES.get('double_entry', [])
                if double_entry_messages:
                    messages_to_send.extend(double_entry_messages)
                    print(f"🎉 Adding {len(double_entry_messages)} double entry celebration messages")
            elif is_on_period:
                title = "🌹 Period Passion"
                period_intimacy_messages = NOTIFICATION_MESSAGES.get('period_encouragement', [])
                if period_intimacy_messages:
                    messages_to_send.extend(period_intimacy_messages)
                    print(f"🌹 Adding {len(period_intimacy_messages)} period intimacy messages")
            else:
                # Check for dry spell
                if sex_stats:
                    last_entry = sex_stats.get("last_entry_date")
                    days_since = (today - last_entry).days if last_entry else 30
                    print(f"📅 Days since last intimacy: {days_since}")
                    
                    if days_since >= 7:
                        title = "💕 Connection Time"
                        encouragement_messages = NOTIFICATION_MESSAGES.get('sex_encouragement', [])
                        if encouragement_messages:
                            formatted_messages = [msg.format(days=days_since) for msg in encouragement_messages]
                            messages_to_send.extend(formatted_messages)
                            print(f"💕 Dry spell ({days_since} days) - adding {len(formatted_messages)} encouragement messages")
                    else:
                        wild_messages = NOTIFICATION_MESSAGES.get('wild_sex_tips', [])
                        if wild_messages:
                            messages_to_send.extend(wild_messages)
                            print(f"😈 Regular rhythm - adding {len(wild_messages)} wild tip messages")
                else:
                    print(f"ℹ️ No intimacy tracking data")
            
            # Send a random message from available pool
            if messages_to_send:
                message = random.choice(messages_to_send)
                print(f"💬 Notification type: {title}")
                print(f"📝 Message: {message[:100]}...")
                NotificationService.send_push_notification(title, message)
                print(f"✅ Sent evening notification successfully")
            else:
                print(f"⚠️ No messages available - sending fallback")
                NotificationService.send_push_notification("🔥 Evening Vibes", "Time to unwind and connect... 🌙✨")
                print("✅ Sent fallback message")
            
            print("=" * 80)
            
        except Exception as e:
            print(f"❌ CRITICAL ERROR in evening notifications: {str(e)}")
            import traceback
            traceback.print_exc()
            print("=" * 80)

    @staticmethod
    def send_bedtime_achievement_notifications():
        """21:30 SGT - Wellness reminder if log missing; else achievement/reflection"""
        print("=" * 80)
        print(f"🌙 BEDTIME NOTIFICATION JOB STARTED - 9:30 PM SGT")
        print(f"⏰ Execution time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")

        try:
            # Check wellness log first — if not filled, make this a dedicated reminder
            if _wellness_not_logged_today():
                print("📓 Wellness log missing — sending wellness-only reminder")
                reminder = random.choice(WELLNESS_REMINDER_MESSAGES)
                NotificationService.send_push_notification("📓 Log Your Day", reminder)
                print("✅ Sent wellness reminder successfully")
                print("=" * 80)
                return

            print("✅ Wellness log already filled — sending standard bedtime notification")
            print("📊 Calculating achievements and stats...")
            period_stats = PeriodService.calculate_stats()
            sex_stats = SexService.calculate_stats()
            today = datetime.now().date()
            
            # Context-aware bedtime message selection
            messages_to_send = []
            title = "🏆 Daily Reflection"
            
            # Check for streak achievements (weekly/monthly patterns)
            has_streak = False
            if sex_stats:
                # Check for various streak types (would need streak detection in sex_service)
                current_streak = sex_stats.get("current_streak", 0)
                weekly_consistency = sex_stats.get("weekly_consistency", 0)
                total_entries = sex_stats.get("total_entries", 0)
                
                print(f"📈 Stats: Streak={current_streak}, Weekly={weekly_consistency}, Total={total_entries}")
                
                if current_streak >= 7:
                    has_streak = True
                    title = "🔥 Streak Achievement"
                    streak_messages = NOTIFICATION_MESSAGES.get('streaks', [])
                    if streak_messages:
                        messages_to_send.extend(streak_messages)
                        print(f"🔥 Strong streak ({current_streak} days) - adding {len(streak_messages)} celebration messages")
                elif total_entries in [10, 25, 50, 100, 250, 500, 1000]:
                    has_streak = True
                    title = f"🌟 {total_entries} Entries Milestone!"
                    achievement_messages = NOTIFICATION_MESSAGES.get('achievements', [])
                    if achievement_messages:
                        messages_to_send.extend(achievement_messages)
                        print(f"🌟 Milestone hit: {total_entries} entries - adding celebration messages")
            else:
                print(f"ℹ️ No intimacy tracking data")
            
            # Check for double entry today (special celebration)
            has_double_entry = False
            if sex_stats:
                entries_today = sex_stats.get("entries_today", 0)
                if entries_today >= 2:
                    has_double_entry = True
                    title = "🎉 Double Entry Achievement!"
                    double_messages = NOTIFICATION_MESSAGES.get('double_entry', [])
                    if double_messages:
                        messages_to_send.extend(double_messages)
                        print(f"🎉 Double entry today ({entries_today} times) - adding celebration messages")
            
            # If no specific achievement, use random fun facts or encouragement
            if not messages_to_send:
                # Mix of orgasm facts and general achievements
                orgasm_facts = NOTIFICATION_MESSAGES.get('orgasm_celebration', [])
                connection_messages = NOTIFICATION_MESSAGES.get('intimate_connection', [])
                general_achievements = NOTIFICATION_MESSAGES.get('achievements', {}).get('general', [])
                
                all_bedtime_messages = []
                if orgasm_facts:
                    all_bedtime_messages.extend(orgasm_facts)
                    print(f"💫 Adding {len(orgasm_facts)} orgasm fact messages")
                if connection_messages:
                    all_bedtime_messages.extend(connection_messages)
                    print(f"💕 Adding {len(connection_messages)} connection messages")
                if general_achievements:
                    all_bedtime_messages.extend(general_achievements)
                    print(f"🏆 Adding {len(general_achievements)} achievement messages")
                
                if all_bedtime_messages:
                    messages_to_send.extend(all_bedtime_messages)
                    title = random.choice(["💫 Fun Fact", "💕 Daily Reflection", "✨ Wellness Note"])
                    print(f"💬 Using general bedtime messages (total: {len(messages_to_send)})")
            
            # Send a random message from available pool
            if messages_to_send:
                message = random.choice(messages_to_send)
                print(f"💬 Notification type: {title}")
                print(f"📝 Message: {message[:100]}...")
                NotificationService.send_push_notification(title, message)
                print(f"✅ Sent bedtime notification successfully")
            else:
                print(f"⚠️ No messages available - sending fallback")
                NotificationService.send_push_notification("✨ Sweet Dreams", "Rest well and take care of yourself. Tomorrow is a new day! 🌙")
                print("✅ Sent fallback message")
            
            print("=" * 80)
            
        except Exception as e:
            print(f"❌ CRITICAL ERROR in bedtime notifications: {str(e)}")
            import traceback
            traceback.print_exc()
            print("=" * 80)

    @staticmethod
    def send_push_notification(title, body):
        """Sends push notification with Android Chrome fixes and detailed logging."""
        print(f"📤 PUSH NOTIFICATION REQUEST")
        print(f"   Title: {title}")
        print(f"   Body: {body[:80]}...")
        
        try:
            all_subscriptions = Subscription.query.all()
            print(f"👥 Found {len(all_subscriptions)} total subscriptions in database")
        except Exception as e:
            print(f"❌ Database error fetching subscriptions: {e}")
            return {"status": "error", "message": "Database connection issue"}
            
        if not all_subscriptions:
            print("⚠️ No subscriptions found - no one to notify")
            return {"status": "success", "message": "No active subscriptions"}
            
        clean_body = remove_html_tags(body)
        
        sent_count = 0
        failed_count = 0
        
        for sub_obj in all_subscriptions:
            try:
                print(f"   📨 Sending to subscription ID {sub_obj.id} (endpoint: {sub_obj.subscription_info['endpoint'][:50]}...)")
                
                vapid_email = current_app.config['VAPID_EMAIL']
                if not vapid_email.startswith('mailto:'):
                    vapid_email = f'mailto:{vapid_email}'
                
                webpush(
                    subscription_info=sub_obj.subscription_info,
                    data=json.dumps({
                        "title": title, 
                        "body": clean_body,
                        "icon": "/icon-192x192.png",
                        "badge": "/icon-192x192.png",
                        "tag": "cuddles-notification",
                        "requireInteraction": True,
                        "renotify": True,
                        "timestamp": int(datetime.now().timestamp() * 1000)
                    }),
                    vapid_private_key=current_app.config['VAPID_PRIVATE_KEY'],
                    vapid_claims={"sub": vapid_email},
                    headers={
                        "Urgency": "high",
                        "TTL": "86400"
                    }
                )
                sent_count += 1
                print(f"   ✅ Successfully sent to subscription {sub_obj.id}")
                
            except WebPushException as e:
                failed_count += 1
                print(f"   ❌ WebPush failed for subscription {sub_obj.id}: {e}")
                if e.response and e.response.status_code == 410:
                    print(f"   🗑️ Subscription {sub_obj.id} expired - removing from database")
                    db.session.delete(sub_obj)
                    db.session.commit()
            except Exception as e:
                failed_count += 1
                print(f"   ❌ Unexpected error for subscription {sub_obj.id}: {e}")
        
        print(f"📊 PUSH SUMMARY: Sent: {sent_count}, Failed: {failed_count}, Total: {len(all_subscriptions)}")
        return {"status": "success", "message": f"Push notifications sent", "sent": sent_count, "failed": failed_count}

    @staticmethod
    def send_to_specific_subscription(subscription, title, body):
        """Send notification to specific subscription with Android Chrome fixes."""
        try:
            clean_body = remove_html_tags(body)
            vapid_email = current_app.config['VAPID_EMAIL']
            if not vapid_email.startswith('mailto:'):
                vapid_email = f'mailto:{vapid_email}'
            
            subscription_info = subscription.subscription_info
            
            # Handle different formats of subscription_info
            if isinstance(subscription_info, str):
                subscription_info = json.loads(subscription_info)
            elif hasattr(subscription_info, '__dict__'):  # If it's a model object
                # This shouldn't happen, but handle it gracefully
                print(f"⚠️  subscription_info appears to be a model object, not dict/string")
                return False
            
            print(f"📤 Sending test notification to subscription {subscription.id}")
            print(f"   Title: {title}")
            print(f"   Message: {clean_body[:100]}{'...' if len(clean_body) > 100 else ''}")
            
            webpush(
                subscription_info=subscription_info,
                data=json.dumps({
                    "title": title, 
                    "body": clean_body,
                    "icon": "/icon-192x192.png",
                    "badge": "/icon-192x192.png",
                    "tag": "cuddles-test-notification",
                    "requireInteraction": True,
                    "renotify": True,
                    "timestamp": int(datetime.now().timestamp() * 1000)
                }),
                vapid_private_key=current_app.config['VAPID_PRIVATE_KEY'],
                vapid_claims={"sub": vapid_email},
                headers={
                    "Urgency": "high",
                    "TTL": "86400"
                }
            )
            print(f"✅ Successfully sent test notification to subscription {subscription.id}")
            return True
        except Exception as e:
            print(f"❌ Test notification failed for subscription {subscription.id}: {e}")
            return False

    @staticmethod
    def cleanup_expired_subscriptions():
        """Remove expired push subscriptions from database by attempting to send to each one."""
        try:
            expired_count = 0
            all_subscriptions = Subscription.query.all()
            total_subs = len(all_subscriptions)
            
            print(f"Starting cleanup of {total_subs} subscriptions...")
            
            for subscription in all_subscriptions:
                # Test if subscription is still valid by attempting a minimal push
                try:
                    vapid_email = current_app.config['VAPID_EMAIL']
                    if not vapid_email.startswith('mailto:'):
                        vapid_email = f'mailto:{vapid_email}'
                    
                    subscription_info = subscription.subscription_info
                    
                    # Handle different formats of subscription_info
                    if isinstance(subscription_info, str):
                        subscription_info = json.loads(subscription_info)
                    elif hasattr(subscription_info, '__dict__'):  # If it's a model object
                        # This shouldn't happen, but mark as failed
                        print(f"⚠️  Subscription {subscription.id} has malformed subscription_info")
                        continue
                    
                    # Send minimal test payload with very short TTL
                    webpush(
                        subscription_info=subscription_info,
                        data=json.dumps({"test": True}),
                        vapid_private_key=current_app.config['VAPID_PRIVATE_KEY'],
                        vapid_claims={"sub": vapid_email},
                        headers={"TTL": "0"}  # Don't deliver, just test validity
                    )
                    print(f"Subscription {subscription.id} is still valid")
                except WebPushException as e:
                    # Check for various ways the exception might indicate expiration
                    is_expired = False
                    status_code = "unknown"
                    
                    if e.response and hasattr(e.response, 'status_code'):
                        status_code = e.response.status_code
                        if status_code in [410, 404]:
                            is_expired = True
                    elif "410" in str(e) or "Gone" in str(e) or "expired" in str(e).lower():
                        # Fallback: check error message for expiration indicators
                        is_expired = True
                        status_code = "410 (from message)"
                    
                    if is_expired:
                        print(f"Removing expired subscription {subscription.id} (status: {status_code})")
                        try:
                            db.session.delete(subscription)
                            db.session.commit()
                            expired_count += 1
                            print(f"Successfully removed expired subscription {subscription.id}")
                        except Exception as delete_error:
                            print(f"Error removing expired subscription {subscription.id}: {delete_error}")
                            db.session.rollback()
                    else:
                        print(f"Subscription {subscription.id} failed but not expired (status: {status_code})")
                except Exception as e:
                    print(f"Other error testing subscription {subscription.id}: {e}")
                    # Keep subscription on other errors
            
            print(f"Cleanup complete: removed {expired_count} expired subscriptions out of {total_subs}")
            
            return {"status": "success", "removed": expired_count, "total_checked": total_subs}
        except Exception as e:
            print(f"Error during cleanup: {e}")
            db.session.rollback()
            return {"status": "error", "message": str(e)}
