import React, { useEffect } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import '@fortawesome/fontawesome-free/css/all.min.css';

function MapView() {
  useEffect(() => {
    const map = L.map('map').setView([24.7136, 46.6753], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(map);
    
    const pickupMarker = L.marker([24.7136, 46.6753]).addTo(map)
      .bindPopup('Pickup Location')
      .openPopup();

    const driverMarker = L.marker([24.7236, 46.6853]).addTo(map)
      .bindPopup('Driver Location');

    const route = L.polyline(
      [
        [24.7136, 46.6753],
        [24.7236, 46.6853],
      ],
      { color: 'blue' }
    ).addTo(map);

    return () => {
      map.remove();
    };
  }, []);

  return (
    <div className="bg-light">
      <div className="container-fluid p-0">
        <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
          <div className="container">
            <a className="navbar-brand" href="/map">KADAD+</a>
            <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
              <span className="navbar-toggler-icon"></span>
            </button>
            <div className="collapse navbar-collapse" id="navbarNav">
              <ul className="navbar-nav ms-auto">
                <li className="nav-item">
                  <a className="nav-link" href="/home">Home</a>
                </li>
                <li className="nav-item">
                  <a className="nav-link" href="/profile">Profile</a>
                </li>
                <li className="nav-item">
                  <a className="nav-link" href="/">Logout</a>
                </li>
              </ul>
            </div>
          </div>
        </nav>

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
                      src="https://via.placeholder.com/300x200?text=Toyota+Camry"
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