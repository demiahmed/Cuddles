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

@bp.route("/test-push", methods=["GET"])
def test_push():
    """
    A Flask route to manually trigger a test push notification.
    """
    test_type = request.args.get('type')
    message = None
    title = "Test Alert"

    if test_type == "ovulation":
        title = "Ovulation Alert"
        message = "🔥 Test ovulation alert!"
    elif test_type == "period":
        title = "Period Reminder"
        message = "🌸 Test period reminder!"
    else:
        title = "Generic Test Alert"
        message = "This is a simple test notification from your app."
    
    NotificationService.send_push_notification(title, message)
    
    return jsonify({"status": "success", "message": f"{title} push notifications sent"}), 200