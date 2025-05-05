// Home.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import NavBar from '../Components/NavBar';
import 'bootstrap/dist/css/bootstrap.min.css';
import '@fortawesome/fontawesome-free/css/all.min.css';

const getInitialLang = () =>
  localStorage.getItem('lang') || (navigator.language.startsWith('ar') ? 'ar' : 'en');

function TripCard({ ride, isArabic, userId, onComplete, onCancelBooking }) {
  const driverId = ride.driver?._id;
  const isDriver = userId && driverId && userId === driverId;
  const isPassenger = ride.passengers?.some(p => p.user === userId);

  const driverName = ride.driver
    ? `${ride.driver.firstName || ''} ${ride.driver.lastName || ''}`.trim()
    : isArabic ? 'غير محدد' : 'Unknown';

  const formattedDate = ride.date
    ? new Date(ride.date).toLocaleDateString(isArabic ? 'ar-SA' : 'en-US', { year: 'numeric', month: 'short', day: 'numeric' })
    : isArabic ? 'غير محدد' : 'N/A';

  return (
    <div className="card h-100 shadow-sm w-100">
      <div className="card-body d-flex flex-column">
        <div className={`d-flex justify-content-between align-items-center mb-2 ${isArabic ? 'flex-row-reverse' : ''}`}>
          <h5 className="card-title mb-0">{ride.carModel || (isArabic ? 'سيارة غير محددة' : 'Unnamed Car')}</h5>
          {ride.driver?.averageRating > 0 && (
              <span className="badge bg-success">{ride.driver.averageRating.toFixed(1)} <i className="fas fa-star fa-xs"></i></span>
          )}
        </div>

        <div className="flex-grow-1 small text-muted">
          <p className="mb-1"><i className={`fas fa-map-marker-alt ${isArabic ? 'ms-1' : 'me-1'}`} />{isArabic ? `من: ${ride.from}` : `From: ${ride.from}`}</p>
          <p className="mb-1"><i className={`fas fa-map-marker-alt ${isArabic ? 'ms-1' : 'me-1'}`} />{isArabic ? `إلى: ${ride.to}` : `To: ${ride.to}`}</p>
          <p className="mb-1"><i className={`fas fa-calendar-alt ${isArabic ? 'ms-1' : 'me-1'}`} />{isArabic ? `التاريخ: ${formattedDate}` : `Date: ${formattedDate}`}</p>
          <p className="mb-1"><i className={`fas fa-clock ${isArabic ? 'ms-1' : 'me-1'}`} />{isArabic ? `الوقت: ${ride.departureTime}` : `Time: ${ride.departureTime}`}</p>
          <p className="mb-1 fw-bold">{isArabic ? `التكلفة: ${ride.cost}` : `Cost: ${ride.cost}`}</p>
          <p className="mb-1"><i className={`fas fa-user ${isArabic ? 'ms-1' : 'me-1'}`} />{isArabic ? `السائق: ${driverName}` : `Driver: ${driverName}`}</p>
          <p className="mb-0"><i className={`fas fa-chair ${isArabic ? 'ms-1' : 'me-1'}`} />{isArabic ? `مقاعد متاحة: ${ride.availableSeats}` : `Seats Available: ${ride.availableSeats}`}</p>
        </div>

        <div className="mt-auto pt-2 d-flex justify-content-between align-items-center">
          <Link to={`/map/${ride._id}`} className="btn btn-outline-primary btn-sm">
            {isArabic ? 'عرض التفاصيل' : 'Show Details'}
          </Link>
          {isDriver && ride.status === 'active' && (
            <button
              className="btn btn-sm btn-success"
              onClick={() => onComplete?.(ride._id)}
            >
              {isArabic ? 'إنهاء الرحلة' : 'Complete Ride'}
            </button>
          )}
           {isPassenger && ride.status === 'active' && onCancelBooking && (
               <button
                   className="btn btn-sm btn-danger"
                   onClick={() => onCancelBooking(ride._id)}
               >
                   {isArabic ? 'إلغاء حجزي' : 'Cancel Booking'}
               </button>
           )}
        </div>
      </div>
    </div>
  );
}


export default function Home() {
  const [lang, setLang] = useState(getInitialLang);
  const isArabic = lang === 'ar';

  const [searchTerm, setSearch] = useState('');
  const [allRides, setAll] = useState([]);
  const [filtered, setFilt] = useState([]);
  const [loading, setLoad] = useState(true);

  const [showBooked, setShowBooked] = useState(false);
  const [showCurrent, setShowCurrent] = useState(false);

  const [booked, setBooked] = useState([]);
  const [current, setCurrent] = useState(null);

  const [loadingBooked, setLoadBooked] = useState(false);
  const [loadingCurrent, setLoadCurrent] = useState(false);

  const userId = (() => {
    try {
      const profile = JSON.parse(localStorage.getItem('profileData'));
      return profile ? profile._id : null;
    } catch {
      return null;
    }
  })();

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = isArabic ? 'rtl' : 'ltr';
    try { localStorage.setItem('lang', lang); } catch { }
  }, [lang, isArabic]);


  const handleCompleteRide = async (tripId) => {
    const token = localStorage.getItem('token');
    if (!token) {
        alert(isArabic ? 'الرجاء تسجيل الدخول لإكمال الرحلة.' : 'Please log in to complete the ride.');
        return;
    }

    setLoad(true);

    try {
      const res = await fetch(`https://kaddad-backend.onrender.com/api/trips/${tripId}/complete`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const result = await res.json();
      if (res.ok && result.success) {
        setAll(prev => prev.map(r => r._id === tripId ? { ...r, status: 'completed' } : r));
        setFilt(prev => prev.filter(r => r._id !== tripId));

        if (current?._id === tripId) {
            setCurrent(null);
        }
        if (showBooked) {
            setBooked(prev => prev.map(b => b._id === tripId ? { ...b, status: 'completed' } : b));
        }
      } else {
        alert(result.message || (isArabic ? 'فشل إكمال الرحلة' : 'Failed to complete ride'));
      }
    } catch (err) {
      console.error(err);
      alert(isArabic ? 'خطأ في الخادم أثناء إكمال الرحلة' : 'Server error during completion');
    } finally {
        setLoad(false);
    }
  };

   const handleCancelBooking = async (tripId) => {
       const token = localStorage.getItem('token');
       if (!token) {
           alert(isArabic ? 'الرجاء تسجيل الدخول لإلغاء الحجز.' : 'Please log in to cancel booking.');
           return;
       }

       if (!window.confirm(isArabic ? 'هل أنت متأكد أنك تريد إلغاء هذا الحجز؟' : 'Are you sure you want to cancel this booking?')) {
           return;
       }

       setLoadBooked(true);

       try {
           const res = await fetch(`https://kaddad-backend.onrender.com/api/trips/${tripId}/cancel-booking`, {
               method: 'PATCH',
               headers: {
                   'Authorization': `Bearer ${token}`,
                   'Content-Type': 'application/json'
               }
           });

           const result = await res.json();
           if (res.ok && result.success) {
               alert(result.message || (isArabic ? 'تم إلغاء الحجز بنجاح.' : 'Booking cancelled successfully.'));
               setBooked(prev => prev.filter(b => b._id !== tripId));

               setAll(prev => prev.map(r => r._id === tripId ? { ...r, availableSeats: Number(r.availableSeats) + 1, status: result.data.status } : r));
               setFilt(prev => prev.map(r => r._id === tripId ? { ...r, availableSeats: Number(r.availableSeats) + 1, status: result.data.status } : r));

               if (current?._id === tripId) {
                   setCurrent(null);
               }

           } else {
               alert(result.message || (isArabic ? 'فشل إلغاء الحجز.' : 'Failed to cancel booking.'));
           }
       } catch (err) {
           console.error(err);
           alert(isArabic ? 'خطأ في الخادم أثناء إلغاء الحجز.' : 'Server error during booking cancellation.');
       } finally {
           setLoadBooked(false);
       }
   };


  useEffect(() => {
    (async () => {
      setLoad(true);
      try {
        const res = await fetch('https://kaddad-backend.onrender.com/api/trips?status=active');
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        const json = await res.json();
        setAll(json.data || []);
        setFilt(json.data || []);
      } catch (e) {
         console.error("Failed to fetch active trips:", e);
         setAll([]);
         setFilt([]);
      } finally {
         setLoad(false);
      }
    })();
  }, []);


  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilt(allRides.filter(r => r.status === 'active'));
      return;
    }
    const t = searchTerm.toLowerCase();
    setFilt(allRides.filter(r => r.status === 'active' && (
      (r.from || '').toLowerCase().includes(t) ||
      (r.to || '').toLowerCase().includes(t) ||
      (r.carModel || '').toLowerCase().includes(t) ||
      (`${r.driver?.firstName || ''} ${r.driver?.lastName || ''}`.toLowerCase()).includes(t)
    )));
  }, [searchTerm, allRides]);


  const fetchMyBookings = async () => {
    const token = localStorage.getItem('token');
    if (!token) return [];
    try {
        const res = await fetch('https://kaddad-backend.onrender.com/api/trips/my-bookings', {
            headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        const json = await res.json();
        return json.data || [];
    } catch (error) {
        console.error("Failed to fetch bookings:", error);
        return [];
    }
  };


  useEffect(() => {
    if (!showCurrent) return;

    const loadCurrent = async () => {
      setLoadCurrent(true);
      setCurrent(null);
      try {
        const list = await fetchMyBookings();
        const activeBooking = list.find(t => t.status === 'active' || t.status === 'full');
        setCurrent(activeBooking || null);
      } catch (e) {
        console.error("Failed to load current booking:", e);
      } finally {
        setLoadCurrent(false);
      }
    };

    loadCurrent();
  }, [showCurrent, userId]);


  const openBooked = async () => {
    setShowBooked(true);
    setLoadBooked(true);
    setBooked([]);
    try {
      const bookings = await fetchMyBookings();
      bookings.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setBooked(bookings);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadBooked(false);
    }
  };

  const openCurrent = () => setShowCurrent(true);


  return (
    <div className={`bg-light ${isArabic ? 'rtl' : 'ltr'}`} dir={isArabic ? 'rtl' : 'ltr'}>
      <div className="container-fluid p-0">
        <NavBar lang={lang} setLang={setLang} />

        <div className="bg-dark text-white py-3 sticky-top shadow-sm" style={{top: '0', zIndex: 1020}}>
          <div className="container">
            <div className="row g-2 align-items-center flex-wrap">
              <div className="col flex-grow-1">
                <div className="input-group bg-ltr" dir="ltr">
                  <input
                    type="text"
                    className={`form-control ${isArabic ? 'text-end' : ''}`}
                    placeholder={isArabic ? 'ابحث (من, إلى, موديل السيارة...)' : 'Search (From, To, Car Model...)'}
                    value={searchTerm}
                    onChange={e => setSearch(e.target.value)}
                  />
                  <Link className="btn btn-success" to="/trip-form">
                     <i className={`fas fa-plus ${isArabic ? 'ms-1' : 'me-1'}`}></i>{isArabic ? 'أنشئ رحلة' : 'Create Trip'}
                  </Link>
                </div>
              </div>
              <div className="col-auto d-flex gap-2">
                <button className="btn btn-outline-light position-relative" onClick={openCurrent}>
                  <i className={`fas fa-map-pin ${isArabic ? 'ms-1' : 'me-1'}`}></i>{isArabic ? 'رحلتي الحالية' : 'Current Trip'}
                   {current && <span className="position-absolute top-0 start-100 translate-middle p-1 bg-danger border border-light rounded-circle"><span className="visually-hidden">Current trip</span></span>}
                </button>
                <button className="btn btn-outline-light" onClick={openBooked}>
                  <i className={`fas fa-history ${isArabic ? 'ms-1' : 'me-1'}`}></i>{isArabic ? 'رحلاتي' : 'My Trips'}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="container py-4">
          <h2 className={`mb-4 ${isArabic ? 'text-end' : 'text-start'}`}>
            {isArabic ? 'الرحلات المتاحة' : 'Available Rides'}
          </h2>

          {loading && allRides.length === 0 ? (
            <div className="d-flex justify-content-center py-5">
                 <div className="spinner-border text-primary" role="status" style={{ width: '3rem', height: '3rem' }}>
                    <span className="visually-hidden">{isArabic ? 'جارٍ التحميل...' : 'Loading...'}</span>
                 </div>
            </div>
          ) : (
            <div className="row g-4">
              {filtered.length > 0 ? filtered.map((r) => (
                <div key={r._id} className="col-md-6 col-lg-4 d-flex">
                  <TripCard ride={r} isArabic={isArabic} userId={userId} onComplete={handleCompleteRide} onCancelBooking={handleCancelBooking} />
                </div>
              )) : (
                <div className="col-12">
                    <p className="text-muted text-center py-5 fs-5">
                      {searchTerm ? (isArabic ? 'لا توجد رحلات تطابق بحثك.' : 'No rides match your search.') : (isArabic ? 'لا توجد رحلات متاحة حالياً.' : 'No available rides currently.')}
                    </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {showCurrent && (
        <div className="modal fade show d-block" tabIndex="-1" style={{ background: 'rgba(0,0,0,0.5)' }} onClick={() => setShowCurrent(false)}>
          <div className="modal-dialog modal-lg modal-dialog-centered" onClick={e => e.stopPropagation()}>
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">{isArabic ? 'رحلتي الحالية النشطة' : 'My Current Active Trip'}</h5>
                <button type="button" className="btn-close" onClick={() => setShowCurrent(false)} aria-label={isArabic ? 'إغلاق' : 'Close'}></button>
              </div>
              <div className="modal-body">
                {loadingCurrent ? (
                     <div className="d-flex justify-content-center">
                         <div className="spinner-border" role="status">
                            <span className="visually-hidden">{isArabic ? 'جارٍ التحميل...' : 'Loading...'}</span>
                         </div>
                     </div>
                ) : current ? (
                  <TripCard
                    ride={current}
                    isArabic={isArabic}
                    userId={userId}
                    onComplete={handleCompleteRide}
                    onCancelBooking={(tripId) => {
                        handleCancelBooking(tripId);
                        setShowCurrent(false);
                    }}
                  />
                ) : (
                  <p className="text-muted mb-0 text-center">
                    {isArabic ? 'لا توجد لديك رحلة نشطة حاليًا (كسائق أو راكب).' : 'You have no currently active trip (as driver or passenger).'}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {showBooked && (
        <div className="modal fade show d-block" tabIndex="-1" style={{ background: 'rgba(0,0,0,0.5)' }} onClick={() => setShowBooked(false)}>
          <div className="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable" onClick={e => e.stopPropagation()}>
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">{isArabic ? 'سجل رحلاتي (كسائق أو راكب)' : 'My Trip History (Driver or Passenger)'}</h5>
                 <button type="button" className="btn-close" onClick={() => setShowBooked(false)} aria-label={isArabic ? 'إغلاق' : 'Close'}></button>
              </div>
              <div className="modal-body">
                {loadingBooked ? (
                    <div className="d-flex justify-content-center">
                         <div className="spinner-border" role="status">
                            <span className="visually-hidden">{isArabic ? 'جارٍ التحميل...' : 'Loading...'}</span>
                         </div>
                     </div>
                ) : booked.length ? (
                  <div className="row g-4">
                    {booked.map(b => (
                      <div key={b._id} className="col-12 col-md-6 col-lg-4 d-flex">
                        <TripCard
                          ride={b}
                          isArabic={isArabic}
                          userId={userId}
                          onComplete={handleCompleteRide}
                           onCancelBooking={handleCancelBooking}
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted mb-0 text-center">
                    {isArabic ? 'لم تقم بإنشاء أو حجز أي رحلات بعد.' : 'You haven\'t created or booked any rides yet.'}
                  </p>
                )}
              </div>
               <div className="modal-footer">
                    <button type="button" className="btn btn-secondary" onClick={() => setShowBooked(false)}>
                        {isArabic ? 'إغلاق' : 'Close'}
                    </button>
                </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}