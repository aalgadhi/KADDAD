import React, { useState, useEffect } from 'react';
import NavBar from './NavBar';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

import markerIcon2x from './Images/marker-icon-2x.png';
import markerIcon from './Images/marker-icon.png';
import markerShadow from './Images/marker-shadow.png';

import 'bootstrap/dist/css/bootstrap.min.css';
import '@fortawesome/fontawesome-free/css/all.min.css';

const getInitialLang = () => {
  try {
    const storedLang = localStorage.getItem('lang');
    if (storedLang) {
      return storedLang;
    }
  } catch (e) {
    console.error("Could not access localStorage:", e);
  }
  return navigator.language.startsWith('ar') ? 'ar' : 'en';
};

function MapView() {
  const [lang, setLang] = useState(getInitialLang); // Initialize synchronously
  const isArabic = lang === 'ar';

  // Effect to sync HTML attributes and localStorage when lang changes
  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    try {
      const storedLang = localStorage.getItem('lang');
      if (storedLang !== lang) {
        localStorage.setItem('lang', lang);
      }
    } catch (e) {
      console.error("Could not update localStorage:", e);
    }
  }, [lang]);

  // Effect to manage Leaflet map
  useEffect(() => {
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: markerIcon2x,
      iconUrl: markerIcon,
      shadowUrl: markerShadow,
    });

    let map;
    try {
        map = L.map('map').setView([24.7136, 46.6753], 13);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors',
        }).addTo(map);

        const pickupMarker = L.marker([24.7136, 46.6753]).addTo(map)
            .bindPopup(isArabic ? 'موقع الالتقاط' : 'Pickup Location')
            .openPopup();
    } catch (error) {
        console.error("Error initializing Leaflet map:", error);
        // Attempt to remove the map container if it exists but failed initialization
        const mapContainer = document.getElementById('map');
        if (mapContainer) mapContainer.innerHTML = 'Map failed to load.';
    }


    return () => {
      if (map && map.remove) { // Check if map instance exists and has remove method
        try {
          map.remove();
        } catch (error) {
          console.error("Error removing Leaflet map:", error);
        }
      }
    };
  }, [isArabic]); // Re-run if language changes to update popup

  return (
    <div className={`bg-light ${isArabic ? 'rtl' : 'ltr'}`} dir={isArabic ? 'rtl' : 'ltr'}>
      <div className="container-fluid p-0">

        <NavBar lang={lang} setLang={setLang} />

        <div className="container-fluid py-3">
          <div className="row">
            <div className="col-lg-8 mb-4 mb-lg-0">
              <div className="card shadow-sm h-100">
                <div className="card-header bg-white">
                  <h5 className="mb-0">{isArabic ? 'الموقع الدقيق' : 'Precise Location'}</h5>
                </div>
                <div className="card-body p-0">
                  <div id="map" style={{ height: '500px', width: '100%' }}></div>
                </div>
              </div>
            </div>

            <div className="col-lg-4">
              <div className="card shadow-sm">
                <div className="card-body">
                  <div className="text-center mb-3">
                    <img
                      src="https://via.placeholder.com/300x200.png?text=Toyota+Camry"
                      className="img-fluid rounded"
                      alt={isArabic ? 'تويوتا كامري' : 'Toyota Camry'}
                    />
                  </div>
                  <h4 className="card-title">{isArabic ? 'تويوتا كامري' : 'Toyota Camry'}</h4>
                  <div className="d-flex justify-content-between mb-2">
                    <span className="text-muted">{isArabic ? 'السائق: أحمد' : 'Driver: Ahmed'}</span>
                    <span className="badge bg-success">★★★★☆</span>
                  </div>
                  <hr />
                  <div className="mb-3">
                    <p className="mb-1"><i className={`fas fa-car ${isArabic ? 'ms-2' : 'me-2'}`}></i> {isArabic ? 'الموديل: كامري 2022' : 'Model: Camry 2022'}</p>
                    <p className="mb-1"><i className={`fas fa-palette ${isArabic ? 'ms-2' : 'me-2'}`}></i> {isArabic ? 'اللون: أبيض' : 'Color: White'}</p>
                    <p className="mb-1"><i className={`fas fa-id-card ${isArabic ? 'ms-2' : 'me-2'}`}></i> {isArabic ? 'اللوحة: السعودية - 1234' : 'License: KSA-1234'}</p>
                    <p className="mb-1"><i className={`fas fa-clock ${isArabic ? 'ms-2' : 'me-2'}`}></i> {isArabic ? 'الوقت المقدر: 25 دقيقة' : 'Estimated Time: 25 min'}</p>
                    <p className="mb-1"><i className={`fas fa-road ${isArabic ? 'ms-2' : 'me-2'}`}></i> {isArabic ? 'المسافة: 12 كم' : 'Distance: 12 km'}</p>
                    <p className="mb-0"><i className={`fas fa-money-bill ${isArabic ? 'ms-2' : 'me-2'}`}></i> {isArabic ? 'التكلفة: 15.00 ريال' : 'Cost: SAR 15.00'}</p>
                  </div>
                  <div className="d-grid gap-2">
                    <button
                      className="btn btn-primary"
                      onClick={() => window.location.href = '/Payment'}
                    >
                      {isArabic ? 'احجز هذه الرحلة' : 'Book This Ride'}
                    </button>
                    <button
                      className="btn btn-outline-secondary"
                      onClick={() => window.location.href = '/home'}
                    >
                      {isArabic ? 'العودة للبحث' : 'Back to Search'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div >
    </div>
  );
}

export default MapView;