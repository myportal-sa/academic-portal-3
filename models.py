# models.py

from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

class Doctor(db.Model):
    __tablename__ = 'doctors'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    role = db.Column(db.String(100))
    
    floor = db.Column(db.String(10))
    room_number = db.Column(db.String(20))
    full_room = db.Column(db.String(30))
    
    latitude = db.Column(db.Float)
    longitude = db.Column(db.Float)
    image_url = db.Column(db.String(500))
    bio = db.Column(db.Text)
    
    department = db.Column(db.String(100))
    
    classes = db.relationship('Class', backref='doctor', lazy=True, cascade="all, delete-orphan")
    
    created_at = db.Column(db.DateTime, server_default=db.func.now())
    updated_at = db.Column(db.DateTime, onupdate=db.func.now())

    def get_floor_arabic(self):
        floors = {
            'G': 'الدور الأرضي',
            'F': 'الدور الأول', 
            'S': 'الدور الثاني'
        }
        return floors.get(self.floor, self.floor or 'غير محدد')
    
    def get_room_display(self):
        if self.full_room:
            return self.full_room
        elif self.floor and self.room_number:
            return f"{self.floor}-{self.room_number}"
        return 'غير محدد'
    
    def __repr__(self):
        return f'<Doctor {self.name} - {self.full_room}>'

class Class(db.Model):
    __tablename__ = 'classes'
    id = db.Column(db.Integer, primary_key=True)
    doctor_id = db.Column(db.Integer, db.ForeignKey('doctors.id'), nullable=False)
    name = db.Column(db.String(100), nullable=False)
    
    floor = db.Column(db.String(10))
    room_number = db.Column(db.String(20))
    full_room = db.Column(db.String(30))
    
    latitude = db.Column(db.Float)
    longitude = db.Column(db.Float)
    room = db.Column(db.String(50))
    schedule = db.Column(db.String(200))
    
    created_at = db.Column(db.DateTime, server_default=db.func.now())

    def get_floor_arabic(self):
        floors = {
            'G': 'الدور الأرضي',
            'F': 'الدور الأول',
            'S': 'الدور الثاني'
        }
        return floors.get(self.floor, self.floor or 'غير محدد')
    
    def __repr__(self):
        return f'<Class {self.name}>'