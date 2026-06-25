from flask import Blueprint, jsonify, request, current_app
from app.models import db, Subscription
from app.services.notification_service import NotificationService

bp = Blueprint('subscription', __name__)

@bp.route("/api/save-subscription", methods=["POST"])
def save_subscription():
    """
    Receives and saves a new push subscription from the client.
    Supports multiple subscriptions per user/device/browser.
    """
    try:
        # Force JSON parsing to avoid None
        subscription_info = request.get_json(force=True)
        print("DEBUG: Incoming subscription JSON:", subscription_info)

        # Validate required keys
        if not subscription_info or 'endpoint' not in subscription_info:
            print("ERROR: Invalid subscription data provided")
            return jsonify({"status": "error", "message": "Invalid subscription data provided"}), 400

        # Check if this exact subscription already exists
        existing_sub = Subscription.query.filter_by(endpoint=subscription_info['endpoint']).first()
        if existing_sub:
            print(f"INFO: Subscription already exists for endpoint {subscription_info['endpoint']}")
            return jsonify({"status": "success", "message": "Subscription already exists"}), 200

        # Create new subscription object
        new_subscription = Subscription(
            endpoint=subscription_info['endpoint'],
            subscription_info=subscription_info
        )

        db.session.add(new_subscription)
        db.session.commit()
        print(f"INFO: New push subscription saved successfully, id={new_subscription.id}")

        return jsonify({"status": "success", "message": "Subscription saved successfully"}), 200

    except Exception as e:
        db.session.rollback()
        print("EXCEPTION: Error saving subscription:\n", str(e))
        return jsonify({"status": "error", "message": f"Error saving subscription: {str(e)}"}), 500

@bp.route("/api/subscription-stats", methods=["GET"])
def subscription_stats():
    """
    Get statistics about subscriptions in the database.
    """
    try:
        total = Subscription.query.count()
        subscriptions = Subscription.query.all()
        
        stats = {
            "total": total,
            "subscriptions": []
        }
        
        for sub in subscriptions:
            stats["subscriptions"].append({
                "id": sub.id,
                "endpoint": sub.endpoint[:50] + "..." if len(sub.endpoint) > 50 else sub.endpoint,
                "created_at": sub.created_at.isoformat() if hasattr(sub, 'created_at') else "unknown"
            })
        
        return jsonify(stats), 200
    except Exception as e:
        print(f"ERROR: Failed to get subscription stats: {e}")
        return jsonify({"status": "error", "message": str(e)}), 500

@bp.route("/api/flush-subscriptions", methods=["POST"])
def flush_subscriptions():
    """
    Delete ALL subscriptions from the database and start fresh.
    Use this when the subscription table is cluttered with invalid entries.
    """
    try:
        count = Subscription.query.count()
        Subscription.query.delete()
        db.session.commit()
        print(f"INFO: Flushed {count} subscriptions from database")
        return jsonify({
            "status": "success", 
            "message": f"Flushed {count} subscriptions. Database is now clean.",
            "flushed": count
        }), 200
    except Exception as e:
        db.session.rollback()
        print(f"ERROR: Failed to flush subscriptions: {e}")
        return jsonify({"status": "error", "message": str(e)}), 500

@bp.route("/api/cleanup-subscriptions", methods=["POST"])
def cleanup_subscriptions():
    """
    Clean up expired and invalid push subscriptions.
    """
    try:
        from app.services.notification_service import NotificationService
        result = NotificationService.cleanup_expired_subscriptions()
        return jsonify(result), 200
    except Exception as e:
        print(f"Error cleaning up subscriptions: {e}")
        return jsonify({"status": "error", "message": str(e)}), 500

@bp.route("/api/send-custom", methods=["POST"])
def send_custom():
    """
    Send a fully custom push notification.
    Body: { "title": "...", "body": "...", "subscription_id": 1 (optional) }
    Uses a unique tag so it is never overwritten by scheduled notifications.
    """
    import json as _json
    from datetime import datetime as _dt
    from pywebpush import webpush as _webpush, WebPushException as _WPE
    from flask import current_app as _app
    from app.utils.helpers import remove_html_tags

    try:
        data = request.get_json(force=True)
        title = (data.get('title') or '').strip()
        body  = (data.get('body')  or '').strip()
        subscription_id = data.get('subscription_id')

        if not title or not body:
            return jsonify({'status': 'error', 'message': 'title and body are required'}), 400

        # Unique tag so scheduled notifications can never clobber this one
        tag = f"cuddles-custom-{int(_dt.now().timestamp())}"

        vapid_email = _app.config['VAPID_EMAIL']
        if not vapid_email.startswith('mailto:'):
            vapid_email = f'mailto:{vapid_email}'

        payload = _json.dumps({
            'title': title,
            'body': remove_html_tags(body),
            'icon': '/icon-192x192.png',
            'badge': '/icon-192x192.png',
            'tag': tag,
            'requireInteraction': True,
            'renotify': False,
            'timestamp': int(_dt.now().timestamp() * 1000),
        })

        # Resolve target subscriptions
        if subscription_id:
            try:
                subscription_id = int(subscription_id)
            except (TypeError, ValueError):
                return jsonify({'status': 'error', 'message': 'subscription_id must be a number'}), 400
            sub = Subscription.query.get(subscription_id)
            if not sub:
                return jsonify({'status': 'error', 'message': f'Subscription {subscription_id} not found'}), 404
            targets = [sub]
            target_label = f'subscription #{subscription_id}'
        else:
            targets = Subscription.query.all()
            target_label = f'all {len(targets)} subscription(s)'

        sent, failed = 0, 0
        for sub in targets:
            sub_info = sub.subscription_info
            if isinstance(sub_info, str):
                sub_info = _json.loads(sub_info)
            try:
                _webpush(
                    subscription_info=sub_info,
                    data=payload,
                    vapid_private_key=_app.config['VAPID_PRIVATE_KEY'],
                    vapid_claims={'sub': vapid_email},
                    headers={'Urgency': 'high', 'TTL': '86400'},
                )
                sent += 1
            except _WPE as e:
                failed += 1
                if e.response and e.response.status_code == 410:
                    db.session.delete(sub)
                    db.session.commit()
            except Exception:
                failed += 1

        print(f"📨 Custom push to {target_label}: [{title}] {body[:80]} — sent={sent} failed={failed}")
        status = 'success' if failed == 0 else ('partial' if sent > 0 else 'error')
        return jsonify({'status': status, 'target': target_label, 'sent': sent, 'failed': failed}), 200

    except Exception as e:
        print(f'ERROR send_custom: {e}')
        return jsonify({'status': 'error', 'message': str(e)}), 500


@bp.route("/api/test-push", methods=["GET"])
def test_push():
    """
    Enhanced test push endpoint to try all notification types.
    Usage: 
    - /api/test-push?type=wild_tips (send to all)
    - /api/test-push?type=achievements&subscription_id=1 (send to specific subscription)
    """
    import random
    from app.config.messages import get_fertile_messages, get_period_soon_messages, NOTIFICATION_MESSAGES
    from app.services.sex_service import SexService
    
    test_type = request.args.get('type', 'random')
    subscription_id = request.args.get('subscription_id', None)
    message = None
    title = "Test Alert"

    # Comprehensive test options
    test_options = {
        'ovulation': ('🌸 Fertility Test', get_fertile_messages()),
        'period': ('📅 Period Test', get_period_soon_messages(3)),
        'wild_tips': ('😈 Wild Tip Test', NOTIFICATION_MESSAGES['wild_sex_tips']),
        'health': ('💪 Health Tip Test', NOTIFICATION_MESSAGES['health_nutrition']),
        'encouragement': ('⏰ Encouragement Test', [msg.format(days=5) for msg in NOTIFICATION_MESSAGES['sex_encouragement']]),
        'period_passion': ('🌹 Period Passion Test', NOTIFICATION_MESSAGES['period_encouragement']),
        'double_entry': ('🔥 Double Entry Test', NOTIFICATION_MESSAGES['double_entry']),
        'achievements': ('🏆 Achievement Test', NOTIFICATION_MESSAGES['achievements']),
        'orgasm_facts': ('💫 Fun Facts Test', NOTIFICATION_MESSAGES['orgasm_celebration']),
        'connection': ('💕 Connection Test', NOTIFICATION_MESSAGES['intimate_connection']),
        'streaks': ('🔥 Streak Test', [msg.format(period="weekly", count=5) for msg in NOTIFICATION_MESSAGES['streaks']])
    }
    
    if test_type == 'random':
        # Pick a random test type
        test_type = random.choice(list(test_options.keys()))
        
    if test_type in test_options:
        title, messages = test_options[test_type]
        
        # Special handling for achievements (pure creativity, no metrics!)
        if test_type == 'achievements':
            messages = NOTIFICATION_MESSAGES['achievements']  # No formatting needed
        
        message = random.choice(messages)
    else:
        # List all available test types
        available_types = list(test_options.keys()) + ['random']
        return jsonify({
            "status": "error", 
            "message": f"Unknown test type: {test_type}",
            "available_types": available_types
        }), 400
    
    # Send the notification (to specific subscription or all)
    if subscription_id:
        # Send to specific subscription
        try:
            subscription_id = int(subscription_id)
            subscription = Subscription.query.get(subscription_id)
            if not subscription:
                return jsonify({
                    "status": "error",
                    "message": f"Subscription ID {subscription_id} not found"
                }), 404
            
            print(f"🧪 Testing notification type '{test_type}' to subscription #{subscription_id}")
            print(f"   Selected message: {message[:100]}{'...' if len(message) > 100 else ''}")
            
            # Send to specific subscription
            success = NotificationService.send_to_specific_subscription(subscription, title, message)
            
            return jsonify({
                "status": "success" if success else "partial_success", 
                "message": f"{title} sent to subscription #{subscription_id}",
                "test_type": test_type,
                "notification_content": message,
                "target": f"subscription #{subscription_id}",
                "endpoint_preview": subscription.endpoint[:50] + "..." if len(subscription.endpoint) > 50 else subscription.endpoint,
                "available_types": list(test_options.keys()) + ['random']
            }), 200
            
        except ValueError:
            return jsonify({
                "status": "error",
                "message": "Invalid subscription_id. Must be a number."
            }), 400
        except Exception as e:
            return jsonify({
                "status": "error",
                "message": f"Error sending to subscription #{subscription_id}: {str(e)}"
            }), 500
    else:
        # Send to all subscriptions (existing behavior)
        print(f"🧪 Testing notification type '{test_type}' to ALL subscriptions")
        print(f"   Selected message: {message[:100]}{'...' if len(message) > 100 else ''}")
        
        NotificationService.send_push_notification(title, message)
        
        return jsonify({
            "status": "success", 
            "message": f"{title} push notification sent to all subscriptions",
            "test_type": test_type,
            "notification_content": message,
            "target": "all subscriptions",
            "available_types": list(test_options.keys()) + ['random']
        }), 200