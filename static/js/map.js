// static/js/map.js

// انتظار تحميل الصفحة
document.addEventListener('DOMContentLoaded', function() {
    initAcademicMap();
});

function initAcademicMap() {
    const mapElement = document.getElementById('map');
    
    if (!mapElement) return;
    
    // إزالة محتوى التحميل
    mapElement.innerHTML = '';
    mapElement.style.height = '400px';
    mapElement.style.backgroundColor = '#f8f9fa';
    
    // إحداثيات المعهد (جامعة الأميرة نورة)
    const instituteCoords = [24.8411, 46.7112];
    
    // إنشاء الخريطة
    const map = L.map('map', {
        center: instituteCoords,
        zoom: 17,
        zoomControl: true,
        fadeAnimation: true
    });

    // إضافة طبقة الخريطة من OpenStreetMap
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
        minZoom: 15
    }).addTo(map);

    // أيقونات مخصصة للدكاترة
    const doctorIcon = L.divIcon({
        html: '<i class="fas fa-user-md"></i>',
        className: 'custom-marker-doctor',
        iconSize: [40, 40],
        popupAnchor: [0, -20]
    });

    // أيقونات مخصصة للقاعات
    const classIcon = L.divIcon({
        html: '<i class="fas fa-chalkboard-teacher"></i>',
        className: 'custom-marker-class',
        iconSize: [40, 40],
        popupAnchor: [0, -20]
    });

    // أيقونات مخصصة للإدارة
    const adminIcon = L.divIcon({
        html: '<i class="fas fa-building"></i>',
        className: 'custom-marker-admin',
        iconSize: [40, 40],
        popupAnchor: [0, -20]
    });

    // جلب البيانات من API
    fetch('/api/locations')
        .then(response => response.json())
        .then(data => {
            
            // إضافة علامات الدكاترة
            if (data.doctors && data.doctors.length > 0) {
                data.doctors.forEach(doc => {
                    if (doc.lat && doc.lng) {
                        const marker = L.marker([doc.lat, doc.lng], { 
                            icon: doctorIcon,
                            title: doc.name,
                            riseOnHover: true
                        }).addTo(map);
                        
                        // محتوى النافذة المنبثقة
                        const popupContent = `
                            <div style="direction: rtl; text-align: right; min-width: 250px; padding: 5px;">
                                <h6 style="color: #3498db; margin: 0 0 8px 0; font-weight: bold; font-size: 16px;">
                                    <i class="fas fa-user-md"></i> ${doc.name}
                                </h6>
                                <p style="margin: 0 0 5px 0; color: #2c3e50;">
                                    <i class="fas fa-briefcase" style="margin-left: 5px; width: 20px;"></i> 
                                    ${doc.role || 'عضو هيئة تدريس'}
                                </p>
                                ${doc.room ? `
                                    <p style="margin: 0 0 5px 0; color: #2c3e50;">
                                        <i class="fas fa-door-open" style="margin-left: 5px; width: 20px;"></i> 
                                        غرفة: ${doc.room}
                                    </p>
                                ` : ''}
                                ${doc.floor ? `
                                    <p style="margin: 0 0 5px 0; color: #2c3e50;">
                                        <i class="fas fa-layer-group" style="margin-left: 5px; width: 20px;"></i> 
                                        ${getFloorNameArabic(doc.floor)}
                                    </p>
                                ` : ''}
                                <hr style="margin: 10px 0; opacity: 0.2;">
                                <a href="/doctor/${doc.id}" style="color: #3498db; text-decoration: none; display: block; text-align: center;">
                                    <i class="fas fa-external-link-alt"></i> عرض التفاصيل الكاملة
                                </a>
                            </div>
                        `;
                        
                        marker.bindPopup(popupContent, {
                            maxWidth: 300,
                            minWidth: 250
                        });
                    }
                });
            }
            
            // إضافة علامات القاعات
            if (data.classes && data.classes.length > 0) {
                data.classes.forEach(cls => {
                    if (cls.lat && cls.lng) {
                        const marker = L.marker([cls.lat, cls.lng], { 
                            icon: classIcon,
                            title: cls.name,
                            riseOnHover: true
                        }).addTo(map);
                        
                        marker.bindPopup(`
                            <div style="direction: rtl; text-align: right; padding: 5px;">
                                <h6 style="color: #27ae60; margin: 0 0 8px 0; font-weight: bold;">
                                    <i class="fas fa-chalkboard-teacher"></i> ${cls.name}
                                </h6>
                                ${cls.room ? `
                                    <p style="margin: 0 0 5px 0;">
                                        <i class="fas fa-door-open"></i> ${cls.room}
                                    </p>
                                ` : ''}
                            </div>
                        `);
                    }
                });
            }

            // إضافة طبقة توضح حدود المعهد
            const bounds = L.rectangle([
                [24.8400, 46.7100],
                [24.8420, 46.7125]
            ], {
                color: "#3498db",
                weight: 2,
                opacity: 0.5,
                fillOpacity: 0.1,
                dashArray: '5, 5'
            }).addTo(map);
            
            bounds.bindPopup(`
                <div style="direction: rtl; text-align: center;">
                    <strong>مبنى المعهد</strong><br>
                    <small>المنطقة الرئيسية</small>
                </div>
            `);

            // تكبير الخريطة لتناسب جميع العلامات
            if ((data.doctors && data.doctors.length > 0) || (data.classes && data.classes.length > 0)) {
                const group = L.featureGroup();
                
                if (data.doctors) {
                    data.doctors.forEach(d => {
                        if (d.lat && d.lng) L.marker([d.lat, d.lng]).addTo(group);
                    });
                }
                
                if (data.classes) {
                    data.classes.forEach(c => {
                        if (c.lat && c.lng) L.marker([c.lat, c.lng]).addTo(group);
                    });
                }
                
                if (group.getLayers().length > 0) {
                    map.fitBounds(group.getBounds().pad(0.2));
                }
            }
            
            // إضافة زر لتحديد الموقع (اختياري)
            if (navigator.geolocation) {
                const locateBtn = L.control({position: 'topleft'});
                locateBtn.onAdd = function(map) {
                    const btn = L.DomUtil.create('button', 'leaflet-bar leaflet-control leaflet-control-custom');
                    btn.innerHTML = '<i class="fas fa-location-dot"></i>';
                    btn.style.backgroundColor = 'white';
                    btn.style.width = '34px';
                    btn.style.height = '34px';
                    btn.style.lineHeight = '34px';
                    btn.style.textAlign = 'center';
                    btn.style.cursor = 'pointer';
                    btn.style.border = '2px solid rgba(0,0,0,0.2)';
                    btn.style.borderRadius = '4px';
                    btn.style.fontSize = '18px';
                    
                    btn.onclick = function() {
                        navigator.geolocation.getCurrentPosition(
                            function(position) {
                                const lat = position.coords.latitude;
                                const lng = position.coords.longitude;
                                map.setView([lat, lng], 18);
                                L.marker([lat, lng], {
                                    icon: L.divIcon({
                                        html: '<i class="fas fa-location-dot" style="color: white;"></i>',
                                        className: 'custom-marker-location',
                                        iconSize: [30, 30]
                                    })
                                }).addTo(map).bindPopup('موقعك الحالي').openPopup();
                            },
                            function(error) {
                                alert('لا يمكن تحديد موقعك: ' + error.message);
                            }
                        );
                    };
                    return btn;
                };
                locateBtn.addTo(map);
            }
        })
        .catch(error => {
            console.error('خطأ في تحميل البيانات:', error);
            mapElement.innerHTML = '<div class="alert alert-danger m-3">حدث خطأ في تحميل الخريطة</div>';
        });
}

// دالة مساعدة للحصول على اسم الدور بالعربية
function getFloorNameArabic(floor) {
    const floors = {
        'G': 'الدور الأرضي',
        'F': 'الدور الأول',
        'S': 'الدور الثاني'
    };
    return floors[floor] || floor;
}

// إضافة أنماط إضافية للخريطة
(function addMapStyles() {
    const style = document.createElement('style');
    style.textContent = `
        .custom-marker-doctor {
            background: linear-gradient(135deg, #3498db, #2980b9);
            border-radius: 50% 50% 50% 0;
            border: 3px solid white;
            width: 40px !important;
            height: 40px !important;
            transform: rotate(-45deg);
            box-shadow: 0 4px 10px rgba(0,0,0,0.3);
            text-align: center;
            line-height: 40px;
            color: white;
            font-size: 20px;
            transition: transform 0.3s;
        }
        .custom-marker-doctor:hover {
            transform: rotate(-45deg) scale(1.1);
        }
        .custom-marker-doctor i {
            transform: rotate(45deg);
        }
        .custom-marker-class {
            background: linear-gradient(135deg, #27ae60, #219a52);
            border-radius: 50% 50% 50% 0;
            border: 3px solid white;
            width: 40px !important;
            height: 40px !important;
            transform: rotate(-45deg);
            box-shadow: 0 4px 10px rgba(0,0,0,0.3);
            text-align: center;
            line-height: 40px;
            color: white;
            font-size: 20px;
            transition: transform 0.3s;
        }
        .custom-marker-class:hover {
            transform: rotate(-45deg) scale(1.1);
        }
        .custom-marker-class i {
            transform: rotate(45deg);
        }
        .custom-marker-admin {
            background: linear-gradient(135deg, #f39c12, #e67e22);
            border-radius: 50% 50% 50% 0;
            border: 3px solid white;
            width: 40px !important;
            height: 40px !important;
            transform: rotate(-45deg);
            box-shadow: 0 4px 10px rgba(0,0,0,0.3);
            text-align: center;
            line-height: 40px;
            color: white;
            font-size: 20px;
            transition: transform 0.3s;
        }
        .custom-marker-admin:hover {
            transform: rotate(-45deg) scale(1.1);
        }
        .custom-marker-admin i {
            transform: rotate(45deg);
        }
        .custom-marker-location {
            background: linear-gradient(135deg, #e74c3c, #c0392b);
            border-radius: 50% 50% 50% 0;
            border: 3px solid white;
            width: 30px !important;
            height: 30px !important;
            transform: rotate(-45deg);
            box-shadow: 0 4px 10px rgba(0,0,0,0.3);
            text-align: center;
            line-height: 30px;
            color: white;
            font-size: 16px;
        }
        .custom-marker-location i {
            transform: rotate(45deg);
        }
        .leaflet-popup-content {
            direction: rtl !important;
            text-align: right !important;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            margin: 10px !important;
        }
        .leaflet-popup-content-wrapper {
            border-radius: 10px !important;
            box-shadow: 0 3px 15px rgba(0,0,0,0.2) !important;
        }
        .leaflet-popup-tip {
            box-shadow: 0 3px 15px rgba(0,0,0,0.2) !important;
        }
        .leaflet-control-custom {
            background: white;
            border-radius: 4px;
            cursor: pointer;
            transition: all 0.3s;
        }
        .leaflet-control-custom:hover {
            background: #f8f9fa;
            transform: scale(1.1);
        }
    `;
    document.head.appendChild(style);
})();