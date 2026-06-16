from datetime import datetime
from flask import Blueprint, jsonify, request
from sqlalchemy.exc import SQLAlchemyError
from app.services.entries_service import EntriesService
from app.models.period import Period
from app.models.sex import Sex
from app import db

bp = Blueprint('entries', __name__)

def parse_iso(dt_str):
    """Parse an ISO datetime string into a datetime object."""
    try:
        if not dt_str:
            return None
        dt_str = dt_str.split('.')[0] + 'Z' if '.' in dt_str else dt_str
        dt = datetime.fromisoformat(dt_str.replace('Z', '+00:00'))
        return dt
    except (ValueError, TypeError) as e:
        print(f"Failed to parse datetime: {dt_str}, Error: {str(e)}")
        return None

@bp.route("/api/entries", methods=["GET", "POST"])
@bp.route("/api/entries/<int:entry_id>", methods=["GET"])
def entries_route(entry_id=None):
    if request.method == "POST":
        try:
            data = request.get_json()
            print(f"📝 Creating new entry with data: {data}")
            entry = EntriesService.create_entry(data)
            result = entry.to_dict()
            print(f"✅ Entry created successfully: {result}")
            return jsonify(result), 201
        except ValueError as e:
            print(f"Failed to create entry: {str(e)}")
            return jsonify({"error": str(e)}), 400
        except SQLAlchemyError as e:
            return jsonify({"error": "Database error occurred"}), 500

    # GET specific entry
    if request.method == "GET" and entry_id is not None:
        try:
            print(f"🔍 Fetching entry with ID: {entry_id}")
            entry = EntriesService.get_entry(entry_id)
            if not entry:
                print(f"❌ No entry found with ID: {entry_id}")
                return jsonify({"error": "Resource not found"}), 404
            result = entry.to_dict()
            print(f"✅ Entry found: {result}")
            return jsonify(result)
        except (ValueError, TypeError) as e:
            return jsonify({"error": "Invalid entry ID"}), 400
        except SQLAlchemyError as e:
            return jsonify({"error": "Database error occurred"}), 500
        except AttributeError:
            return jsonify({"error": "Entry has missing or invalid data"}), 500

    # GET all entries
    try:
        year = request.args.get("year")
        month = request.args.get("month")
        start = request.args.get("start")
        end = request.args.get("end")

        entries = EntriesService.get_entries(year, month, start, end)
        return jsonify([e.to_dict() for e in entries])
    except ValueError as e:
        print(f"Failed to fetch entries: {str(e)}")
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        print(f"Failed to fetch entries: {str(e)}")
        return jsonify({"error": str(e)}), 500


@bp.route("/api/entries/<string:entry_type>/<int:entry_id>", methods=["PUT", "DELETE"])
def entry_item(entry_type, entry_id):
    if request.method == "DELETE":
        try:
            print(f"🗑️ DELETE Request - Type: {entry_type}, ID: {entry_id}")
            
            # Try to find the entry in both tables since IDs might overlap
            sex_entry = None
            period_entry = None
            
            # Check sex table first if requested type is sex
            if entry_type == 'sex':
                try:
                    sex_entry = Sex.query.get(entry_id)
                    if sex_entry:
                        print(f"✅ Found sex entry {entry_id}")
                        db.session.delete(sex_entry)
                        db.session.commit()
                        print(f"✅ Successfully deleted sex entry {entry_id}")
                        return jsonify({"ok": True})
                except Exception as e:
                    print(f"❌ Error deleting sex entry: {e}")
                    db.session.rollback()
            
            # Check period table for period types or as fallback
            if entry_type in ['period_start', 'period_end'] or not sex_entry:
                try:
                    period_entry = Period.query.get(entry_id)
                    if period_entry:
                        print(f"✅ Found period entry {entry_id}: {period_entry.entry_type}")
                        db.session.delete(period_entry)
                        db.session.commit()
                        print(f"✅ Successfully deleted period entry {entry_id}")
                        return jsonify({"ok": True})
                except Exception as e:
                    print(f"❌ Error deleting period entry: {e}")
                    db.session.rollback()
            
            # If no entry found in either table
            print(f"❌ Entry {entry_id} not found in any table")
            return jsonify({"error": "Entry not found"}), 404
            
        except Exception as e:
            print(f"❌ Delete operation failed: {str(e)}")
            db.session.rollback()
            return jsonify({"error": f"Failed to delete entry: {str(e)}"}), 500

    # PUT
    try:
        data = request.get_json()
        print(f"✏️ Updating {entry_type} entry {entry_id} with data: {data}")
        entry = EntriesService.update_entry(entry_type, entry_id, data)
        result = entry.to_dict()
        print(f"✅ Successfully updated entry: {result}")
        return jsonify(result)
    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        return jsonify({"error": f"Failed to update entry: {str(e)}"}), 500