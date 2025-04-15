import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import '@fortawesome/fontawesome-free/css/all.min.css';

const getInitialLang = () => {
  try {
    const storedLang = localStorage.getItem('lang');
    if (storedLang) {
      return storedLang;
    }
  } catch (e) {
    console.error("Could not access localStorage:", e);
  }
  return navigator.language.startsWith('ar') ? 'ar' : 'en';
};

function Login() {
  const [lang, setLang] = useState(getInitialLang);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    try {
      const storedLang = localStorage.getItem('lang');
      if (storedLang !== lang) {
        localStorage.setItem('lang', lang);
      }
    } catch (e) {
      console.error("Could not update localStorage:", e);
    }
  }, [lang]);

  const handleLogin = (e) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError(lang === 'ar' ? 'يرجى إدخال البريد وكلمة المرور' : 'Please enter both email and password');
      return;
    }
    const stored = JSON.parse(localStorage.getItem('users')) || [];
    const found = stored.find(u => u.email === email && u.password === password);
    if (found) {
      localStorage.setItem('userName', found.name);
      setError('');
      window.location.href = '/home';
    } else {
      setError(lang === 'ar' ? 'بيانات الاعتماد غير صحيحة' : 'Invalid credentials');
    }
  };

  return (
    <div className="bg-light" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <div className="container">
        <div className="row justify-content-center align-items-center min-vh-100">
          <div className="col-md-6 col-lg-4">
            <div className="d-flex justify-content-end mb-2">
              <button
                className="btn btn-sm btn-outline-secondary"
                onClick={() => setLang(lang === 'en' ? 'ar' : 'en')}
              >
                {lang === 'en' ? 'عربي' : 'English'}
              </button>
            </div>
            <div className="card shadow-lg border-0 rounded-lg">
              <div className="card-body p-5">
                <div className="text-center mb-4">
                  <h1 className="fs-4 fw-bold">{lang === 'ar' ? 'تسجيل الدخول' : 'Login'}</h1>
                </div>
                {error && <div className="alert alert-danger">{error}</div>}
                <form onSubmit={handleLogin}>
                  <div className="mb-3">
                    <label className="form-label">{lang === 'ar' ? 'البريد الإلكتروني' : 'Email'}</label>
                    <input
                      type="email"
                      className="form-control"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">{lang === 'ar' ? 'كلمة المرور' : 'Password'}</label>
                    <input
                      type="password"
                      className="form-control"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                    <div className="d-flex justify-content-end mt-1">
                      <a href="/forgot-password" className="text-decoration-none small">
                        {lang === 'ar' ? 'هل نسيت كلمة المرور؟' : 'Forgot Password?'}
                      </a>
                    </div>
                  </div>
                  <div className="d-grid gap-2 mb-3">
                    <button type="submit" className="btn btn-primary">
                      {lang === 'ar' ? 'تسجيل الدخول' : 'Login'}
                    </button>
                  </div>
                  <div className="text-center">
                    <p className="mb-0">{lang === 'ar' ? 'أو سجل الدخول باستخدام' : 'Or login using'}</p>
                    <div className="d-flex justify-content-center mt-2">
                      <button type="button" className="btn btn-outline-secondary mx-1">
                        <i className="fab fa-google"></i>
                      </button>
                      <button type="button" className="btn btn-outline-secondary mx-1">
                        <i className="fab fa-facebook-f"></i>
                      </button>
                    </div>
                  </div>
                </form>
              </div>
              <div className="card-footer bg-white py-3 border-0">
                <div className="text-center">
                  <p className="mb-0">
                    {lang === 'ar' ? 'ليس لديك حساب؟' : "Don't have an account?"}{' '}
                    <a href="/signup" className="text-decoration-none">
                      {lang === 'ar' ? 'إنشاء حساب' : 'Sign Up'}
                    </a>
                  </p>
                </div>
              </div>
            </div>
            <div className="text-center mt-3"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;