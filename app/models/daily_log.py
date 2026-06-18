import json
from app.models.base import BaseModel, db
from datetime import datetime


class DailyLog(BaseModel):
    __tablename__ = 'daily_log'

    id = db.Column(db.Integer, primary_key=True)
    date = db.Column(db.String(10), unique=True, nullable=False)  # 'YYYY-MM-DD'

    # Mood & emotion  1=awful 2=low 3=okay 4=good 5=amazing
    mood_score = db.Column(db.Integer, nullable=True)

    # Energy  1=very low … 5=very high
    energy_level = db.Column(db.Integer, nullable=True)

    # Stress  1=very relaxed … 5=very stressed
    stress_level = db.Column(db.Integer, nullable=True)

    # Sleep
    sleep_hours = db.Column(db.Float, nullable=True)
    sleep_quality = db.Column(db.Integer, nullable=True)  # 1-5

    # Food
    food_quality = db.Column(db.String(20), nullable=True)  # poor/fair/good/excellent
    food_notes = db.Column(db.Text, nullable=True)

    # Workout / activity
    workout = db.Column(db.Boolean, default=False, nullable=True)
    workout_type = db.Column(db.Text, nullable=True)        # JSON array of strings
    workout_duration_min = db.Column(db.Integer, nullable=True)

    # Pain
    has_pain = db.Column(db.Boolean, default=False, nullable=True)
    pain_locations = db.Column(db.Text, nullable=True)      # JSON array of strings
    pain_level = db.Column(db.Integer, nullable=True)       # 1-10
    pain_notes = db.Column(db.Text, nullable=True)

    # Partner / relationship
    partner_rating = db.Column(db.Integer, nullable=True)  # 1-5

    # Free-form journal
    notes = db.Column(db.Text, nullable=True)

    updated_at = db.Column(db.String(40), nullable=True)

    def to_dict(self):
        return {
            'id': self.id,
            'date': self.date,
            'mood_score': self.mood_score,
            'energy_level': self.energy_level,
            'stress_level': self.stress_level,
            'sleep_hours': self.sleep_hours,
            'sleep_quality': self.sleep_quality,
            'food_quality': self.food_quality,
            'food_notes': self.food_notes,
            'workout': self.workout,
            'workout_type': json.loads(self.workout_type) if self.workout_type else [],
            'workout_duration_min': self.workout_duration_min,
            'has_pain': self.has_pain,
            'pain_locations': json.loads(self.pain_locations) if self.pain_locations else [],
            'pain_level': self.pain_level,
            'pain_notes': self.pain_notes,
            'partner_rating': self.partner_rating,
            'notes': self.notes,
            'created_at': self.created_at,
            'updated_at': self.updated_at,
        }
