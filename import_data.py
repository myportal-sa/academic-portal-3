import pandas as pd
from app import app, db
from models import Doctor, Class
import os

def import_from_csv():
    with app.app_context():
        doctors_csv = 'data/doctors.csv'
        classes_csv = 'data/classes.csv'

        if os.path.exists(doctors_csv):
            print("Importing doctors...")
            df_docs = pd.read_csv(doctors_csv)
            for _, row in df_docs.iterrows():
                if not Doctor.query.filter_by(name=row['name']).first():
                    doc = Doctor(
                        name=row['name'],
                        role=row['role'],
                        latitude=row['latitude'],
                        longitude=row['longitude'],
                        image_url=row['image_url'],
                        bio=row['bio']
                    )
                    db.session.add(doc)
            db.session.commit()
            print("Doctors imported successfully.")

        if os.path.exists(classes_csv):
            print("Importing classes...")
            df_classes = pd.read_csv(classes_csv)
            for _, row in df_classes.iterrows():
                if not Class.query.filter_by(name=row['name'], doctor_id=row['doctor_id']).first():
                    cls = Class(
                        name=row['name'],
                        doctor_id=row['doctor_id'],
                        latitude=row['latitude'],
                        longitude=row['longitude'],
                        room=row['room'],
                        schedule=row['schedule']
                    )
                    db.session.add(cls)
            db.session.commit()
            print("Classes imported successfully.")

if __name__ == '__main__':
    import_from_csv()