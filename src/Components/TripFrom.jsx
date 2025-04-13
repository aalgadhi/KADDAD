import React from "react";
import 'bootstrap/dist/css/bootstrap.min.css';
function TripForm() {
  return (
    <div className="bg-light">
      <div className="container-fluid p-0">
        <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
          <div className="container">
            <a className="navbar-brand" href="#">KADAD+</a>
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
                  <a className="nav-link" href="home.html">Home</a>
                </li>
                <li className="nav-item">
                  <a className="nav-link" href="profile.html">Profile</a>
                </li>
                <li className="nav-item">
                  <a className="nav-link" href="index.html">Logout</a>
                </li>
              </ul>
            </div>
          </div>
        </nav>

        <div className="container py-4">
          <div className="row justify-content-center">
            <div className="col-md-8">
              <div className="card shadow-sm">
                <div className="card-header bg-white">
                  <h4 className="mb-0">List your trip</h4>
                </div>
                <div className="card-body">
                  <form>
                    <div className="mb-4">
                      <h5 className="mb-3">Trip Details</h5>
                      <div className="row g-3">
                        <div className="col-md-6">
                          <label htmlFor="pickupLocation" className="form-label">Pickup Location</label>
                          <input
                            type="text"
                            className="form-control"
                            id="pickupLocation"
                            placeholder="Enter pickup location"
                          />
                        </div>
                        <div className="col-md-6">
                          <label htmlFor="destination" className="form-label">Destination</label>
                          <input
                            type="text"
                            className="form-control"
                            id="destination"
                            placeholder="Enter destination"
                          />
                        </div>
                        <div className="col-md-6">
                          <label htmlFor="date" className="form-label">Date</label>
                          <input type="date" className="form-control" id="date" />
                        </div>
                        <div className="col-md-6">
                          <label htmlFor="time" className="form-label">Time</label>
                          <input type="time" className="form-control" id="time" />
                        </div>
                      </div>
                    </div>

                    <div className="mb-4">
                      <h5 className="mb-3">Passenger Details</h5>
                      <div className="row g-3">
                        <div className="col-md-6">
                          <label htmlFor="passengers" className="form-label">Number of Passengers</label>
                          <select className="form-select" id="passengers">
                            <option value="1">1</option>
                            <option value="2">2</option>
                            <option value="3">3</option>
                            <option value="4">4</option>
                          </select>
                        </div>
                        <div className="col-md-6">
                          <label htmlFor="luggage" className="form-label">Luggage</label>
                          <select className="form-select" id="luggage">
                            <option value="none">None</option>
                            <option value="small">Small</option>
                            <option value="medium">Medium</option>
                            <option value="large">Large</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    <div className="mb-4">
                      <h5 className="mb-3">Special Requests</h5>
                      <div className="form-check mb-2">
                        <input className="form-check-input" type="checkbox" id="airConditioned" />
                        <label className="form-check-label" htmlFor="airConditioned">Air Conditioned</label>
                      </div>
                      <div className="form-check mb-2">
                        <input className="form-check-input" type="checkbox" id="childSeat" />
                        <label className="form-check-label" htmlFor="childSeat">Child Seat</label>
                      </div>
                      <div className="form-check mb-2">
                        <input className="form-check-input" type="checkbox" id="petFriendly" />
                        <label className="form-check-label" htmlFor="petFriendly">Pet Friendly</label>
                      </div>
                      <div className="mb-3">
                        <label htmlFor="notes" className="form-label">Additional Notes</label>
                        <textarea
                          className="form-control"
                          id="notes"
                          rows="3"
                          placeholder="Any special instructions for the driver"
                        ></textarea>
                      </div>
                    </div>

                    <div className="mb-4">
                      <h5 className="mb-3">Summary</h5>
                      <div className="card bg-light">
                        <div className="card-body">
                          <div className="d-flex justify-content-between mb-2">
                            <span>Base Fare</span>
                            <span>$15.00</span>
                          </div>
                          <div className="d-flex justify-content-between mb-2">
                            <span>Service Fee</span>
                            <span>$2.00</span>
                          </div>
                          <div className="d-flex justify-content-between mb-2">
                            <span>Tax</span>
                            <span>$1.00</span>
                          </div>
                          <hr />
                          <div className="d-flex justify-content-between fw-bold">
                            <span>Total</span>
                            <span>$18.00</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="d-grid gap-2">
                      <button
                        type="button"
                        className="btn btn-primary"
                        onClick={() => (window.location.href = "payment.html")}
                      >
                        Proceed to Payment
                      </button>
                      <button
                        type="button"
                        className="btn btn-outline-secondary"
                        onClick={() => (window.location.href = "map.html")}
                      >
                        Back
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