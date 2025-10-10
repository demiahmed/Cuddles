from app.models.base import BaseModel, db

class Sex(BaseModel):
    __tablename__ = "sex"
    
    id = db.Column(db.Integer, primary_key=True)
    datetime_iso = db.Column(db.String(40), nullable=False)
    protected = db.Column(db.String(32), nullable=True)
    satisfaction = db.Column(db.Integer, nullable=True)
    lube = db.Column(db.String(8), nullable=True)
    time_of_day = db.Column(db.String(32), nullable=True)
    notes = db.Column(db.Text, nullable=True)

    def to_dict(self):
        return {
            "id": self.id,
            "type": "sex",
            "entry_type": "sex",
            "datetime": self.datetime_iso,
            "protected": self.protected,
            "satisfaction": self.satisfaction,
            "lube": self.lube,
            "time_of_day": self.time_of_day,
            "notes": self.notes,
            "created_at": self.created_at
        }