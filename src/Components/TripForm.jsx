import React, { useState } from 'react';
import NavBar from './NavBar';
import 'bootstrap/dist/css/bootstrap.min.css';

function TripForm() {
  const [model, setModel] = useState('');
  const [color, setColor] = useState('');
  const [license, setLicense] = useState('');
  const [departure, setDeparture] = useState('');
  const [destination, setDestination] = useState('');
  const [estimatedTime, setEstimatedTime] = useState('');
  const [distance, setDistance] = useState('');
  const [cost, setCost] = useState('');

  const handleCreateTrip = (e) => {
    e.preventDefault();
    const newTrip = {
      car: model,
      rating: '★★★☆☆',
      from: departure,
      to: destination,
      time: estimatedTime,
      cost: cost,
      color: color,
      license: license,
      distance: distance,
      driver: 'You',
    };
    const existingTrips = JSON.parse(localStorage.getItem('driverTrips')) || [];
    existingTrips.push(newTrip);
    localStorage.setItem('driverTrips', JSON.stringify(existingTrips));
    window.location.href = '/home';
  };

  return (
    <div className="bg-light">
      <div className="container-fluid p-0">

        <NavBar/>
        
        <div className="container py-4">
          <div className="row justify-content-center">
            <div className="col-md-8">
              <div className="card shadow-sm">
                <div className="card-header bg-white">
                  <h4 className="mb-0">Create a Trip (Driver)</h4>
                </div>
                <div className="card-body">
                  <form onSubmit={handleCreateTrip}>
                    <div className="row mb-3">
                      <div className="col-md-6">
                        <label className="form-label">Model (e.g., Camry 2022)</label>
                        <input
                          type="text"
                          className="form-control"
                          required
                          value={model}
                          onChange={(e) => setModel(e.target.value)}
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">Color (e.g., White)</label>
                        <input
                          type="text"
                          className="form-control"
                          required
                          value={color}
                          onChange={(e) => setColor(e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="row mb-3">
                      <div className="col-md-6">
                        <label className="form-label">License (e.g., KSA-1234)</label>
                        <input
                          type="text"
                          className="form-control"
                          required
                          value={license}
                          onChange={(e) => setLicense(e.target.value)}
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">Estimated Time (e.g., 25 min)</label>
                        <input
                          type="text"
                          className="form-control"
                          required
                          value={estimatedTime}
                          onChange={(e) => setEstimatedTime(e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="row mb-3">
                      <div className="col-md-6">
                        <label className="form-label">Distance (e.g., 12 km)</label>
                        <input
                          type="text"
                          className="form-control"
                          required
                          value={distance}
                          onChange={(e) => setDistance(e.target.value)}
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">Cost (e.g., $15.00)</label>
                        <input
                          type="text"
                          className="form-control"
                          required
                          value={cost}
                          onChange={(e) => setCost(e.target.value)}
                        />
                      </div>
                    </div>
                    <hr />
                    <h5 className="mb-3">Trip Route</h5>
                    <div className="row mb-3">
                      <div className="col-md-6">
                        <label className="form-label">Departure Location</label>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Dhahran"
                          required
                          value={departure}
                          onChange={(e) => setDeparture(e.target.value)}
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">Destination Location</label>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Riyadh"
                          required
                          value={destination}
                          onChange={(e) => setDestination(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="d-grid gap-2">
                      <button type="submit" className="btn btn-primary">
                        Create Trip
                      </button>
                      <button
                        type="button"
                        className="btn btn-outline-secondary"
                        onClick={() => (window.location.href = '/home')}
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div> 
    </div>
  );
}

export default TripForm;