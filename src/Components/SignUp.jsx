import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import '@fortawesome/fontawesome-free/css/all.min.css';

function SignUp() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSignUp = (e) => {
    e.preventDefault();
    if(!firstName.trim()||!lastName.trim()||!phone.trim()||!email.trim()||!password.trim()){
      setError('All fields are required');
      return;
    }
    setError('');
    const stored = JSON.parse(localStorage.getItem('users')) || [];
    stored.push({ firstName, lastName, phone, email, password });
    localStorage.setItem('users', JSON.stringify(stored));
    localStorage.setItem('userName', firstName);
    localStorage.setItem(
      'profileData',
      JSON.stringify({
        firstName,
        lastName,
        username: firstName,
        email,
        phone,
        address: ''
      })
    );
    alert('Sign up success');
    window.location.href = '/home';
  };

  return(
    <div className="bg-light">
      <div className="container">
        <div className="row justify-content-center align-items-center min-vh-100">
          <div className="col-md-6 col-lg-4">
            <div className="card shadow-lg border-0 rounded-lg">
              <div className="card-body p-5">
                <div className="text-center mb-4">
                  <h1 className="fs-4 fw-bold">Sign Up</h1>
                </div>
                {error && <div className="alert alert-danger">{error}</div>}
                <form onSubmit={handleSignUp}>
                  <div className="mb-3">
                    <label className="form-label">First Name</label>
                    <input
                      type="text"
                      className="form-control"
                      value={firstName}
                      onChange={(e)=>setFirstName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Last Name</label>
                    <input
                      type="text"
                      className="form-control"
                      value={lastName}
                      onChange={(e)=>setLastName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Phone</label>
                    <input
                      type="tel"
                      className="form-control"
                      value={phone}
                      onChange={(e)=>setPhone(e.target.value)}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Email</label>
                    <input
                      type="email"
                      className="form-control"
                      value={email}
                      onChange={(e)=>setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Password</label>
                    <input
                      type="password"
                      className="form-control"
                      value={password}
                      onChange={(e)=>setPassword(e.target.value)}
                      required
                    />
                  </div>
                  <div className="d-grid gap-2 mb-3">
                    <button type="submit" className="btn btn-success">Sign Up</button>
                  </div>
                </form>
              </div>
              <div className="card-footer bg-white py-3 border-0">
                <div className="text-center">
                  <p className="mb-0">
                    Already have an account? <a href="/" className="text-decoration-none">Login</a>
                  </p>
                </div>
              </div>
            </div>
            <div className="text-center mt-3">
              <p className="small text-muted">
                By signing up, you agree to our <a href="#!">Terms</a> & <a href="#!">Policy</a>.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
export default SignUp;