import json
from datetime import datetime
from dateutil.relativedelta import relativedelta
from sqlalchemy import func
from app.models import db, Period, Sex
from app.services.base_service import BaseService
from app.utils.helpers import parse_iso


class EntriesService(BaseService):
    @classmethod
    def create_entry(cls, data):
        if not data or not isinstance(data, dict):
            raise ValueError("Invalid JSON data")

        dt_str = data.get("datetime")
        dt = parse_iso(dt_str)
        if not dt:
            raise ValueError(f"Invalid datetime: {dt_str}")
        if not data.get("entry_type"):
            raise ValueError("Entry type is required")

        entry_type = data.get("entry_type")
        try:
            # Format datetime consistently
            formatted_dt = dt.isoformat()
            
            if entry_type in ["period_start", "period_end"]:
                e = Period(
                    entry_type=entry_type,
                    datetime_iso=formatted_dt,
                    flow=data.get("flow"),
                    pain=data.get("pain"),
                    mood=data.get("mood"),
                    symptoms_json=json.dumps(data.get("symptoms") or []),
                    notes=data.get("notes")
                )
            elif entry_type == "sex":
                satisfaction = data.get("satisfaction")
                e = Sex(
                    datetime_iso=formatted_dt,
                    protected=data.get("protected"),
                    satisfaction=int(satisfaction) if satisfaction else None,
                    lube=data.get("lube"),
                    time_of_day=data.get("time_of_day"),
                    notes=data.get("notes")
                )
            else:
                raise ValueError(f"Invalid entry_type: {entry_type}")

            db.session.add(e)
            db.session.commit()
            
            # Return the entry with consistent type/entry_type fields
            return e
            
        except Exception as e:
            db.session.rollback()
            raise ValueError(f"Failed to create entry: {str(e)}")

    @classmethod
    def get_entry(cls, entry_id):
        period = Period.query.get(entry_id)
        if period:
            return period
        sex = Sex.query.get(entry_id)
        if sex:
            return sex
        return None

    @classmethod
    def get_entries(cls, year=None, month=None, start=None, end=None):
        # Initialize queries for both tables
        period_query = Period.query
        sex_query = Sex.query

        if year and month:
            try:
                year = int(year)
                month = int(month)
                start_date = datetime(year, month, 1)
                end_date = start_date + relativedelta(months=1) - relativedelta(days=1)
                start_date_str = start_date.strftime('%Y-%m-%d')
                end_date_str = end_date.strftime('%Y-%m-%d')
                
                print(f"🔍 Querying entries for {year}-{month:02d}")
                print(f"📅 Date range: {start_date_str} to {end_date_str}")
                
                # Use date-based comparison for consistency
                period_query = period_query.filter(
                    func.date(Period.datetime_iso) >= start_date_str,
                    func.date(Period.datetime_iso) <= end_date_str
                )
                sex_query = sex_query.filter(
                    func.date(Sex.datetime_iso) >= start_date_str,
                    func.date(Sex.datetime_iso) <= end_date_str
                )
            except ValueError as exc:
                print(f"❌ Invalid year/month: {year}/{month}")
                raise ValueError("Invalid year or month") from exc
        else:
            if start:
                sdt = parse_iso(start)
                if sdt:
                    start_str = sdt.date().isoformat()
                    print(f"📅 Filtering from {start_str}")
                    period_query = period_query.filter(func.date(Period.datetime_iso) >= start_str)
                    sex_query = sex_query.filter(func.date(Sex.datetime_iso) >= start_str)
            if end:
                edt = parse_iso(end)
                if edt:
                    end_str = edt.date().isoformat()
                    print(f"📅 Filtering until {end_str}")
                    period_query = period_query.filter(func.date(Period.datetime_iso) <= end_str)
                    sex_query = sex_query.filter(func.date(Sex.datetime_iso) <= end_str)

        periods = period_query.order_by(Period.datetime_iso).all()
        sex_entries = sex_query.order_by(Sex.datetime_iso).all()
        entries = periods + sex_entries
        entries.sort(key=lambda x: x.datetime_iso)  # Sort combined entries by datetime
        return entries

    @classmethod
    def update_entry(cls, entry_type, entry_id, data):
        model = Period if entry_type in ["period_start", "period_end"] else Sex if entry_type == "sex" else None
        if not model:
            raise ValueError(f"Invalid entry_type: {entry_type}")

        e = model.query.get_or_404(entry_id)

        if "datetime" in data:
            dt = parse_iso(data.get("datetime"))
            if dt:
                e.datetime_iso = dt.isoformat()
            else:
                raise ValueError("Invalid datetime")

        if model == Period:
            for k in ("entry_type", "flow", "pain", "mood", "notes"):
                if k in data:
                    setattr(e, k, data.get(k))
            if "symptoms" in data:
                e.symptoms_json = data.get("symptoms") or []
        else:  # Sex
            for k in ("protected", "lube", "time_of_day", "notes"):
                if k in data:
                    setattr(e, k, data.get(k))
            if "satisfaction" in data:
                setattr(e, "satisfaction", int(data.get("satisfaction")) if data.get("satisfaction") else None)

        db.session.commit()
        return e

    @classmethod
    def delete_entry(cls, entry_type, entry_id):
        print(f"🔍 Delete attempt - Type: {entry_type}, ID: {entry_id}")
        
        # Determine model based on entry type
        model = Period if entry_type in ["period_start", "period_end"] else Sex if entry_type == "sex" else None
        if not model:
            print(f"❌ Invalid entry type: {entry_type}")
            raise ValueError(f"Invalid entry_type: {entry_type}")

        # Try to find the entry
        e = model.query.get(entry_id)
        if not e:
            print(f"❌ Entry not found - Type: {entry_type}, ID: {entry_id}")
            raise ValueError(f"Entry not found: {entry_type} {entry_id}")
            
        print(f"📝 Found entry to delete: {e.to_dict()}")
        
        # For period entries, check if entry_type matches
        if model == Period:
            actual_type = e.entry_type
            if actual_type != entry_type:
                print(f"❌ Entry type mismatch - Expected: {entry_type}, Found: {actual_type}")
                raise ValueError(f"Entry type mismatch: expected {entry_type}, found {actual_type}")
        
        try:
            db.session.delete(e)
            db.session.commit()
            print(f"✅ Successfully deleted entry")
            return True
        except Exception as e:
            print(f"❌ Failed to delete entry: {str(e)}")
            db.session.rollback()
            raise