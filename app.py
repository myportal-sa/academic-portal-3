from flask import Flask, render_template, request, redirect, url_for, flash, jsonify
from models import db, Doctor, Class
from config import Config
import os
import json

BASE_DIR = os.path.abspath(os.path.dirname(__file__))
app = Flask(__name__, 
            template_folder=os.path.join(BASE_DIR, 'templates'),
            static_folder=os.path.join(BASE_DIR, 'static'))
app.config.from_object(Config)
app.config['TEMPLATES_AUTO_RELOAD'] = True
app.config['SEND_FILE_MAX_AGE_DEFAULT'] = 0

db.init_app(app)

@app.route('/')
def index():
    doctors = Doctor.query.all()
    
    stats = {
        'total_doctors': len(doctors),
        'ground_floor': Doctor.query.filter_by(floor='G').count(),
        'first_floor': Doctor.query.filter_by(floor='F').count(),
        'second_floor': Doctor.query.filter_by(floor='S').count(),
    }
    
    return render_template('home.html', stats=stats)

@app.route('/map')
def map_page():
    doctors = Doctor.query.all()
    
    stats = {
        'total_doctors': len(doctors),
        'ground_floor': Doctor.query.filter_by(floor='G').count(),
        'first_floor': Doctor.query.filter_by(floor='F').count(),
        'second_floor': Doctor.query.filter_by(floor='S').count(),
    }
    
    doctors_json = []
    for doctor in doctors:
        doctors_json.append({
            'id': doctor.id,
            'name': doctor.name,
            'role': doctor.role,
            'department': doctor.department,
            'image_url': doctor.image_url,
            'bio': doctor.bio,
            'floor': doctor.floor,
            'room_number': doctor.room_number,
            'full_room': doctor.full_room,
            'latitude': doctor.latitude if doctor.latitude else 0,
            'longitude': doctor.longitude if doctor.longitude else 0
        })
        
    return render_template('map.html', stats=stats, doctors_json=doctors_json)

@app.route('/directory')
def directory_page():
    doctors = Doctor.query.all()
    
    stats = {
        'total_doctors': len(doctors),
        'ground_floor': Doctor.query.filter_by(floor='G').count(),
        'first_floor': Doctor.query.filter_by(floor='F').count(),
        'second_floor': Doctor.query.filter_by(floor='S').count(),
    }
    
    return render_template('directory.html', doctors=doctors, stats=stats)

@app.route('/doctor/<int:doctor_id>')
def doctor_detail(doctor_id):
    doctor = Doctor.query.get_or_404(doctor_id)
    return render_template('doctor_detail.html', doctor=doctor)

@app.route('/floor/<string:floor>')
def floor_view(floor):
    if floor not in ['G', 'F', 'S']:
        return redirect(url_for('index'))
    
    doctors = Doctor.query.filter_by(floor=floor).all()
    classes = Class.query.filter_by(floor=floor).all()
    
    floor_names = {'G': 'الأرضي', 'F': 'الأول', 'S': 'الثاني'}
    
    return render_template('floor.html', 
                         floor=floor,
                         floor_name=floor_names.get(floor, floor),
                         doctors=doctors,
                         classes=classes)

@app.route('/api/locations')
def get_locations():
    doctors = Doctor.query.all()
    classes = Class.query.all()
    
    data = {
        'doctors': [{
            'id': d.id, 
            'name': d.name, 
            'lat': d.latitude, 
            'lng': d.longitude, 
            'type': 'doctor',
            'role': d.role,
            'department': d.department,
            'full_room': d.full_room
        } for d in doctors if d.latitude and d.longitude],
        
        'classes': [{
            'id': c.id, 
            'name': c.name, 
            'lat': c.latitude, 
            'lng': c.longitude, 
            'type': 'class',
            'room': c.room,
            'schedule': c.schedule
        } for c in classes if c.latitude and c.longitude]
    }
    return jsonify(data)

@app.route('/api/doctors')
def api_doctors():
    doctors = Doctor.query.all()
    return jsonify([{
        'id': d.id,
        'name': d.name,
        'role': d.role,
        'latitude': d.latitude,
        'longitude': d.longitude,
        'department': d.department,
        'full_room': d.full_room
    } for d in doctors])

@app.route('/chat', methods=['POST'])
def chat():
    data = request.get_json()
    user_message = data.get('message', '')
    
    # Placeholder AI simulation
    import time
    time.sleep(1) # simulate thinking
    
    response = {
        "reply": f"مرحباً! لقد استلمت رسالتك: '{user_message}'. أنا المساعد الذكي، كيف يمكنني مساعدتك اليوم؟"
    }
    return jsonify(response)

def init_db():
    with app.app_context():
        db.create_all()

if __name__ == '__main__':
    init_db()
    app.run(debug=True, port=5000)