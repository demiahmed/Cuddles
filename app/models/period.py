from typing import Dict, List, Optional
import json
from app.models.base import BaseModel, db

class Period(BaseModel):
    """
    Model representing a period tracking entry.
    
    This model stores information about menstrual periods including start/end times,
    flow levels, associated symptoms, and subjective measures like pain and mood.
    
    Attributes:
        id (int): Primary key
        entry_type (str): Type of entry ("period_start" or "period_end")
        datetime_iso (str): ISO formatted datetime of the entry
        flow (str, optional): Description of flow level (light, medium, heavy)
        pain (int, optional): Pain level on a scale (typically 1-5)
        mood (str, optional): Description of mood
        symptoms_json (str, optional): JSON string containing array of symptoms
        notes (str, optional): Additional notes or observations
    """
    __tablename__ = "period"
    
    id = db.Column(db.Integer, primary_key=True)
    entry_type = db.Column(db.String(32), nullable=False)
    datetime_iso = db.Column(db.String(40), nullable=False)
    flow = db.Column(db.String(32), nullable=True)
    pain = db.Column(db.Integer, nullable=True)
    mood = db.Column(db.String(32), nullable=True)
    symptoms_json = db.Column(db.Text, nullable=True)
    notes = db.Column(db.Text, nullable=True)

    def to_dict(self) -> Dict[str, any]:
        """
        Convert the Period model instance to a dictionary representation.
        
        Returns:
            dict: A dictionary containing all period entry data with properly formatted values
        """
        return {
            "id": self.id,
            "type": self.entry_type,
            "entry_type": self.entry_type,  # Add this for frontend compatibility
            "datetime": self.datetime_iso,
            "flow": self.flow,
            "pain": self.pain,
            "mood": self.mood,
            "symptoms": json.loads(self.symptoms_json) if self.symptoms_json else [],
            "notes": self.notes,
            "created_at": self.created_at
        }