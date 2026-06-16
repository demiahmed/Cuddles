from app import db

class Subscription(db.Model):
    __tablename__ = "subscription"
    
    id = db.Column(db.Integer, primary_key=True)
    endpoint = db.Column(db.String, unique=True, nullable=False)
    subscription_info = db.Column(db.JSON)

    def __repr__(self):
        return f'<Subscription {self.id}>'