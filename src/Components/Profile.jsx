import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

function Profile() {
  return (
    <div className="bg-light">
      <div className="container-fluid p-0">
        <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
          <div className="container">
            <a className="navbar-brand" href="#">KADAD+</a>
            <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
              <span className="navbar-toggler-icon"></span>
            </button>
            <div className="collapse navbar-collapse" id="navbarNav">
              <ul className="navbar-nav ms-auto">
                <li className="nav-item">
                  <a className="nav-link" href="home.html">Home</a>
                </li>
                <li className="nav-item">
                  <a className="nav-link active" href="profile.html">Profile</a>
                </li>
                <li className="nav-item">
                  <a className="nav-link" href="index.html">Logout</a>
                </li>
              </ul>
            </div>
          </div>
        </nav>

        <div className="container py-4">
          <div className="row">
            <div className="col-lg-4 mb-4">
              <div className="card shadow-sm">
                <div className="card-body text-center">
                  <div className="mb-3">
                    <img src="https://via.placeholder.com/150" className="rounded-circle img-thumbnail" alt="Profile" />
                  </div>
                  <h4 className="mb-1">Mohammed bin Salman</h4>
                  <p className="text-muted mb-3">@mohammed</p>
                  <div className="d-grid">
                    <button className="btn btn-outline-primary">
                      <i className="fas fa-edit me-1"></i> Edit Profile
                    </button>
                  </div>
                </div>
                <div className="card-footer bg-white">
                  <div className="row text-center">
                    <div className="col-4">
                      <h5>12</h5>
                      <small className="text-muted">Rides</small>
                    </div>
                    <div className="col-4">
                      <h5>4.8</h5>
                      <small className="text-muted">Rating</small>
                    </div>
                    <div className="col-4">
                      <h5>$250</h5>
                      <small className="text-muted">Spent</small>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-lg-8">
              <div className="card shadow-sm mb-4">
                <div className="card-header bg-white">
                  <h5 className="mb-0">Account Details</h5>
                </div>
                <div className="card-body">
                  <form>
                    <div className="row mb-3">
                      <div className="col-md-6">
                        <label htmlFor="firstName" className="form-label">First Name</label>
                        <input type="text" className="form-control" id="firstName" value="Mohammed" />
                      </div>
                      <div className="col-md-6">
                        <label htmlFor="lastName" className="form-label">Last Name</label>
                        <input type="text" className="form-control" id="lastName" value="bin Salman" />
                      </div>
                    </div>
                    <div className="mb-3">
                      <label htmlFor="email" className="form-label">Email</label>
                      <input type="email" className="form-control" id="email" value="mohammed@example.com" />
                    </div>
                    <div className="mb-3">
                      <label htmlFor="phone" className="form-label">Phone</label>
                      <input type="tel" className="form-control" id="phone" value="+966 50 123 4567" />
                    </div>
                    <div className="mb-3">
                      <label htmlFor="address" className="form-label">Address</label>
                      <textarea className="form-control" id="address" rows="2">123 King Fahd Road, Riyadh, Saudi Arabia</textarea>
                    </div>
                    <div className="d-grid">
                      <button type="button" className="btn btn-primary">Save Changes</button>
                    </div>
                  </form>
                </div>
              </div>

              <div className="card shadow-sm mb-4">
                <div className="card-header bg-white d-flex justify-content-between align-items-center">
                  <h5 className="mb-0">Payment Methods</h5>
                  <button className="btn btn-sm btn-outline-primary">
                    <i className="fas fa-plus me-1"></i> Add New
                  </button>
                </div>
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-center mb-3 p-2 border rounded">
                    <div className="d-flex align-items-center">
                      <i className="fab fa-cc-visa fa-2x text-primary me-3"></i>
                      <div>
                        <p className="mb-0 fw-bold">Visa ending in 5432</p>
                        <p className="mb-0 small text-muted">Expires 05/26</p>
                      </div>
                    </div>
                    <div>
                      <span className="badge bg-success me-2">Default</span>
                      <button className="btn btn-sm btn-outline-danger">
                        <i className="fas fa-trash"></i>
                      </button>
                    </div>
                  </div>
                  <div className="d-flex justify-content-between align-items-center p-2 border rounded">
                    <div className="d-flex align-items-center">
                      <i className="fab fa-cc-mastercard fa-2x text-primary me-3"></i>
                      <div>
                        <p className="mb-0 fw-bold">Mastercard ending in 7890</p>
                        <p className="mb-0 small text-muted">Expires 08/27</p>
                      </div>
                    </div>
                    <div>
                      <button className="btn btn-sm btn-outline-secondary me-2">Set Default</button>
                      <button className="btn btn-sm btn-outline-danger">
                        <i className="fas fa-trash"></i>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="card shadow-sm">
                <div className="card-header bg-white">
                  <h5 className="mb-0">Recent Rides</h5>
                </div>
                <div className="card-body">
                  <div className="table-responsive">
                    <table className="table table-hover">
                      <thead>
                        <tr>
                          <th>Date</th>
                          <th>From</th>
                          <th>To</th>
                          <th>Amount</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td>Apr 10, 2025</td>
                          <td>Downtown</td>
                          <td>Airport</td>
                          <td>$18.00</td>
                          <td><span className="badge bg-success">Completed</span></td>
                        </tr>
                        <tr>
                          <td>Apr 5, 2025</td>
                          <td>Mall</td>
                          <td>University</td>
                          <td>$12.50</td>
                          <td><span className="badge bg-success">Completed</span></td>
                        </tr>
                        <tr>
                          <td>Mar 28, 2025</td>
                          <td>Hospital</td>
                          <td>Home</td>
                          <td>$15.75</td>
                          <td><span className="badge bg-success">Completed</span></td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  <div className="text-center mt-2">
                    <a href="#" className="text-decoration-none">View All Rides</a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;