import json
from collections import Counter
from datetime import datetime, timedelta

from app.models.daily_log import DailyLog
from app.models.base import db


class WellnessService:

    # ------------------------------------------------------------------ #
    # CRUD                                                                 #
    # ------------------------------------------------------------------ #

    @classmethod
    def get_entry_by_date(cls, date_str):
        return DailyLog.query.filter_by(date=date_str).first()

    @classmethod
    def has_entry_today(cls):
        today = datetime.now().date().isoformat()
        return DailyLog.query.filter_by(date=today).first() is not None

    @classmethod
    def get_entries_for_month(cls, year, month):
        prefix = f"{year}-{month:02d}"
        entries = (
            DailyLog.query
            .filter(DailyLog.date.like(f"{prefix}%"))
            .order_by(DailyLog.date.asc())
            .all()
        )
        return [e.to_dict() for e in entries]

    @classmethod
    def save_entry(cls, data):
        date_str = data.get('date')
        if not date_str:
            raise ValueError("date is required")

        entry = DailyLog.query.filter_by(date=date_str).first()
        if not entry:
            entry = DailyLog(date=date_str)
            db.session.add(entry)

        entry.mood_score = data.get('mood_score')
        entry.energy_level = data.get('energy_level')
        entry.stress_level = data.get('stress_level')
        entry.sleep_hours = data.get('sleep_hours')
        entry.sleep_quality = data.get('sleep_quality')
        entry.food_quality = data.get('food_quality')
        entry.food_notes = data.get('food_notes')
        entry.workout = data.get('workout', False)

        wt = data.get('workout_type', [])
        entry.workout_type = json.dumps(wt) if wt else None
        entry.workout_duration_min = data.get('workout_duration_min')

        entry.has_pain = data.get('has_pain', False)
        pl = data.get('pain_locations', [])
        entry.pain_locations = json.dumps(pl) if pl else None
        entry.pain_level = data.get('pain_level')
        entry.pain_notes = data.get('pain_notes')
        entry.partner_rating = data.get('partner_rating')
        entry.notes = data.get('notes')
        entry.updated_at = datetime.utcnow().isoformat()

        db.session.commit()
        return entry.to_dict()

    @classmethod
    def delete_entry(cls, date_str):
        entry = DailyLog.query.filter_by(date=date_str).first()
        if entry:
            db.session.delete(entry)
            db.session.commit()
            return True
        return False

    # ------------------------------------------------------------------ #
    # Stats / Analytics                                                    #
    # ------------------------------------------------------------------ #

    @classmethod
    def get_stats(cls, days=60):
        cutoff = (datetime.now().date() - timedelta(days=days)).isoformat()
        entries = (
            DailyLog.query
            .filter(DailyLog.date >= cutoff)
            .order_by(DailyLog.date.asc())
            .all()
        )

        if not entries:
            return cls._empty_stats()

        dicts = [e.to_dict() for e in entries]

        mood_scores   = [e['mood_score']   for e in dicts if e['mood_score']   is not None]
        energy_levels = [e['energy_level'] for e in dicts if e['energy_level'] is not None]
        stress_levels = [e['stress_level'] for e in dicts if e['stress_level'] is not None]
        sleep_hours   = [e['sleep_hours']  for e in dicts if e['sleep_hours']  is not None]
        sleep_quals   = [e['sleep_quality']for e in dicts if e['sleep_quality']is not None]

        workout_days = [e for e in dicts if e['workout']]
        pain_days    = [e for e in dicts if e['has_pain']]

        # Mood on workout vs non-workout days
        mood_w  = [e['mood_score'] for e in workout_days if e['mood_score'] is not None]
        mood_nw = [e['mood_score'] for e in dicts if not e['workout'] and e['mood_score'] is not None]

        # Food quality → average mood
        food_mood_map = {}
        for e in dicts:
            if e['food_quality'] and e['mood_score'] is not None:
                food_mood_map.setdefault(e['food_quality'], []).append(e['mood_score'])
        food_mood_avg = {k: round(sum(v) / len(v), 1) for k, v in food_mood_map.items()}

        # Pain location frequency
        pain_location_counts = Counter()
        for e in pain_days:
            for loc in (e['pain_locations'] or []):
                pain_location_counts[loc] += 1

        # Workout type frequency
        workout_type_counts = Counter()
        for e in workout_days:
            for wt in (e['workout_type'] or []):
                workout_type_counts[wt] += 1

        def avg(lst):
            return round(sum(lst) / len(lst), 1) if lst else None

        return {
            'entries': dicts,
            'summary': {
                'total_entries':          len(dicts),
                'avg_mood':               avg(mood_scores),
                'avg_energy':             avg(energy_levels),
                'avg_stress':             avg(stress_levels),
                'avg_sleep_hours':        avg(sleep_hours),
                'avg_sleep_quality':      avg(sleep_quals),
                'workout_days_count':     len(workout_days),
                'pain_days_count':        len(pain_days),
                'top_pain_locations':     [loc for loc, _ in pain_location_counts.most_common(5)],
                'pain_location_counts':   dict(pain_location_counts),
                'workout_type_counts':    dict(workout_type_counts),
                'avg_mood_workout_days':  avg(mood_w),
                'avg_mood_no_workout':    avg(mood_nw),
                'food_mood_avg':          food_mood_avg,
            },
        }

    @staticmethod
    def _empty_stats():
        return {
            'entries': [],
            'summary': {
                'total_entries':          0,
                'avg_mood':               None,
                'avg_energy':             None,
                'avg_stress':             None,
                'avg_sleep_hours':        None,
                'avg_sleep_quality':      None,
                'workout_days_count':     0,
                'pain_days_count':        0,
                'top_pain_locations':     [],
                'pain_location_counts':   {},
                'workout_type_counts':    {},
                'avg_mood_workout_days':  None,
                'avg_mood_no_workout':    None,
                'food_mood_avg':          {},
            },
        }
