import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import '@fortawesome/fontawesome-free/css/all.min.css';

function Home() {
  const rideData = [
    {
      car: 'Toyota Camry',
      rating: '★★★★☆',
      point: 'Downtown',
      time: '25 mins',
      driver: 'Ahmed',
      cost: '$15.00',
    },
    {
      car: 'Honda Accord',
      rating: '★★★★★',
      point: 'Airport',
      time: '30 mins',
      driver: 'Fatima',
      cost: '$18.50',
    },
    {
      car: 'Nissan Altima',
      rating: '★★★★☆',
      point: 'Mall',
      time: '15 mins',
      driver: 'Mohammed',
      cost: '$12.75',
    },
    {
      car: 'Hyundai Sonata',
      rating: '★★★☆☆',
      point: 'University',
      time: '20 mins',
      driver: 'Sara',
      cost: '$14.25',
    },
    {
      car: 'Kia Optima',
      rating: '★★★★☆',
      point: 'Hospital',
      time: '22 mins',
      driver: 'Khalid',
      cost: '$16.00',
    },
  ];

  return (
    <div className="bg-light">
      <div className="container-fluid p-0">
        <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
          <div className="container">
            <a className="navbar-brand" href="/">KADAD+</a>
            <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
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
                  <input type="text" className="form-control" placeholder="Search your destination" />
                  <button className="btn btn-primary" type="button">
                    <i className="fas fa-search"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="container py-4">
          <h2 className="mb-4">Available Rides</h2>

          <div className="row g-4">
            {rideData.map((ride, index) => (
              <div key={index} className="col-md-6 col-lg-4">
                <div className="card h-100 shadow-sm">
                  <div className="card-body">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <h5 className="card-title mb-0">{ride.car}</h5>
                      <span className="badge bg-success">{ride.rating}</span>
                    </div>
                    <p className="card-text text-muted small">
                      <i className="fas fa-map-marker-alt me-1"></i> Starting Point: {ride.point}
                    </p>
                    <p className="card-text text-muted small">
                      <i className="fas fa-clock me-1"></i> Estimated Time: {ride.time}
                    </p>
                    <p className="card-text text-muted small">
                      <i className="fas fa-user me-1"></i> Driver: {ride.driver}
                    </p>
                    <div className="d-flex justify-content-between align-items-center mt-3">
                      <span className="fw-bold">{ride.cost}</span>
                      <a href="/map" className="btn btn-outline-primary btn-sm">View Details</a>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;