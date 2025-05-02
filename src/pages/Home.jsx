import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import NavBar from '../components/NavBar';
import 'bootstrap/dist/css/bootstrap.min.css';
import '@fortawesome/fontawesome-free/css/all.min.css';

/*****************************
 * Helpers
 *****************************/
const getInitialLang = () => {
  try {
    const storedLang = localStorage.getItem('lang');
    if (storedLang) return storedLang;
  } catch (e) {
    console.error('Could not access localStorage:', e);
  }
  return navigator.language.startsWith('ar') ? 'ar' : 'en';
};

/*****************************
 * Presentational card for one trip
 *****************************/
function TripCard({ ride, isArabic }) {
  const driverName = ride.driver
    ? `${ride.driver.firstName || ''} ${ride.driver.lastName || ''}`.trim()
    : isArabic ? 'غير محدد' : 'Unknown';

  return (
    <div className="card h-100 shadow-sm w-100">
      <div className="card-body d-flex flex-column">
        {/* header */}
        <div className={`d-flex justify-content-between align-items-center mb-2 ${isArabic ? 'flex-row-reverse' : ''}`}>
          <h5 className="card-title mb-0">{ride.carModel || (isArabic ? 'سيارة غير محددة' : 'Unnamed Car')}</h5>
          <span className="badge bg-success">{ride.rating || 'N/A'}</span>
        </div>

        {/* content */}
        <div className="flex-grow-1 small text-muted">
          <p className="mb-1">
            <i className={`fas fa-map-marker-alt ${isArabic ? 'ms-1' : 'me-1'}`} />
            {isArabic ? `من: ${ride.from || 'غير محدد'}` : `From: ${ride.from || 'N/A'}`}
          </p>
          <p className="mb-1">
            <i className={`fas fa-map-marker-alt ${isArabic ? 'ms-1' : 'me-1'}`} />
            {isArabic ? `إلى: ${ride.to || 'غير محدد'}` : `To: ${ride.to || 'N/A'}`}
          </p>
          <p className="mb-1">
            <i className={`fas fa-clock ${isArabic ? 'ms-1' : 'me-1'}`} />
            {isArabic ? `الوقت: ${ride.departureTime || 'غير محدد'}` : `Time: ${ride.departureTime || 'N/A'}`}
          </p>
          <p className="mb-1 fw-bold">
            {isArabic ? `التكلفة: ${ride.cost ?? 'غير محدد'}` : `Cost: ${ride.cost ?? 'N/A'}`}
          </p>
          <p className="mb-0">
            <i className={`fas fa-user ${isArabic ? 'ms-1' : 'me-1'}`} />
            {isArabic ? `السائق: ${driverName}` : `Driver: ${driverName}`}
          </p>
        </div>

        {/* button */}
        <div className={`mt-auto pt-2 text-${isArabic ? 'start' : 'end'}`}>
          <Link to={`/map/${ride._id}`} className="btn btn-outline-primary btn-sm">
            {isArabic ? 'عرض التفاصيل' : 'Show Details'}
          </Link>
        </div>
      </div>
    </div>
  );
}

/*****************************
 * Home page
 *****************************/
export default function Home() {
  /* ───── Language / i18n ───── */
  const [lang, setLang] = useState(getInitialLang);
  const isArabic = lang === 'ar';

  /* ───── State ───── */
  const [searchTerm, setSearch] = useState('');
  const [allRides, setAll]      = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading]   = useState(true);

  /* ───── Persist lang attr ───── */
  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir  = isArabic ? 'rtl' : 'ltr';
    try { localStorage.setItem('lang', lang); } catch {}
  }, [lang, isArabic]);

  /* ───── Fetch trips once ───── */
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('http://localhost:8000/api/trips?status=active');
        if (!res.ok) throw new Error('Failed to fetch trips');
        const json = await res.json();
        console.table(json.data);                // inspect fields
        setAll(json.data || []);
        setFiltered(json.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  /* ───── Search filter ───── */
  useEffect(() => {
    if (!searchTerm.trim()) { setFiltered(allRides); return; }
    const term = searchTerm.toLowerCase();
    const matches = allRides.filter(r => (
      (r.from?.toLowerCase() || '').includes(term) ||
      (r.to?.toLowerCase() || '').includes(term) ||
      (r.carModel?.toLowerCase() || '').includes(term) ||
      (`${r.driver?.firstName || ''} ${r.driver?.lastName || ''}`.toLowerCase()).includes(term)
    ));
    setFiltered(matches);
  }, [searchTerm, allRides]);

  /*****************************
   * Render
   *****************************/
  return (
    <div className={`bg-light ${isArabic ? 'rtl' : 'ltr'}`} dir={isArabic ? 'rtl' : 'ltr'}>
      <div className="container-fluid p-0">
        {/* NavBar */}
        <NavBar lang={lang} setLang={setLang} />

        {/* search + create */}
        <div className="bg-dark text-white py-3">
          <div className="container">
            <div className="row">
              <div className="col-12">
                <div className="input-group bg-ltr" dir="ltr">
                  <input
                    type="text"
                    className={`form-control ${isArabic ? 'text-end' : ''}`}
                    placeholder={isArabic ? 'ابحث عن الرحلات (المغادرة، الوجهة، السيارة...)' : 'Search rides (from, to, car...)'}
                    value={searchTerm}
                    onChange={e => setSearch(e.target.value)}
                  />
                  <Link className="btn btn-success ms-2" to="/trip-form">
                    {isArabic ? 'أنشئ رحلة' : 'Create Trip'}
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* rides grid */}
        <div className="container py-4">
          <h2 className={`mb-4 ${isArabic ? 'text-end' : 'text-start'}`}>
            {isArabic ? 'الرحلات المتاحة' : 'Available Rides'}
          </h2>

          {loading && <p>{isArabic ? 'جارٍ التحميل...' : 'Loading...'}</p>}

          {!loading && (
            <div className="row g-4">
              {filtered.length ? (
                filtered.map(ride => (
                  <div key={ride._id} className="col-md-6 col-lg-4 d-flex">
                    <TripCard ride={ride} isArabic={isArabic} />
                  </div>
                ))
              ) : (
                <div className="col-12 text-center mt-4">
                  <p>{isArabic ? 'لا توجد رحلات مطابقة.' : 'No matching rides found.'}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
