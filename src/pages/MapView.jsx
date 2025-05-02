import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import NavBar from '../components/NavBar';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

import markerIcon2x from '../assets/marker-icon-2x.png';
import markerIcon   from '../assets/marker-icon.png';
import markerShadow from '../assets/marker-shadow.png';

import 'bootstrap/dist/css/bootstrap.min.css';
import '@fortawesome/fontawesome-free/css/all.min.css';

/*****************************
 * Helpers
 *****************************/
const getInitialLang = () =>
  localStorage.getItem('lang') || (navigator.language.startsWith('ar') ? 'ar' : 'en');

const defaultLatLng = [24.7136, 46.6753]; // Riyadh fallback
const defaultRides  = [];                 // demo trips (optional)

/*****************************
 * Component
 *****************************/
export default function MapView() {
  /* ───── URL / language ───── */
  const { tripId }  = useParams();
  const [lang, setLang] = useState(getInitialLang());
  const isArabic    = lang === 'ar';

  /* ───── Data ───── */
  const [trip, setTrip]             = useState(null);
  const [pickupLocation, setPickup] = useState(null);

  /* ───── Map ref ───── */
  const mapRef = useRef(null);

  /* ───── Fetch single trip from backend ───── */
  const fetchTripById = async (id) => {
    try {
      const res = await fetch(`http://localhost:8000/api/trips/${id}`);
      if (!res.ok) throw new Error('not-found');
      const json = await res.json();
      return json.data;
    } catch {
      return null;
    }
  };

  /* ───── Load trip (localStorage ► backend) ───── */
  useEffect(() => {
    (async () => {
      try {
        const localTrips = JSON.parse(localStorage.getItem('driverTrips') || '[]');
        const allTrips   = [
          ...defaultRides.map((r,i)=>({ ...r, id:`default-${i}` })),
          ...localTrips,
        ];

        let found = allTrips.find(t => String(t.id) === String(tripId));
        if (!found) found = await fetchTripById(tripId);

        setTrip(found || null);
        if (!found) return;

        /* reverse‑geocode pickup */
        if (found.fromLat !== undefined && found.fromLng !== undefined) {
          fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${found.fromLat}&lon=${found.fromLng}`)
            .then(r=>r.json())
            .then(d=> setPickup(d.display_name || `Lat: ${found.fromLat}, Lng: ${found.fromLng}`))
            .catch(()=> setPickup(`Lat: ${found.fromLat}, Lng: ${found.fromLng}`));
        } else {
          setPickup(found.from || (isArabic ? 'غير محدد' : 'N/A'));
        }
      } catch (e) {
        console.error(e);
        setTrip(null);
      }
    })();
  }, [tripId, isArabic]);

  /* ───── keep <html> lang / dir in sync ───── */
  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir  = isArabic ? 'rtl' : 'ltr';
    try { localStorage.setItem('lang', lang); } catch {}
  }, [lang, isArabic]);

  /* ───── Initialise / update Leaflet map ───── */
  useEffect(() => {
    if (!trip) return;

    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: markerIcon2x,
      iconUrl: markerIcon,
      shadowUrl: markerShadow,
    });

    if (mapRef.current) return; // prevent double‑init

    const lat = trip.fromLat ?? defaultLatLng[0];
    const lng = trip.fromLng ?? defaultLatLng[1];

    const map = L.map('map').setView([lat, lng], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
    }).addTo(map);

    L.marker([lat, lng])
      .addTo(map)
      .bindPopup(isArabic ? 'موقع الالتقاط' : 'Pickup Location')
      .openPopup();

    mapRef.current = map;

    return () => {      // cleanup
      map.remove();
      mapRef.current = null;
    };
  }, [trip, isArabic]);

  /* ───── Booking handler ───── */
  const handleBookTrip = async () => {
    try {
      const res = await fetch(`http://localhost:8000/api/trips/${tripId}/book`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      const json = await res.json();
      if (json.success) {
        window.location.href = '/confirmation';
      } else {
        alert(json.error || (isArabic ? 'فشل في الحجز' : 'Booking failed'));
      }
    } catch (e) {
      console.error(e);
      alert(isArabic ? 'حدث خطأ أثناء الحجز' : 'Booking error');
    }
  };

  /*****************************
   * Render
   *****************************/
  if (!trip) {
    return (
      <div className="container py-5 text-center">
        <h2>{isArabic ? 'الرحلة غير موجودة' : 'Trip Not Found'}</h2>
        <Link to="/home" className="btn btn-primary mt-3">
          {isArabic ? 'العودة إلى الصفحة الرئيسية' : 'Back to Home'}
        </Link>
      </div>
    );
  }

  const driverName = trip.driver
    ? `${trip.driver.firstName || ''} ${trip.driver.lastName || ''}`.trim()
    : isArabic ? 'غير محدد' : 'Unknown';

  return (
    <div className={`bg-light ${isArabic ? 'rtl' : 'ltr'}`} dir={isArabic ? 'rtl' : 'ltr'}>
      <div className="container-fluid p-0">
        <NavBar lang={lang} setLang={setLang} />

        <div className="container-fluid py-3">
          <div className="row">
            {/* Map column */}
            <div className="col-lg-8 mb-4 mb-lg-0">
              <div className="card shadow-sm h-100">
                <div className="card-header bg-white">
                  <h5 className="mb-0">{isArabic ? 'الموقع الدقيق' : 'Precise Location'}</h5>
                </div>
                <div className="card-body p-0">
                  <div id="map" style={{ height: 500, width: '100%' }} />
                </div>
              </div>
            </div>

            {/* Details column */}
            <div className="col-lg-4">
              <div className="card shadow-sm h-100">
                <div className="card-body d-flex flex-column">
                  {/* image */}
                  <div className="text-center mb-3">
                    <img
                      src={trip.carImage || 'https://via.placeholder.com/300x200.png?text=No+Image'}
                      className="img-fluid rounded"
                      alt={trip.carModel || (isArabic ? 'سيارة غير محددة' : 'Unnamed Car')}
                      style={{ maxWidth: '100%', maxHeight: 200, objectFit: 'cover' }}
                    />
                  </div>

                  {/* title & rating */}
                  <h4 className="card-title">{trip.carModel || (isArabic ? 'سيارة غير محددة' : 'Unnamed Car')}</h4>
                  <div className="d-flex justify-content-between mb-2">
                    <span className="text-muted">
                      {isArabic ? `السائق: ${driverName}` : `Driver: ${driverName}`}
                    </span>
                    <span className="badge bg-success">{trip.rating || 'N/A'}</span>
                  </div>

                  <hr />

                  {/* trip info */}
                  <div className="mb-3 small text-muted">
                    <p className="mb-1">
                      <i className="fas fa-map-marker-alt me-2" />
                      {isArabic ? `موقع الالتقاط: ${pickupLocation}` : `Pickup: ${pickupLocation}`}
                    </p>
                    <p className="mb-1">
                      <i className="fas fa-map-marker-alt me-2" />
                      {isArabic ? `الوجهة: ${trip.to}` : `Destination: ${trip.to}`}
                    </p>
                    <p className="mb-1">
                      <i className="fas fa-clock me-2" />
                      {isArabic ? `الوقت: ${trip.departureTime}` : `Time: ${trip.departureTime}`}
                    </p>
                    <p className="mb-1">
                      <i className="fas fa-road me-2" />
                      {isArabic
                        ? `المسافة: ${trip.distanceKm ?? 'غير محدد'}`
                        : `Distance: ${trip.distanceKm ?? 'N/A'} km`}
                    </p>
                    <p className="mb-0">
                      <i className="fas fa-money-bill me-2" />
                      {isArabic
                        ? `السعر: ${trip.cost ?? 'غير محدد'}`
                        : `Cost: ${trip.cost ?? 'N/A'}`}
                    </p>
                  </div>

                  {/* actions */}
                  <div className="d-grid gap-2 mt-auto">
                    <button className="btn btn-primary" onClick={handleBookTrip}>
                      {isArabic ? 'احجز هذه الرحلة' : 'Book This Ride'}
                    </button>
                    <Link to="/home" className="btn btn-outline-secondary">
                      {isArabic ? 'العودة للبحث' : 'Back to Search'}
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}