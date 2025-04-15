// NavBar.js
import 'leaflet/dist/leaflet.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min';
import '@fortawesome/fontawesome-free/css/all.min.css';

function NavBar({ lang, setLang }) {
  return (
    <div>
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
        <div className="container">
          <a className="navbar-brand" href="/home">KADAD+</a>
          <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
            <span className="navbar-toggler-icon"></span>
          </button>

          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav ms-auto">
              <li className="nav-item">
                <a className="nav-link" href="/home">{lang === 'ar' ? 'الرئيسية' : 'Home'}</a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="/profile">{lang === 'ar' ? 'الملف الشخصي' : 'Profile'}</a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="/">{lang === 'ar' ? 'تسجيل الخروج' : 'Logout'}</a>
              </li>
            </ul>
          </div>

          {/* Language Toggle Button */}
          <div className="d-flex">
            <button className="btn btn-sm btn-outline-secondary" onClick={() => setLang(lang === 'en' ? 'ar' : 'en')}>
              {lang === 'en' ? 'عربي' : 'English'}
            </button>
          </div>
        </div>
      </nav>
    </div>
  );
}

export default NavBar;