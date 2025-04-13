import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import '@fortawesome/fontawesome-free/css/all.min.css';

function Home() {
  const defaultRides = [
    {
      car: 'Camry 2025',
      rating: '★★★★★',
      from: 'KFUPM',
      to: 'Al-Hasa',
      time: '50 mins',
      cost: '$99',
      driver: 'Reda',
    },
    {
      car: 'Nissan Altima',
      rating: '★★★★☆',
      from: 'Riyadh',
      to: 'KFUPM',
      time: '3 Hours',
      cost: '$30',
      driver: 'Mohammed',
    },
    {
      car: 'Hyundai Sonata',
      rating: '★★★☆☆',
      from: 'KSU',
      to: 'Jazan',
      time: '6 Hours',
      cost: '$33',
      driver: 'Ali',
    },
    {
      car: 'Kia Optima',
      rating: '★★★★☆',
      from: 'KFU',
      to: 'Hail',
      time: '6 Hours',
      cost: '$16.00',
      driver: 'Khalid',
    },
  ];

  const [searchTerm, setSearchTerm] = useState('');
  const [allRides, setAllRides] = useState(defaultRides);
  const [filteredRides, setFilteredRides] = useState(defaultRides);

  useEffect(() => {
    const localDriverTrips = JSON.parse(localStorage.getItem('driverTrips')) || [];
    const combined = [...defaultRides, ...localDriverTrips];
    setAllRides(combined);
    setFilteredRides(combined);
  }, []);

  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredRides(allRides);
      return;
    }
    const term = searchTerm.toLowerCase();
    const results = allRides.filter((ride) =>
      ride.from.toLowerCase().includes(term) || ride.to.toLowerCase().includes(term) || ride.car.toLowerCase().includes(term)
    );
    setFilteredRides(results);
  }, [searchTerm, allRides]);

  return (
    <div className="bg-light">
      <div className="container-fluid p-0">
        <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
          <div className="container">
            <a className="navbar-brand" href="/">KADAD+</a>
            <button
              className="navbar-toggler"
              type="button"
              data-bs-toggle="collapse"
              data-bs-target="#navbarNav"
            >
              <span className="navbar-toggler-icon"></span>
            </button>
            <div className="collapse navbar-collapse" id="navbarNav">
              <ul className="navbar-nav ms-auto">
                <li className="nav-item">
                  <a className="nav-link active" href="/home">Home</a>
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

        <div className="bg-dark text-white py-3">
          <div className="container">
            <div className="row">
              <div className="col-12">
                <div className="input-group">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Search rides by departure, destination, or car"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <button
                    className="btn btn-success ms-2"
                    type="button"
                    onClick={() => (window.location.href = '/trip-form')}
                  >
                    Create a Trip
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="container py-4">
          <h2 className="mb-4">Available Rides</h2>
          <div className="row g-4">
            {filteredRides.map((ride, index) => (
              <div key={index} className="col-md-6 col-lg-4">
                <div className="card h-100 shadow-sm">
                  <div className="card-body">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <h5 className="card-title mb-0">{ride.car}</h5>
                      <span className="badge bg-success">{ride.rating}</span>
                    </div>
                    <p className="card-text text-muted small mb-1">
                      <i className="fas fa-map-marker-alt me-1"></i> From: {ride.from}
                    </p>
                    <p className="card-text text-muted small mb-1">
                      <i className="fas fa-map-marker-alt me-1"></i> To: {ride.to}
                    </p>
                    <p className="card-text text-muted small mb-1">
                      <i className="fas fa-clock me-1"></i> Time: {ride.time}
                    </p>
                    <p className="card-text text-muted small mb-1 fw-bold">
                      Cost: {ride.cost}
                    </p>
                    <div className="d-flex justify-content-end mt-3">
                      <a href="/map" className="btn btn-outline-primary btn-sm">Show Details</a>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {filteredRides.length === 0 && (
              <div className="text-center mt-4">
                <p>No matching rides found.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;