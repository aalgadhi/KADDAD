import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

function Profile() {
  const [isEditMode, setIsEditMode] = useState(false);
  const [firstName, setFirstName] = useState('Yousef');
  const [lastName, setLastName] = useState('Floss');
  const [username, setUsername] = useState('Brq');
  const [email, setEmail] = useState('9aro5@gmail.com');
  const [phone, setPhone] = useState('+966505011222');
  const [address, setAddress] = useState('Al-hizam KFUPM, Dhahran, Saudi Arabia');
  const [profilePic, setProfilePic] = useState('');
  const [paymentMethods, setPaymentMethods] = useState([
    {
      type: 'Visa',
      last4: '5432',
      expires: '05/26',
      isDefault: true,
    },
    {
      type: 'Mastercard',
      last4: '7890',
      expires: '08/27',
      isDefault: false,
    },
  ]);

  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [newPayType, setNewPayType] = useState('');
  const [newPayLast4, setNewPayLast4] = useState('');
  const [newPayExpires, setNewPayExpires] = useState('');

  const handleEdit = () => {
    setIsEditMode(true);
  };

  const handleSave = () => {
    setIsEditMode(false);
  };

  const handleCancel = () => {
    setIsEditMode(false);
  };

  const handleAddPayment = () => {
    const trimmedType = newPayType.trim();
    const trimmedLast4 = newPayLast4.trim();
    const trimmedExp = newPayExpires.trim();

    // If any field is empty, do nothing
    if (!trimmedType || !trimmedLast4 || !trimmedExp) {
      return;
    }
    // Optional: pattern check "MM/YY"
    const validExp = /^(0[1-9]|1[0-2])\/\d{2}$/.test(trimmedExp);
    if (!validExp) {
      return;
    }

    const newMethod = {
      type: trimmedType,
      last4: trimmedLast4,
      expires: trimmedExp,
      isDefault: false,
    };
    setPaymentMethods([...paymentMethods, newMethod]);
    setNewPayType('');
    setNewPayLast4('');
    setNewPayExpires('');
    setShowPaymentModal(false);
  };

  const handleDeletePayment = (index) => {
    const updated = [...paymentMethods];
    updated.splice(index, 1);
    setPaymentMethods(updated);
  };

  const handleSetDefault = (index) => {
    const updated = paymentMethods.map((pm, i) => ({
      ...pm,
      isDefault: i === index,
    }));
    setPaymentMethods(updated);
  };

  // Only allow + and digits for phone
  const handlePhoneChange = (e) => {
    const val = e.target.value;
    if (/^\+?\d*$/.test(val)) {
      setPhone(val);
    }
  };

  // Stricter email pattern check
  const handleEmailChange = (e) => {
    const val = e.target.value;
    setEmail(val);
  };

  const handleExpireChange = (e) => {
    const val = e.target.value;
    // Basic pattern "MM/YY" => 0[1-9]|1[0-2], slash, 2 digits
    if (/^(\d{0,2}\/?\d{0,2})$/.test(val)) {
      setNewPayExpires(val);
    }
  };

  return (
    <div className="bg-light">
      <div className="container-fluid p-0">
        <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
          <div className="container">
            <a className="navbar-brand" href="/home">KADAD+</a>
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
                  <a className="nav-link" href="/home">Home</a>
                </li>
                <li className="nav-item">
                  <a className="nav-link active" href="/profile">Profile</a>
                </li>
                <li className="nav-item">
                  <a className="nav-link" href="/">Logout</a>
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
                    {profilePic ? (
                      <img
                        src={profilePic}
                        className="rounded-circle img-thumbnail"
                        alt="Profile"
                        style={{ width: '150px', height: '150px', objectFit: 'cover' }}
                      />
                    ) : null}
                  </div>
                  <h4 className="mb-1">{firstName} {lastName}</h4>
                  <p className="text-muted mb-3">@{username}</p>
                  <div className="d-grid">
                    {!isEditMode && (
                      <button className="btn btn-outline-primary" onClick={handleEdit}>
                        <i className="fas fa-edit me-1"></i> Edit Profile
                      </button>
                    )}
                    {isEditMode && (
                      <div className="d-flex gap-2 flex-wrap justify-content-center">
                        <button className="btn btn-primary" onClick={handleSave}>
                          Save Changes
                        </button>
                        <button className="btn btn-outline-secondary" onClick={handleCancel}>
                          Cancel
                        </button>
                      </div>
                    )}
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
                        <label className="form-label">First Name</label>
                        <input
                          type="text"
                          className="form-control"
                          disabled={!isEditMode}
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">Last Name</label>
                        <input
                          type="text"
                          className="form-control"
                          disabled={!isEditMode}
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Username</label>
                      <input
                        type="text"
                        className="form-control"
                        disabled={!isEditMode}
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Email</label>
                      <input
                        type="email"
                        pattern="^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$"
                        className="form-control"
                        disabled={!isEditMode}
                        value={email}
                        onChange={handleEmailChange}
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Phone</label>
                      <input
                        type="tel"
                        className="form-control"
                        disabled={!isEditMode}
                        value={phone}
                        onChange={handlePhoneChange}
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Address</label>
                      <textarea
                        className="form-control"
                        rows="2"
                        disabled={!isEditMode}
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                      ></textarea>
                    </div>
                    {isEditMode && (
                      <div className="mb-3">
                        <label className="form-label">Profile Image URL (optional)</label>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="https://your-image-link.jpg"
                          value={profilePic}
                          onChange={(e) => setProfilePic(e.target.value)}
                        />
                      </div>
                    )}
                  </form>
                </div>
              </div>

              <div className="card shadow-sm mb-4">
                <div className="card-header bg-white d-flex justify-content-between align-items-center">
                  <h5 className="mb-0">Payment Methods</h5>
                  <button
                    className="btn btn-sm btn-outline-primary"
                    onClick={() => setShowPaymentModal(true)}
                  >
                    <i className="fas fa-plus me-1"></i> Add New
                  </button>
                </div>
                <div className="card-body">
                  {paymentMethods.map((pm, index) => (
                    <div
                      key={index}
                      className="d-flex justify-content-between align-items-center mb-3 p-2 border rounded"
                    >
                      <div className="d-flex align-items-center">
                        <i
                          className={`fab fa-cc-${
                            pm.type.toLowerCase().includes('visa')
                              ? 'visa'
                              : pm.type.toLowerCase().includes('master')
                              ? 'mastercard'
                              : 'paypal'
                          } fa-2x text-primary me-3`}
                        ></i>
                        <div>
                          <p className="mb-0 fw-bold">
                            {pm.type} ending in {pm.last4}
                          </p>
                          <p className="mb-0 small text-muted">Expires {pm.expires}</p>
                        </div>
                      </div>
                      <div>
                        {pm.isDefault && <span className="badge bg-success me-2">Default</span>}
                        {!pm.isDefault && (
                          <button
                            className="btn btn-sm btn-outline-secondary me-2"
                            onClick={() => handleSetDefault(index)}
                          >
                            Set Default
                          </button>
                        )}
                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => handleDeletePayment(index)}
                        >
                          <i className="fas fa-trash"></i>
                        </button>
                      </div>
                    </div>
                  ))}
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
                    <a href="/my-rides" className="text-decoration-none">View My Rides</a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>


      {showPaymentModal && (
        <div
          className="modal fade show"
          style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}
          tabIndex="-1"
        >
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Add New Payment Method</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowPaymentModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label">Type (e.g., Visa)</label>
                  <input
                    type="text"
                    className="form-control"
                    value={newPayType}
                    onChange={(e) => setNewPayType(e.target.value)}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Last 4 Digits</label>
                  <input
                    type="text"
                    className="form-control"
                    maxLength={4}
                    value={newPayLast4}
                    onChange={(e) => {
                      if (/^\d*$/.test(e.target.value)) {
                        setNewPayLast4(e.target.value);
                      }
                    }}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Expires (MM/YY)</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="MM/YY"
                    value={newPayExpires}
                    onChange={handleExpireChange}
                  />
                  {/* 
                    If you want to visually show an error if pattern doesn't match,
                    you can do so here. 
                  */}
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowPaymentModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleAddPayment}
                >
                  Add
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Profile;