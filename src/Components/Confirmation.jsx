import React from 'react';
import NavBar from './NavBar';
import 'bootstrap/dist/css/bootstrap.min.css';
import '@fortawesome/fontawesome-free/css/all.min.css';

function Confirmation() {
  const handleGoHome = () => {
    window.location.href = '/home';
  };

  const handleDownloadReceipt = () => {
    // Placeholder for actual download logic
    alert('Receipt download triggered!');
  };

  return (
    <div className="bg-light">
      <div className="container-fluid p-0">
        
        <NavBar/>

        <div className="container py-5">
          <div className="row justify-content-center">
            <div className="col-md-8">
              <div className="card shadow-sm">
                <div className="card-body text-center p-5">
                  <div className="mb-4">
                    <i className="fas fa-check-circle text-success fa-5x"></i>
                  </div>
                  <h2 className="mb-3">Reservation Confirmed!</h2>
                  <p className="text-muted mb-4">
                    Your ride has been successfully booked. The driver will arrive at the pickup location at the scheduled time.
                  </p>

                  <div className="card bg-light mb-4 text-start">
                    <div className="card-body">
                      <div className="row">
                        <div className="col-md-6">
                          <h5 className="mb-3">Trip Details</h5>
                          <p className="mb-1"><strong>Booking ID:</strong> KD-12345678</p>
                          <p className="mb-1"><strong>Date:</strong> April 12, 2025</p>
                          <p className="mb-1"><strong>Time:</strong> 10:30 AM</p>
                          <p className="mb-1"><strong>From:</strong> Downtown</p>
                          <p className="mb-1"><strong>To:</strong> Airport</p>
                          <p className="mb-1"><strong>Passengers:</strong> 2</p>
                          <p className="mb-0"><strong>Amount Paid:</strong> $18.00</p>
                        </div>
                        <div className="col-md-6">
                          <h5 className="mb-3">Driver Details</h5>
                          <div className="d-flex align-items-center mb-2">
                            <div className="me-3">
                              <img
                                src="https://via.placeholder.com/60"
                                className="rounded-circle"
                                alt="Driver"
                              />
                            </div>
                            <div>
                              <p className="mb-0"><strong>Ahmed</strong></p>
                              <p className="mb-0 text-warning">★★★★☆</p>
                            </div>
                          </div>
                          <p className="mb-1"><strong>Car:</strong> Toyota Camry (White)</p>
                          <p className="mb-1"><strong>License Plate:</strong> KSA-1234</p>
                          <p className="mb-0"><strong>Contact:</strong> +966 50 123 4567</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="d-grid gap-2">
                    <button type="button" className="btn btn-primary" onClick={handleGoHome}>
                      Back to Home
                    </button>
                    <button type="button" className="btn btn-outline-secondary" onClick={handleDownloadReceipt}>
                      <i className="fas fa-download me-1"></i> Download Receipt
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

export default Confirmation;