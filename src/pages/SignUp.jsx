import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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

function SignUp() {
  const [lang, setLang] = useState(getInitialLang);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

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

  const handleSignUp = async (e) => {
    e.preventDefault();

    if (!firstName.trim() || !lastName.trim() || !phone.trim() || !email.trim() || !password.trim()) {
      setError(lang === 'ar' ? 'جميع الحقول مطلوبة' : 'All fields are required');
      return;
    }

    try {
      const response = await fetch('https://kaddad-backend.onrender.com/api/users/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          firstName,
          lastName,
          phone,
          email,
          password,
          address: ''
        })
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || (lang === 'ar' ? 'خطأ في التسجيل' : 'Registration error'));
      } else {
        localStorage.setItem('userName', firstName);
        localStorage.setItem('profileData', JSON.stringify({
          firstName,
          lastName,
          username: firstName,
          email,
          phone,
          address: '',
        }));

        // **IMPORTANT:** Await the completion of `localStorage.setItem`
        // before calling `navigate`.

        alert(lang === 'ar' ? 'تم التسجيل بنجاح! سيتم تحويلك إلى صفحة تسجيل الدخول.' : 'Registration successful! You will be redirected to the login page.');

        navigate('/');
      }
    } catch (err) {
      console.error(err);
      setError(lang === 'ar' ? 'خطأ في الخادم' : 'Server error');
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
                  <h1 className="fs-4 fw-bold">
                    {lang === 'ar' ? 'إنشاء حساب' : 'Sign Up'}
                  </h1>
                </div>
                {error && <div className="alert alert-danger">{error}</div>}
                <form onSubmit={handleSignUp}>
                  <div className="mb-3">
                    <label className="form-label">{lang === 'ar' ? 'الاسم الأول' : 'First Name'}</label>
                    <input
                      type="text"
                      className="form-control"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">{lang === 'ar' ? 'اسم العائلة' : 'Last Name'}</label>
                    <input
                      type="text"
                      className="form-control"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">{lang === 'ar' ? 'رقم الجوال' : 'Phone'}</label>
                    <input
                      type="tel"
                      className="form-control"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      required
                    />
                  </div>
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
                  </div>
                  <div className="d-grid gap-2 mb-3">
                    <button type="submit" className="btn btn-success">
                      {lang === 'ar' ? 'إنشاء الحساب' : 'Sign Up'}
                    </button>
                  </div>
                </form>
              </div>
              <div className="card-footer bg-white py-3 border-0">
                <div className="text-center">
                  <p className="mb-0">
                    {lang === 'ar' ? 'لديك حساب بالفعل؟' : 'Already have an account?'}{' '}
                    <a href="/" className="text-decoration-none">
                      {lang === 'ar' ? 'تسجيل الدخول' : 'Login'}
                    </a>
                  </p>
                </div>
              </div>
            </div>
            <div className="text-center mt-3">
              <p className="small text-muted">
                {lang === 'ar'
                  ? 'بالتسجيل، فإنك توافق على'
                  : 'By signing up, you agree to our'}{' '}
                <a href="#!">{lang === 'ar' ? 'الشروط' : 'Terms'}</a> &{' '}
                <a href="#!">{lang === 'ar' ? 'السياسة' : 'Policy'}</a>.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SignUp;  