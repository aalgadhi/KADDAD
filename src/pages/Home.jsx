import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import NavBar from '../components/NavBar';
import 'bootstrap/dist/css/bootstrap.min.css';
import '@fortawesome/fontawesome-free/css/all.min.css';

/*****************************
 * Helpers
 *****************************/
const getInitialLang = () =>
  localStorage.getItem('lang') || (navigator.language.startsWith('ar') ? 'ar' : 'en');

/*****************************
 * Presentational card
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
        {/* body */}
        <div className="flex-grow-1 small text-muted">
          <p className="mb-1"><i className={`fas fa-map-marker-alt ${isArabic ? 'ms-1' : 'me-1'}`} />{isArabic ? `من: ${ride.from}` : `From: ${ride.from}`}</p>
          <p className="mb-1"><i className={`fas fa-map-marker-alt ${isArabic ? 'ms-1' : 'me-1'}`} />{isArabic ? `إلى: ${ride.to}`   : `To: ${ride.to}`}</p>
          <p className="mb-1"><i className={`fas fa-clock ${isArabic ? 'ms-1' : 'me-1'}`}   />{isArabic ? `الوقت: ${ride.departureTime}` : `Time: ${ride.departureTime}`}</p>
          <p className="mb-1 fw-bold">{isArabic ? `التكلفة: ${ride.cost}` : `Cost: ${ride.cost}`}</p>
          <p className="mb-0"><i className={`fas fa-user ${isArabic ? 'ms-1' : 'me-1'}`} />{isArabic ? `السائق: ${driverName}` : `Driver: ${driverName}`}</p>
        </div>
        {/* footer */}
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
  /* ─── i18n ─── */
  const [lang, setLang] = useState(getInitialLang);
  const isArabic        = lang === 'ar';

  /* ─── trips / search ─── */
  const [searchTerm, setSearch] = useState('');
  const [allRides,   setAll]    = useState([]);
  const [filtered,   setFilt]   = useState([]);
  const [loading,    setLoad]   = useState(true);

  /* ─── modals state ─── */
  const [showBooked , setShowBooked ] = useState(false);
  const [showCurrent, setShowCurrent] = useState(false);

  const [booked , setBooked ]   = useState([]);
  const [current, setCurrent]   = useState(null);

  const [loadingBooked , setLoadBooked ] = useState(false);
  const [loadingCurrent, setLoadCurrent] = useState(false);

  /* ─── keep html lang dir ─── */
  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir  = isArabic ? 'rtl' : 'ltr';
    try { localStorage.setItem('lang', lang); } catch {}
  }, [lang, isArabic]);

  /* ─── fetch active trips once ─── */
  useEffect(() => {
    (async () => {
      try {
        const res  = await fetch('http://localhost:8000/api/trips?status=active');
        const json = await res.json();
        setAll(json.data || []);
        setFilt(json.data || []);
      } catch (e) { console.error(e); }
      finally     { setLoad(false); }
    })();
  }, []);

  /* ─── search filter ─── */
  useEffect(() => {
    if (!searchTerm.trim()) { setFilt(allRides); return; }
    const t = searchTerm.toLowerCase();
    setFilt(allRides.filter(r => (
      (r.from||'').toLowerCase().includes(t) ||
      (r.to||'').toLowerCase().includes(t)   ||
      (r.carModel||'').toLowerCase().includes(t) ||
      (`${r.driver?.firstName||''} ${r.driver?.lastName||''}`.toLowerCase()).includes(t)
    )));
  }, [searchTerm, allRides]);

/* ───  .... ─── */
  useEffect(() => {
    if (!showCurrent) return;
  
    const loadCurrent = async () => {
      setLoadCurrent(true);
      try {
        const list = await fetchMyBookings();
        setCurrent(list.find(t => t.status === 'active' || t.status === 'full') || null);
      } catch (e) { console.error(e); }
      finally { setLoadCurrent(false); }
    };
  
    loadCurrent();
  }, [showCurrent]); 

  /* ─── helpers to fetch bookings ─── */
  const fetchMyBookings = async () => {
    const token = localStorage.getItem('token');
    const res   = await fetch('http://localhost:8000/api/trips/my-bookings', {
      headers: { Authorization: `Bearer ${token}` },
    });
    const json  = await res.json();
    return json.data || [];
  };

  const openBooked = async () => {
    setShowBooked(true); setLoadBooked(true);
    try   { setBooked(await fetchMyBookings()); }
    catch (e) { console.error(e); }
    finally { setLoadBooked(false); }
  };

  const openCurrent = () => setShowCurrent(true); 
  /*****************************
   * Render
   *****************************/
  return (
    <div className={`bg-light ${isArabic ? 'rtl' : 'ltr'}`} dir={isArabic ? 'rtl' : 'ltr'}>
      <div className="container-fluid p-0">
        <NavBar lang={lang} setLang={setLang} />

        {/* search + actions bar */}
        <div className="bg-dark text-white py-3">
          <div className="container">
            <div className="row g-2 align-items-center flex-wrap">
              <div className="col flex-grow-1">
                <div className="input-group bg-ltr" dir="ltr">
                  <input
                    type="text"
                    className={`form-control ${isArabic ? 'text-end' : ''}`}
                    placeholder={isArabic ? 'ابحث عن الرحلات...' : 'Search rides...'}
                    value={searchTerm}
                    onChange={e=>setSearch(e.target.value)}
                  />
                  <Link className="btn btn-success" to="/trip-form">
                    {isArabic ? 'أنشئ رحلة' : 'Create Trip'}
                  </Link>
                </div>
              </div>
              <div className="col-auto d-flex gap-2">
                <button className="btn btn-outline-light" onClick={openCurrent}>
                  <i className="fas fa-thumbtack me-1" />{isArabic ? 'حجز جاري' : 'Current Booking'}
                </button>
                <button className="btn btn-outline-light" onClick={openBooked}>
                  <i className="fas fa-ticket-alt me-1" />{isArabic ? 'كل الحجوزات' : 'My Bookings'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* grid */}
        <div className="container py-4">
          <h2 className={`mb-4 ${isArabic ? 'text-end' : 'text-start'}`}>
            {isArabic ? 'الرحلات المتاحة' : 'Available Rides'}
          </h2>

          {loading ? (
            <p>{isArabic ? 'جارٍ التحميل...' : 'Loading...'}</p>
          ) : (
            <div className="row g-4">
              {filtered.length ? filtered.map(r => (
                <div key={r._id} className="col-md-6 col-lg-4 d-flex">
                  <TripCard ride={r} isArabic={isArabic} />
                </div>
              )) : (
                <p className="text-muted">{isArabic ? 'لا توجد رحلات.' : 'No rides.'}</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* current booking modal */}
      {showCurrent && (
        <div className="modal d-block" tabIndex="-1" style={{background:'rgba(0,0,0,0.5)'}} onClick={()=>setShowCurrent(false)}>
          <div className="modal-dialog modal-lg modal-dialog-centered" onClick={e=>e.stopPropagation()}>
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">{isArabic ? 'حجزي الحالي' : 'My Current Booking'}</h5>
                <button className="btn-close" onClick={()=>setShowCurrent(false)} />
              </div>
              <div className="modal-body">
                {loadingCurrent ? (
                  <p>{isArabic ? 'جارٍ التحميل...' : 'Loading...'}</p>
                ) : current ? (
                  <TripCard ride={current} isArabic={isArabic} />
                ) : (
                  <p className="text-muted mb-0">
                    {isArabic ? 'لا يوجد حجز نشط.' : 'You have no active booking.'}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* booked list modal */}
      {showBooked && (
        <div className="modal d-block" tabIndex="-1" style={{background:'rgba(0,0,0,0.5)'}} onClick={()=>setShowBooked(false)}>
          <div className="modal-dialog modal-lg modal-dialog-centered" onClick={e=>e.stopPropagation()}>
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">{isArabic ? 'رحلاتي المحجوزة' : 'My Booked Rides'}</h5>
                <button className="btn-close" onClick={()=>setShowBooked(false)} />
              </div>
              <div className="modal-body">
                {loadingBooked ? (
                  <p>{isArabic ? 'جارٍ التحميل...' : 'Loading...'}</p>
                ) : booked.length ? (
                  <div className="row g-4">
                    {booked.map(b => (
                      <div key={b._id} className="col-12 col-md-6">
                        <TripCard ride={b} isArabic={isArabic} />
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted mb-0">
                    {isArabic ? 'لا توجد حجوزات.' : 'You have no bookings yet.'}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}