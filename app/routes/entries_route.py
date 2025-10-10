from datetime import datetime
from flask import Blueprint, jsonify, request
from sqlalchemy.exc import SQLAlchemyError
from app.services.entries_service import EntriesService
from app.models.period import Period
from app.models.sex import Sex

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
            
            # Get the entry before deletion to verify it exists
            entry = EntriesService.get_entry(entry_id)
            if not entry:
                print(f"❌ Entry not found - Type: {entry_type}, ID: {entry_id}")
                return jsonify({"error": "Entry not found"}), 404
            
            # Debug logging
            entry_dict = entry.to_dict()
            print(f"📝 Entry to delete - Dict: {entry_dict}")
            print(f"📝 Entry type check - Entry class: {entry.__class__.__name__}")
            print(f"📝 Entry type check - Expected type: {entry_type}")
            print(f"📝 Entry type check - Dict type: {entry_dict.get('type')}")
            print(f"📝 Entry type check - Dict entry_type: {entry_dict.get('entry_type')}")
            
            # For sex entries, we expect entry_type to be 'sex'
            if isinstance(entry, Sex):
                if entry_type != 'sex':
                    print(f"❌ Entry type mismatch - Expected sex entry but got: {entry_type}")
                    return jsonify({"error": "Entry type mismatch"}), 400
            # For period entries, check the specific type (period_start/period_end)
            elif isinstance(entry, Period):
                actual_type = entry.entry_type  # Use the direct attribute
                if actual_type != entry_type:
                    print(f"❌ Entry type mismatch - Expected: {entry_type}, Found: {actual_type}")
                    return jsonify({"error": "Entry type mismatch"}), 400
            else:
                print(f"❌ Unknown entry type: {entry.__class__.__name__}")
                return jsonify({"error": "Invalid entry type"}), 400
            
            # Try to delete
            EntriesService.delete_entry(entry_type, entry_id)
            print(f"✅ Successfully deleted {entry_type} entry {entry_id}")
            return jsonify({"ok": True})
        except ValueError as e:
            return jsonify({"error": str(e)}), 400
        except Exception as e:
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