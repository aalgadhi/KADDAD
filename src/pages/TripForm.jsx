import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import NavBar from '../Components/NavBar';
import 'bootstrap/dist/css/bootstrap.min.css';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Marker images
import markerIcon2x from '../assets/marker-icon-2x.png';
import markerIcon from '../assets/marker-icon.png';
import markerShadow from '../assets/marker-shadow.png';

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

// safely convert form values to numbers (undefined if input is empty)
const toNumber = (value) => (value === '' ? undefined : Number(value));

/*****************************
 * Map click handler component
 *****************************/
function MapClickHandler({ setDepartureLocation, setDepartureLat, setDepartureLng, lang }) {
  useMapEvents({
    click: (e) => {
      const { lat, lng } = e.latlng;
      fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&accept-language=${lang}`)
        .then((res) => res.json())
        .then((data) => {
          let loc = '';
          if (data.address) {
            const city = data.address.city || data.address.town || data.address.village || '';
            const area = data.address.neighbourhood || data.address.suburb || '';
            loc = [city, area].filter(Boolean).join(', ');
          }
          setDepartureLocation(loc || `Lat: ${lat}, Lng: ${lng}`);
          setDepartureLat(lat);
          setDepartureLng(lng);
        })
        .catch((err) => {
          console.error('Error reverse geocoding:', err);
          setDepartureLocation(`Lat: ${lat}, Lng: ${lng}`);
          setDepartureLat(lat);
          setDepartureLng(lng);
        });
    },
  });
  return null;
}

/*****************************
 * Main component
 *****************************/
export default function TripForm() {
  /* ───── UI / i18n state ───── */
  const [lang, setLang] = useState(getInitialLang);
  const isArabic = lang === 'ar';

  /* ───── Car info ───── */
  const [model, setModel] = useState('');
  const [color, setColor] = useState('');
  const [license, setLicense] = useState('');
  const [carImage, setCarImage] = useState(null);

  /* ───── Trip metrics ───── */
  const [departureTime, setDepartureTime] = useState(''); // HH:MM
  const [duration, setDuration] = useState(''); // minutes
  const [distance, setDistance] = useState(''); // km
  const [cost, setCost] = useState(''); // SAR
  const [seats, setSeats] = useState(''); // available seats
  const [bagLimit, setBagLimit] = useState(''); // optional
  const [preference, setPreference] = useState('Any'); // Any | Males Only | Females Only

  /* ───── Locations ───── */
  const [departure, setDeparture] = useState('');
  const [departureLat, setDepartureLat] = useState(null);
  const [departureLng, setDepartureLng] = useState(null);
  const [destination, setDestination] = useState('');
  const [locError, setLocError] = useState(false);

  /* ───── Hooks ───── */
  const navigate = useNavigate();
  const mapRef = useRef(null);

  /* Persist language in <html> and localStorage */
  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = isArabic ? 'rtl' : 'ltr';
    try {
      localStorage.setItem('lang', lang);
    } catch {}
  }, [lang, isArabic]);

  /* Configure Leaflet default icons once */
  useEffect(() => {
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: markerIcon2x,
      iconUrl: markerIcon,
      shadowUrl: markerShadow,
    });
  }, []);

  /* ───── Image preview handler ───── */
  const handleImageChange = (e) => {
    if (e.target.files?.[0]) {
      setCarImage(URL.createObjectURL(e.target.files[0]));
    }
  };

  /* ───── Submit handler ───── */
// in TripForm.jsx
const handleCreateTrip = async (e) => {
  e.preventDefault();

  if (!departure) {
    setLocError(true);
    return;
  }

  const newTrip = {
    from: departure,
    fromLat: departureLat,
    fromLng: departureLng,
    to: destination,
    departureTime,
    distanceKm: toNumber(distance),
    estimatedDurationMinutes: toNumber(duration),
    cost: toNumber(cost),
    availableSeats: seats,            // string is fine per your schema
    carModel: model.trim(),
    carColor: color.trim(),
    carLicensePlate: license.trim(),
    driverPreference: preference,
    passengerBagLimit: toNumber(bagLimit),
  };

  try {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Please log in again – token missing.');
      return;
    }

    const res = await fetch('http://localhost:8000/api/trips', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(newTrip),
    });

    if (res.ok) {
      navigate('/home');
    } else {
      const err = await res.json();
      console.error('Validation errors:', err);
      alert('Unable to create trip – please check your inputs.');
    }
  } catch (err) {
    console.error('Error saving trip:', err);
    alert('Network error – please try again later.');
  }
};

  /*****************************
   * Render
   *****************************/
  return (
    <div className="bg-light" dir={isArabic ? 'rtl' : 'ltr'}>
      <div className="container-fluid p-0">
        <NavBar lang={lang} setLang={setLang} />
        <div className="container py-4">
          <div className="row justify-content-center">
            <div className="col-md-9 col-lg-8">
              <div className="card shadow-sm">
                <div className="card-header bg-white">
                  <h4 className="mb-0">
                    {isArabic ? 'إنشاء رحلة (سائق)' : 'Create a Trip (Driver)'}
                  </h4>
                </div>
                <div className="card-body">
                  <form onSubmit={handleCreateTrip}>
                    {/* Car details */}
                    <div className="row mb-3">
                      <div className="col-md-4">
                        <label className="form-label">
                          {isArabic ? 'الموديل' : 'Car Model'}<span className="text-danger">*</span>
                        </label>
                        <input type="text" className="form-control" value={model} onChange={(e) => setModel(e.target.value)} required />
                      </div>
                      <div className="col-md-4">
                        <label className="form-label">
                          {isArabic ? 'اللون' : 'Color'}<span className="text-danger">*</span>
                        </label>
                        <input type="text" className="form-control" value={color} onChange={(e) => setColor(e.target.value)} required />
                      </div>
                      <div className="col-md-4">
                        <label className="form-label">
                          {isArabic ? 'اللوحة' : 'License Plate'}<span className="text-danger">*</span>
                        </label>
                        <input type="text" className="form-control" value={license} onChange={(e) => setLicense(e.target.value)} required />
                      </div>
                    </div>

                    {/* Trip metrics */}
                    <div className="row mb-3">
                      <div className="col-md-3">
                        <label className="form-label">
                          {isArabic ? 'وقت المغادرة' : 'Departure Time'}<span className="text-danger">*</span>
                        </label>
                        <input type="time" className="form-control" value={departureTime} onChange={(e) => setDepartureTime(e.target.value)} required />
                      </div>
                      <div className="col-md-3">
                        <label className="form-label">
                          {isArabic ? 'المدة (د)' : 'Duration (min)'}<span className="text-danger">*</span>
                        </label>
                        <input type="number" min="1" max="600" className="form-control" value={duration} onChange={(e) => setDuration(e.target.value)} required />
                      </div>
                      <div className="col-md-3">
                        <label className="form-label">
                          {isArabic ? 'المسافة (كم)' : 'Distance (km)'}<span className="text-danger">*</span>
                        </label>
                        <input type="number" min="1" max="1000" className="form-control" value={distance} onChange={(e) => setDistance(e.target.value)} required />
                      </div>
                      <div className="col-md-3">
                        <label className="form-label">
                          {isArabic ? 'التكلفة (ر.س)' : 'Cost (SAR)'}<span className="text-danger">*</span>
                        </label>
                        <input type="number" step="0.5" min="1" className="form-control" value={cost} onChange={(e) => setCost(e.target.value)} required />
                      </div>
                    </div>

                    <div className="row mb-3">
                      <div className="col-md-4">
                        <label className="form-label">
                          {isArabic ? 'عدد المقاعد' : 'Seats'}<span className="text-danger">*</span>
                        </label>
                        <input type="number" min="1" max="10" className="form-control" value={seats} onChange={(e) => setSeats(e.target.value)} required />
                      </div>
                      <div className="col-md-4">
                        <label className="form-label">
                          {isArabic ? 'حد الحقائب' : 'Bag Limit'}
                        </label>
                        <input type="number" min="0" max="5" className="form-control" value={bagLimit} onChange={(e) => setBagLimit(e.target.value)} />
                      </div>
                      <div className="col-md-4">
                        <label className="form-label">
                          {isArabic ? 'تفضيل الركاب' : 'Passenger Preference'}
                        </label>
                        <select className="form-select" value={preference} onChange={(e) => setPreference(e.target.value)}>
                          <option value="Any">{isArabic ? 'أي' : 'Any'}</option>
                          <option value="Males Only">{isArabic ? 'ذكور فقط' : 'Males Only'}</option>
                          <option value="Females Only">{isArabic ? 'إناث فقط' : 'Females Only'}</option>
                        </select>
                      </div>
                    </div>

                    {/* Car image */}
                    <div className="mb-3">
                      <label className="form-label">{isArabic ? 'صورة السيارة' : 'Car Image'}</label>
                      <input type="file" accept="image/*" className="form-control" onChange={handleImageChange} />
                      {carImage && (
                        <img src={carImage} alt="preview" className="img-thumbnail mt-2" style={{ maxWidth: 200 }} />
                      )}
                    </div>

                    {/* Map picker */}
                    <hr />
                    <h5 className="mb-3">{isArabic ? 'مسار الرحلة' : 'Trip Route'}<span className="text-danger">*</span></h5>
                    <div className="mb-3">
                      <label className="form-label">{isArabic ? 'مكان المغادرة' : 'Pickup Location'}<span className="text-danger">*</span></label>
                      {departure && <p className="small text-muted">{departure}</p>}
                      {locError && !departure && (
                        <p className="text-danger small mb-1">{isArabic ? 'يجب اختيار موقع الانطلاق من الخريطة' : 'Please pick a pickup location from the map.'}</p>
                      )}
                      <div style={{ height: 300, width: '100%' }}>
                        <MapContainer ref={mapRef} center={[26.30948, 50.14613]} zoom={13} style={{ height: '100%', width: '100%' }}>
                          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="© OpenStreetMap contributors" />
                          <MapClickHandler setDepartureLocation={setDeparture} setDepartureLat={setDepartureLat} setDepartureLng={setDepartureLng} lang={lang} />
                          {departureLat && departureLng && <Marker position={[departureLat, departureLng]} />}
                        </MapContainer>
                      </div>
                    </div>

                    {/* Destination */}
                    <div className="row mb-4">
                      <div className="col-md-6">
                        <label className="form-label">{isArabic ? 'مكان الوصول' : 'Destination'}<span className="text-danger">*</span></label>
                        <input type="text" className="form-control" value={destination} onChange={(e) => setDestination(e.target.value)} required />
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="d-grid gap-2">
                      <button type="submit" className="btn btn-primary">
                        {isArabic ? 'إنشاء رحلة' : 'Create Trip'}
                      </button>
                      <Link to="/home" className="btn btn-outline-secondary">
                        {isArabic ? 'إلغاء' : 'Cancel'}
                      </Link>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
