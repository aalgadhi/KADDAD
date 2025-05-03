// MapView.js
import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import NavBar from '../Components/NavBar';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import markerIcon2x from '../assets/marker-icon-2x.png';
import markerIcon   from '../assets/marker-icon.png';
import markerShadow from '../assets/marker-shadow.png';
import 'bootstrap/dist/css/bootstrap.min.css';
import '@fortawesome/fontawesome-free/css/all.min.css';

const getInitialLang = () =>
  localStorage.getItem('lang') || (navigator.language.startsWith('ar') ? 'ar' : 'en');

const defaultLatLng = [24.7136, 46.6753];

export default function MapView() {
  const { tripId }  = useParams();
  const navigate = useNavigate();
  const [lang, setLang] = useState(getInitialLang());
  const isArabic    = lang === 'ar';

  const [trip, setTrip]             = useState(null);
  const [pickupLocationName, setPickupName] = useState(null);
  const [imageURL, setImageURL] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isBooking, setIsBooking] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  const mapRef = useRef(null);
  const pickupMarkerRef = useRef(null);

  const userId = JSON.parse(localStorage.getItem('profileData') || '{}')?._id;

  const fetchTripById = async (id) => {
    setLoading(true);
    setError(null);
    // DO NOT setTrip(null) here when refreshing
    setPickupName(null); // Reset dependent state
    if (imageURL && imageURL.startsWith('blob:')) {
        URL.revokeObjectURL(imageURL);
    }
    setImageURL(null); // Reset dependent state

    try {
      const res = await fetch(`http://localhost:8000/api/trips/${id}`);
      if (!res.ok) {
         if (res.status === 404) throw new Error('not-found');
         throw new Error(`HTTP error! status: ${res.status}`);
      }
      const json = await res.json();
       if (!json.data) throw new Error('no-data');

       const fetchedTrip = json.data;
       setTrip(fetchedTrip); // Update with new data

        // Handle Image based on new data
        if (fetchedTrip.carImage && fetchedTrip.carImage.data && fetchedTrip.carImageType) {
            try {
                // Ensure previous blob is revoked before creating new one if URL existed
                if (imageURL && imageURL.startsWith('blob:')) {
                    URL.revokeObjectURL(imageURL);
                }
                const blob = new Blob([new Uint8Array(fetchedTrip.carImage.data)], { type: fetchedTrip.carImageType });
                const url = URL.createObjectURL(blob);
                setImageURL(url);
            } catch (e) {
                 console.error("Error creating blob URL:", e);
                 setImageURL(null);
            }
        } else {
            setImageURL(null);
        }

       // Handle Pickup Name based on new data
       if (fetchedTrip.fromLat != null && fetchedTrip.fromLng != null) {
         try {
           const geoRes = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${fetchedTrip.fromLat}&lon=${fetchedTrip.fromLng}&accept-language=${lang}`);
           const geoData = await geoRes.json();
           setPickupName(geoData?.display_name || `Lat: ${fetchedTrip.fromLat.toFixed(5)}, Lng: ${fetchedTrip.fromLng.toFixed(5)}`);
         } catch (geoErr) {
           console.warn("Geocoding failed:", geoErr);
           setPickupName(`Lat: ${fetchedTrip.fromLat.toFixed(5)}, Lng: ${fetchedTrip.fromLng.toFixed(5)}`);
         }
       } else {
          setPickupName(fetchedTrip.from || (isArabic ? 'غير محدد' : 'N/A'));
       }

    } catch (err) {
      console.error("Fetch trip error:", err);
      setError(err.message === 'not-found' ? (isArabic ? 'الرحلة غير موجودة أو تم حذفها.' : 'Trip not found or has been deleted.') : (isArabic ? 'فشل تحميل بيانات الرحلة.' : 'Failed to load trip data.'));
      // Keep existing trip data on error during refresh? Or setTrip(null)?
      // Setting null might hide the map, keeping existing might be better UX.
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch and language change fetch
  useEffect(() => {
    if (tripId) {
        fetchTripById(tripId);
    }
     // Cleanup for imageURL specifically when tripId/lang changes OR component unmounts
     return () => {
        if (imageURL && imageURL.startsWith('blob:')) {
            URL.revokeObjectURL(imageURL);
        }
     };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tripId, lang]);

  // Update HTML lang/dir
  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir  = isArabic ? 'rtl' : 'ltr';
    try { localStorage.setItem('lang', lang); } catch (e) { console.error("Failed to set lang in localStorage", e) }
  }, [lang, isArabic]);

  // Map initialization and update effect
  useEffect(() => {
    // Guard condition: Don't run if trip data isn't ready or map div doesn't exist
    if (!trip || typeof trip.fromLat !== 'number' || typeof trip.fromLng !== 'number' || !document.getElementById('map')) {
        return;
    }

    // Leaflet icon setup
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: markerIcon2x,
      iconUrl: markerIcon,
      shadowUrl: markerShadow,
    });

    const lat = trip.fromLat;
    const lng = trip.fromLng;

    let map = mapRef.current; // Get existing map instance, if any

    // Initialize map only if it doesn't exist
    if (!map) {
        try {
          map = L.map('map').setView([lat, lng], 13);
          mapRef.current = map; // Store the instance

          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            maxZoom: 18,
          }).addTo(map);

          // Invalidate size after initial tile layer loads
          map.whenReady(() => {
              map.invalidateSize();
          });


        } catch (mapError) {
          console.error("Failed to initialize map:", mapError);
          setError(isArabic ? "فشل في عرض الخريطة" : "Failed to display map");
          if (mapRef.current) { // Cleanup if partial init failed
              mapRef.current.remove();
              mapRef.current = null;
          }
          return; // Stop if map init failed
        }
    } else {
      // If map exists, just update its view and invalidate size
      map.setView([lat, lng], 13);
      map.invalidateSize(); // Ensure map redraws correctly
    }

    // Add/Update marker (remove previous first)
    if (pickupMarkerRef.current && map.hasLayer(pickupMarkerRef.current)) {
        map.removeLayer(pickupMarkerRef.current);
    }
    pickupMarkerRef.current = null; // Clear ref before creating new one

    const popupContent = `<b>${isArabic ? 'نقطة الانطلاق' : 'Pickup Location'}</b><br>${pickupLocationName || (isArabic ? 'غير محدد' : 'N/A')}`;
    pickupMarkerRef.current = L.marker([lat, lng])
        .addTo(map)
        .bindPopup(popupContent);

  // Dependencies for map updates
  }, [trip, isArabic, lang, pickupLocationName]); // Dependencies seem correct now

  // Cleanup effect for map instance on component unmount
  useEffect(() => {
      return () => {
          if (mapRef.current) {
              try {
                  mapRef.current.remove();
              } catch (e) {
                  console.warn("Error removing map instance on unmount:", e);
              }
              mapRef.current = null;
              pickupMarkerRef.current = null;
          }
      };
  }, []); // Empty array ensures this runs only on unmount

  // Booking handler
  const handleBookTrip = async () => {
    setIsBooking(true);
    const token = localStorage.getItem('token');
    if (!token) {
      alert(isArabic ? 'يرجى تسجيل الدخول أولاً لحجز الرحلة.' : 'Please log in first to book the ride.');
      setIsBooking(false);
      return;
    }
     if (!userId) {
        alert(isArabic ? 'لم يتم العثور على معرف المستخدم. يرجى تسجيل الدخول مرة أخرى.' : 'User ID not found. Please log in again.');
        setIsBooking(false);
        return;
    }

    try {
      const res = await fetch(`http://localhost:8000/api/trips/${tripId}/book`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      const json = await res.json();
      if (res.ok && json.success) {
        await fetchTripById(tripId); // Refresh data
      } else {
         let errorMsg = json.message || json.error || (isArabic ? 'فشل الحجز.' : 'Booking failed.');
         if (res.status === 400 && errorMsg.includes('already booked')) {
             errorMsg = isArabic ? 'لقد حجزت هذه الرحلة بالفعل.' : 'You have already booked this ride.';
         } else if (res.status === 400 && (errorMsg.includes('no seats left') || errorMsg.includes('full'))) {
              errorMsg = isArabic ? 'عذراً، الرحلة ممتلئة الآن.' : 'Sorry, the trip is now full.';
         } else if (res.status === 400 && errorMsg.includes('driver cannot book')) {
             errorMsg = isArabic ? 'لا يمكنك حجز رحلتك الخاصة.' : 'You cannot book your own ride.';
         } else if (res.status === 400 && errorMsg.includes('Cannot book a trip in the past')) {
             errorMsg = isArabic ? 'لا يمكن حجز رحلة بتاريخ سابق.' : 'Cannot book a trip in the past.';
         }
         alert(errorMsg);
      }
    } catch (e) {
      console.error("Booking Error:", e);
      alert(isArabic ? 'حدث خطأ أثناء محاولة الحجز. يرجى المحاولة مرة أخرى.' : 'An error occurred while trying to book. Please try again.');
    } finally {
       setIsBooking(false);
    }
  };

   // Cancellation handler
   const handleCancelBooking = async () => {
       setIsCancelling(true);
       const token = localStorage.getItem('token');
       if (!token) {
           alert(isArabic ? 'الرجاء تسجيل الدخول لإلغاء الحجز.' : 'Please log in to cancel booking.');
           setIsCancelling(false);
           return;
       }
       if (!userId) {
            alert(isArabic ? 'لم يتم العثور على معرف المستخدم. يرجى تسجيل الدخول مرة أخرى.' : 'User ID not found. Please log in again.');
           setIsCancelling(false);
           return;
       }

       if (!window.confirm(isArabic ? 'هل أنت متأكد أنك تريد إلغاء هذا الحجز؟' : 'Are you sure you want to cancel this booking?')) {
           setIsCancelling(false);
           return;
       }

       try {
           const res = await fetch(`http://localhost:8000/api/trips/${tripId}/cancel-booking`, {
               method: 'PATCH',
               headers: {
                   'Authorization': `Bearer ${token}`,
                   'Content-Type': 'application/json'
               }
           });

           const result = await res.json();
           if (res.ok && result.success) {
               await fetchTripById(tripId); // Refresh data
           } else {
               alert(result.message || (isArabic ? 'فشل إلغاء الحجز.' : 'Failed to cancel booking.'));
           }
       } catch (err) {
           console.error("Cancel Booking Error:", err);
           alert(isArabic ? 'خطأ في الخادم أثناء إلغاء الحجز.' : 'Server error during booking cancellation.');
       } finally {
           setIsCancelling(false);
       }
   };

    // --- Render Logic ---

    // Loading state
    if (loading && !trip) { // Show full page loader only if trip is not yet loaded at all
        return (
           <div className="d-flex justify-content-center align-items-center" style={{ height: '80vh' }}>
              <div className="spinner-border text-primary" role="status" style={{ width: '3rem', height: '3rem' }}>
                  <span className="visually-hidden">{isArabic ? 'جارٍ التحميل...' : 'Loading...'}</span>
              </div>
           </div>
        );
    }

    // Error or no trip data state (after initial load attempt)
    if (error || (!loading && !trip)) { // Check !loading ensure fetch attempt finished
        return (
            <div className="d-flex flex-column justify-content-center align-items-center text-center" style={{ minHeight: '80vh' }}>
               <NavBar lang={lang} setLang={setLang} />
               <div className="container py-5">
                   <i className="fas fa-exclamation-triangle fa-3x text-danger mb-3"></i>
                   <h2>{error === 'not-found' ? (isArabic ? 'الرحلة غير موجودة' : 'Trip Not Found') : (error || (isArabic ? 'خطأ' : 'Error'))}</h2>
                   <p className="text-muted">
                        {error === 'not-found'
                         ? (isArabic ? 'قد تكون الرحلة قد اكتملت أو تم إلغاؤها أو الرابط غير صحيح.' : 'The trip might have been completed, cancelled, or the link is incorrect.')
                         : (error?.includes('الخريطة') // Check if it's the specific map error
                            ? error
                            : (isArabic ? 'حدث خطأ أثناء تحميل تفاصيل الرحلة.' : 'An error occurred while loading trip details.')
                           )
                       }
                   </p>
                   <Link to="/home" className="btn btn-primary mt-3">
                     <i className={`fas fa-home ${isArabic ? 'ms-1' : 'me-1'}`}></i>{isArabic ? 'العودة إلى الصفحة الرئيسية' : 'Back to Home'}
                   </Link>
               </div>
            </div>
          );
    }

    // Calculate derived state (assuming trip is available now)
    const driverName = trip.driver
        ? `${trip.driver.firstName || ''} ${trip.driver.lastName || ''}`.trim() || (isArabic ? 'السائق غير محدد' : 'Unknown Driver')
        : isArabic ? 'السائق غير محدد' : 'Unknown Driver';

    const formattedDate = trip.date
        ? new Date(trip.date).toLocaleDateString(isArabic ? 'ar-SA' : 'en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
        : isArabic ? 'التاريخ غير محدد' : 'Date N/A';

    const isDriver = userId && trip.driver?._id === userId;
    const isPassenger = userId && trip.passengers?.some(p => p.user === userId || p.user?._id === userId);
    const canBook = !isDriver && !isPassenger && trip.status === 'active' && (trip.availableSeats ?? 0) > 0;

    // Main component render (Show existing trip data even while loading=true for refresh)
    return (
        <div className={`bg-light ${isArabic ? 'rtl' : 'ltr'}`} dir={isArabic ? 'rtl' : 'ltr'}>
          <NavBar lang={lang} setLang={setLang} />

          {/* Optional: Add a subtle loading indicator during refresh */}
          {loading && <div className="position-absolute top-0 start-0 p-2 opacity-50"><span className="spinner-border spinner-border-sm text-primary"></span></div>}


          <div className="container py-4">
            <div className="row g-4">

              {/* Map Column */}
              <div className="col-lg-7">
                <div className="card shadow-sm h-100">
                   <div className="card-header bg-white d-flex justify-content-between align-items-center">
                     <h5 className="mb-0"><i className={`fas fa-map-marker-alt ${isArabic ? 'ms-2' : 'me-2'}`}></i>{isArabic ? 'موقع الانطلاق على الخريطة' : 'Pickup Location on Map'}</h5>
                     <span className={`badge fs-6 ${trip.status === 'active' ? 'text-bg-success' : trip.status === 'full' ? 'text-bg-warning' : 'text-bg-secondary'}`}>
                        {isArabic ? `الحالة: ${trip.status === 'active' ? 'نشطة' : trip.status === 'full' ? 'ممتلئة' : trip.status === 'completed' ? 'مكتملة' : trip.status === 'cancelled' ? 'ملغاة' : trip.status}` : `Status: ${trip.status}`}
                     </span>
                   </div>
                  <div className="card-body p-0">
                    {/* Map container div */}
                    <div id="map" style={{ height: '550px', width: '100%' }}>
                        {/* Display map-specific error, if any */}
                        {error && error.includes('الخريطة') && <div className='p-3 text-danger'>{error}</div>}
                    </div>
                  </div>
                </div>
              </div>

              {/* Details Column */}
              <div className="col-lg-5">
                <div className="card shadow-sm h-100">
                  <div className="card-body d-flex flex-column">
                    {/* Image */}
                    <div className="text-center mb-3">
                      <img
                        src={imageURL || 'https://via.placeholder.com/400x250.png?text=No+Car+Image'}
                        className="img-fluid rounded border"
                        alt={trip.carModel || (isArabic ? 'سيارة غير محددة' : 'Unnamed Car')}
                        style={{ width: '100%', height: '200px', objectFit: 'cover' }}
                        onError={(e) => { e.target.onerror = null; e.target.src='https://via.placeholder.com/400x250.png?text=Image+Error'; }}
                      />
                    </div>
                    {/* Car/Driver Info */}
                    <div className={`d-flex justify-content-between align-items-center mb-1 ${isArabic ? 'flex-row-reverse text-end' : ''}`}>
                       <h4 className="card-title mb-0">{trip.carModel || (isArabic ? 'سيارة غير محددة' : 'Unnamed Car')}</h4>
                       {trip.driver?.averageRating != null && trip.driver.averageRating > 0 && (
                            <span className="badge bg-warning text-dark fs-6">
                                {trip.driver.averageRating.toFixed(1)} <i className="fas fa-star fa-xs text-dark"></i>
                            </span>
                        )}
                     </div>
                     <p className={`text-muted mb-3 small ${isArabic ? 'text-end' : ''}`}>
                        {isArabic ? 'بواسطة' : 'By'} {driverName} ({trip.carColor || (isArabic ? 'لون غير محدد' : 'N/A Color')}) - {trip.carLicensePlate || (isArabic ? 'لوحة غير محددة' : 'N/A Plate')}
                     </p>
                     <hr className="my-2"/>
                    {/* Trip Details */}
                    <div className="mb-3 small text-muted flex-grow-1">
                       <p className="mb-2 d-flex align-items-center">
                         <i className={`fas fa-calendar-alt fa-fw ${isArabic ? 'ms-2' : 'me-2'}`} style={{color: '#6f42c1'}}></i>
                         <span className="flex-grow-1"><strong>{isArabic ? `التاريخ:` : `Date:`}</strong> {formattedDate}</span>
                       </p>
                       <p className="mb-2 d-flex align-items-center">
                         <i className={`fas fa-clock fa-fw ${isArabic ? 'ms-2' : 'me-2'}`} style={{color: '#fd7e14'}}></i>
                         <span className="flex-grow-1"><strong>{isArabic ? `الوقت:` : `Time:`}</strong> {trip.departureTime ? new Date(`1970-01-01T${trip.departureTime}`).toLocaleTimeString(isArabic ? 'ar-SA' : 'en-US', { hour: 'numeric', minute: '2-digit', hour12: true }) : (isArabic ? 'غير محدد' : 'N/A')}</span>
                       </p>
                       <p className="mb-2 d-flex align-items-center">
                         <i className={`fas fa-map-marker-alt fa-fw ${isArabic ? 'ms-2' : 'me-2'}`} style={{color: '#dc3545'}}></i>
                         <span className="flex-grow-1"><strong>{isArabic ? `من:` : `From:`}</strong> {pickupLocationName || trip.from || (isArabic ? 'غير محدد' : 'N/A')}</span>
                       </p>
                      <p className="mb-2 d-flex align-items-center">
                        <i className={`fas fa-map-pin fa-fw ${isArabic ? 'ms-2' : 'me-2'}`} style={{color: '#198754'}}></i>
                        <span className="flex-grow-1"><strong>{isArabic ? `إلى:` : `To:`}</strong> {trip.to || (isArabic ? 'غير محدد' : 'N/A')}</span>
                      </p>
                       <p className="mb-2 d-flex align-items-center">
                         <i className={`fas fa-road fa-fw ${isArabic ? 'ms-2' : 'me-2'}`}></i>
                         <span className="flex-grow-1"><strong>{isArabic ? `المسافة:` : `Distance:`}</strong> {trip.distanceKm ? `${trip.distanceKm} ${isArabic ? 'كم' : 'km'}` : (isArabic ? '~' : '~')}</span>
                       </p>
                       <p className="mb-2 d-flex align-items-center">
                         <i className={`fas fa-hourglass-half fa-fw ${isArabic ? 'ms-2' : 'me-2'}`}></i>
                         <span className="flex-grow-1"><strong>{isArabic ? `المدة:` : `Duration:`}</strong> {trip.estimatedDurationMinutes ? `${trip.estimatedDurationMinutes} ${isArabic ? 'دقيقة' : 'min'}` : (isArabic ? '~' : '~')}</span>
                       </p>
                       <p className="mb-2 d-flex align-items-center">
                         <i className={`fas fa-chair fa-fw ${isArabic ? 'ms-2' : 'me-2'}`}></i>
                         <span className="flex-grow-1"><strong>{isArabic ? `المقاعد المتاحة:` : `Seats Left:`}</strong> <span className="fw-bold text-primary">{trip.availableSeats ?? '0'}</span></span>
                       </p>
                        <p className="mb-2 d-flex align-items-center">
                         <i className={`fas fa-suitcase-rolling fa-fw ${isArabic ? 'ms-2' : 'me-2'}`}></i>
                         <span className="flex-grow-1"><strong>{isArabic ? `حد الحقائب للراكب:` : `Bag Limit/Passenger:`}</strong> {trip.passengerBagLimit === 0 ? (isArabic ? 'لا حقائب' : 'No bags') : trip.passengerBagLimit ?? (isArabic ? 'غير محدد' : 'Not specified')}</span>
                       </p>
                        <p className="mb-2 d-flex align-items-center">
                           <i className={`fas fa-users fa-fw ${isArabic ? 'ms-2' : 'me-2'}`}></i>
                           <span><strong>{isArabic ? `تفضيل الركاب:` : `Preference:`}</strong> {trip.driverPreference || (isArabic? 'الكل' : 'Any')}</span>
                         </p>
                      <p className="mb-0 d-flex align-items-center fw-bold fs-5">
                        <i className={`fas fa-money-bill-wave fa-fw ${isArabic ? 'ms-2' : 'me-2'}`} style={{color: '#0d6efd'}}></i>
                        <span className="flex-grow-1"><strong>{isArabic ? `السعر الإجمالي:` : `Total Cost:`}</strong> {typeof trip.cost === 'number' ? `${trip.cost.toFixed(2)} ${isArabic ? 'ر.س' : 'SAR'}` : (isArabic ? 'غير محدد' : 'N/A')}</span>
                      </p>
                    </div>
                    {/* Action Buttons */}
                    <div className="d-grid gap-2 mt-auto pt-3 border-top">
                      {isDriver ? (
                           <button className="btn btn-secondary btn-lg" disabled>
                             <i className={`fas fa-user-shield ${isArabic ? 'ms-1' : 'me-1'}`}></i>{isArabic ? 'هذه رحلتك (كسائق)' : 'This is Your Ride (Driver)'}
                           </button>
                      ) : isPassenger ? (
                         <>
                            <button className="btn btn-success btn-lg" disabled>
                                <i className={`fas fa-check ${isArabic ? 'ms-1' : 'me-1'}`}></i>{isArabic ? 'تم حجز هذه الرحلة' : 'You Booked This Ride'}
                            </button>
                            {trip.status === 'active' && (
                                <button
                                    className="btn btn-danger btn-lg"
                                    onClick={handleCancelBooking}
                                    disabled={isCancelling || loading} // Also disable if currently refreshing
                                >
                                  {isCancelling ? (
                                      <> <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span> {isArabic ? 'جاري الإلغاء...' : 'Cancelling Booking...'} </>
                                  ) : (
                                      <> <i className={`fas fa-times ${isArabic ? 'ms-1' : 'me-1'}`}></i>{isArabic ? 'إلغاء حجزي' : 'Cancel My Booking'} </>
                                  )}
                                </button>
                            )}
                         </>
                      ) : canBook ? (
                        <button
                          className="btn btn-primary btn-lg"
                          onClick={handleBookTrip}
                          disabled={isBooking || loading} // Also disable if currently refreshing
                        >
                          {isBooking ? (
                            <> <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span> {isArabic ? 'جاري الحجز...' : 'Processing Booking...'} </>
                           ) : (
                               <> <i className={`fas fa-check-circle ${isArabic ? 'ms-1' : 'me-1'}`}></i>{isArabic ? 'احجز مقعدك الآن' : 'Book Your Seat Now'} </>
                           )}
                        </button>
                      ) : (
                         <button className="btn btn-secondary btn-lg" disabled>
                           <i className={`fas fa-times-circle ${isArabic ? 'ms-1' : 'me-1'}`}></i>
                           { (trip.availableSeats ?? 0) <= 0 && trip.status === 'active' ? (isArabic ? 'الرحلة ممتلئة' : 'Trip is Full')
                             : trip.status !== 'active' ? (isArabic ? `الحجز غير متاح (${trip.status === 'completed' ? 'مكتملة' : trip.status === 'cancelled' ? 'ملغاة' : trip.status})` : `Booking Not Active (${trip.status})`)
                             : (isArabic ? 'الحجز غير متاح' : 'Booking Unavailable')}
                         </button>
                      )}
                      <Link to="/home" className="btn btn-outline-secondary">
                         <i className={`fas fa-search ${isArabic ? 'ms-1' : 'me-1'}`}></i>{isArabic ? 'العودة للبحث عن رحلات أخرى' : 'Back to Search Other Rides'}
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      );

}