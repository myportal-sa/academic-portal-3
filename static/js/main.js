// Interactive Map and UI functionality
function initMap() {
    const mapElement = document.getElementById("map");
    if (!mapElement) return;

    // Riyadh center coordinate
    const center = { lat: 24.7136, lng: 46.6753 };
    
    // Check if google maps is available
    if (typeof google === 'undefined') {
        mapElement.innerHTML = `
            <div class="alert alert-warning m-4 d-flex align-items-center justify-content-center" style="height: 100%;">
                <div class="text-center">
                    <i class="fas fa-exclamation-triangle fa-3x mb-3 text-warning"></i>
                    <h4>عذراً، لم يتم تفعيل خدمة الخرائط</h4>
                    <p>يرجى إضافة Google Maps API Key في ملف الإعدادات لتفعيل الخريطة التفاعلية.</p>
                </div>
            </div>`;
        return;
    }

    const map = new google.maps.Map(mapElement, {
        zoom: 14,
        center: center,
        styles: [
            { "featureType": "water", "stylers": [{ "color": "#e9e9e9" }, { "visibility": "on" }] },
            { "featureType": "landscape", "stylers": [{ "color": "#f5f5f5" }] },
            { "featureType": "road.highway", "stylers": [{ "visibility": "simplified" }] },
            { "featureType": "road.arterial", "stylers": [{ "visibility": "on" }] },
            { "featureType": "road.local", "stylers": [{ "visibility": "on" }] },
            { "featureType": "poi", "stylers": [{ "visibility": "off" }] },
            { "featureType": "administrative", "stylers": [{ "visibility": "on" }, { "lightness": 33 }] },
            { "featureType": "transit", "stylers": [{ "visibility": "on" }] }
        ]
    });

    const infoWindow = new google.maps.InfoWindow();

    // Fetch locations from API
    fetch('/api/locations')
        .then(response => response.json())
        .then(data => {
            // Add Doctors/Staff locations
            if (data.doctors) {
                data.doctors.forEach(doc => {
                    const marker = new google.maps.Marker({
                        position: { lat: parseFloat(doc.lat), lng: parseFloat(doc.lng) },
                        map: map,
                        title: doc.name,
                        icon: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png',
                        animation: google.maps.Animation.DROP
                    });

                    marker.addListener("click", () => {
                        infoWindow.setContent(`
                            <div class="p-2" style="text-align: right; direction: rtl;">
                                <h6 class="mb-1 fw-bold">${doc.name}</h6>
                                <p class="mb-2 text-muted small">${doc.role}</p>
                                <a href="/doctor/${doc.id}" class="btn btn-sm btn-primary py-1 px-3">عرض الملف</a>
                            </div>
                        `);
                        infoWindow.open(map, marker);
                    });
                });
            }

            // Add Classrooms/Offices locations
            if (data.classes) {
                data.classes.forEach(cls => {
                    const marker = new google.maps.Marker({
                        position: { lat: parseFloat(cls.lat), lng: parseFloat(cls.lng) },
                        map: map,
                        title: cls.name,
                        icon: 'http://maps.google.com/mapfiles/ms/icons/green-dot.png',
                        animation: google.maps.Animation.DROP
                    });

                    marker.addListener("click", () => {
                        infoWindow.setContent(`
                            <div class="p-2" style="text-align: right; direction: rtl;">
                                <h6 class="mb-1 fw-bold">${cls.name}</h6>
                                <p class="mb-0 text-muted small">رقم القاعة/المكتب: ${cls.room_number || 'N/A'}</p>
                            </div>
                        `);
                        infoWindow.open(map, marker);
                    });
                });
            }
        })
        .catch(err => console.error("Error fetching locations:", err));
}

// Initialize on window load
window.onload = function() {
    if (typeof initMap === 'function') {
        initMap();
    }
};

// UI Animations and Effects
document.addEventListener('DOMContentLoaded', function() {
    // Add scroll animations for cards
    const cards = document.querySelectorAll('.card');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = 1;
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, { threshold: 0.1 });

    cards.forEach(card => {
        card.style.opacity = 0;
        card.style.transform = 'translateY(20px)';
        card.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
        observer.observe(card);
    });
});
