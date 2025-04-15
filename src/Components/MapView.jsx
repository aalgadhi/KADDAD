import React, { useEffect } from 'react';
import NavBar from './NavBar';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

import markerIcon2x from './Images/marker-icon-2x.png'
import markerIcon from './Images/marker-icon.png'
import markerShadow from './Images/marker-shadow.png'


import 'leaflet/dist/leaflet.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import '@fortawesome/fontawesome-free/css/all.min.css';

function MapView() {
  useEffect(() => {
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: markerIcon2x,
      iconUrl: markerIcon,
      shadowUrl: markerShadow,
    });    
    const map = L.map('map').setView([24.7136, 46.6753], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(map);
    
    const pickupMarker = L.marker([24.7136, 46.6753]).addTo(map)
      .bindPopup('Pickup Location')
      .openPopup();

    return () => {
      map.remove();
    };
  }, []);

  return (
    <div className="bg-light">
      <div className="container-fluid p-0">

        <NavBar/>

        <div className="container-fluid py-3">
          <div className="row">
            <div className="col-lg-8 mb-4 mb-lg-0">
              <div className="card shadow-sm h-100">
                <div className="card-header bg-white">
                  <h5 className="mb-0">Precise Location</h5>
                </div>
                <div className="card-body p-0">
                  <div id="map" style={{ height: '500px' }}></div>
                </div>
              </div>
            </div>

            <div className="col-lg-4">
              <div className="card shadow-sm">
                <div className="card-body">
                  <div className="text-center mb-3">
                    <img
                      src="data:image/jpeg;base64,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"
                      className="img-fluid rounded"
                      alt="Toyota Camry"
                    />
                  </div>
                  <h4 className="card-title">Toyota Camry</h4>
                  <div className="d-flex justify-content-between mb-2">
                    <span className="text-muted">Driver: Ahmed</span>
                    <span className="badge bg-success">★★★★☆</span>
                  </div>
                  <hr />
                  <div className="mb-3">
                    <p className="mb-1"><i className="fas fa-car me-2"></i> Model: Camry 2022</p>
                    <p className="mb-1"><i className="fas fa-palette me-2"></i> Color: White</p>
                    <p className="mb-1"><i className="fas fa-id-card me-2"></i> License: KSA-1234</p>
                    <p className="mb-1"><i className="fas fa-clock me-2"></i> Estimated Time: 25 min</p>
                    <p className="mb-1"><i className="fas fa-road me-2"></i> Distance: 12 km</p>
                    <p className="mb-0"><i className="fas fa-money-bill me-2"></i> Cost: $15.00</p>
                  </div>
                  <div className="d-grid gap-2">
                    <button
                      className="btn btn-primary"
                      onClick={() => window.location.href = '/Payment'}
                    >
                      Book This Ride
                    </button>
                    <button
                      className="btn btn-outline-secondary"
                      onClick={() => window.location.href = '/home'}
                    >
                      Back to Search
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