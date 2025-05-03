// TripForm.js
import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import NavBar from '../Components/NavBar';
import 'bootstrap/dist/css/bootstrap.min.css';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

import markerIcon2x from '../assets/marker-icon-2x.png';
import markerIcon from '../assets/marker-icon.png';
import markerShadow from '../assets/marker-shadow.png';

const getInitialLang = () => {
  try {
    const storedLang = localStorage.getItem('lang');
    if (storedLang) return storedLang;
  } catch (e) {
    console.error('Could not access localStorage:', e);
  }
  return navigator.language.startsWith('ar') ? 'ar' : 'en';
};

const toNumber = (value) => (value === '' ? undefined : Number(value));

function MapClickHandler({ setDepartureLocation, setDepartureLat, setDepartureLng, lang, setLocError }) {
  useMapEvents({
    click: (e) => {
      const { lat, lng } = e.latlng;
      setLocError(false);
      fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&accept-language=${lang}`)
        .then((res) => res.json())
        .then((data) => {
          let loc = '';
          if (data.address) {
            const city = data.address.city || data.address.town || data.address.village || data.address.county || '';
            const area = data.address.neighbourhood || data.address.suburb || data.address.road || '';
            loc = [city, area].filter(Boolean).join(', ');
          }
          setDepartureLocation(loc || `Lat: ${lat.toFixed(5)}, Lng: ${lng.toFixed(5)}`);
          setDepartureLat(lat);
          setDepartureLng(lng);
        })
        .catch((err) => {
          console.error('Error reverse geocoding:', err);
          setDepartureLocation(`Lat: ${lat.toFixed(5)}, Lng: ${lng.toFixed(5)}`);
          setDepartureLat(lat);
          setDepartureLng(lng);
        });
    },
  });
  return null;
}

export default function TripForm() {
  const [lang, setLang] = useState(getInitialLang);
  const isArabic = lang === 'ar';

  const [model, setModel] = useState('');
  const [color, setColor] = useState('');
  const [license, setLicense] = useState('');
  const [carImage, setCarImage] = useState(null);
  const [carImageFile, setCarImageFile] = useState(null);

  const [date, setDate] = useState('');
  const [departureTime, setDepartureTime] = useState('');
  const [duration, setDuration] = useState('');
  const [distance, setDistance] = useState('');
  const [cost, setCost] = useState('');
  const [seats, setSeats] = useState('');
  const [bagLimit, setBagLimit] = useState('');
  const [preference, setPreference] = useState('Any');

  const [departure, setDeparture] = useState('');
  const [departureLat, setDepartureLat] = useState(null);
  const [departureLng, setDepartureLng] = useState(null);
  const [destination, setDestination] = useState('');
  const [locError, setLocError] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();
  const mapRef = useRef(null);
  const formRef = useRef(null);

   const getTodayDateString = () => {
    const today = new Date();
    const offset = today.getTimezoneOffset();
    const adjustedToday = new Date(today.getTime() - (offset*60*1000));
    return adjustedToday.toISOString().split('T')[0];
  };

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = isArabic ? 'rtl' : 'ltr';
    try {
      localStorage.setItem('lang', lang);
    } catch {}
  }, [lang, isArabic]);

  useEffect(() => {
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: markerIcon2x,
      iconUrl: markerIcon,
      shadowUrl: markerShadow,
    });
  }, []);

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
        if (file.size > 5 * 1024 * 1024) {
            alert(isArabic ? 'حجم الصورة يجب أن يكون أقل من 5 ميجابايت.' : 'Image size should be less than 5MB.');
            e.target.value = null;
            return;
        }
        if (!file.type.startsWith('image/')) {
            alert(isArabic ? 'الرجاء اختيار ملف صورة صالح.' : 'Please select a valid image file.');
            e.target.value = null;
            return;
        }
      setCarImage(URL.createObjectURL(file));
      setCarImageFile(file);
    } else {
      setCarImage(null);
      setCarImageFile(null);
    }
  };

  const handleCreateTrip = async (e) => {
    e.preventDefault();
    setLocError(false);
    setIsSubmitting(true);

    if (!formRef.current?.checkValidity()) {
      formRef.current?.reportValidity();
      setIsSubmitting(false);
      return;
    }

    if (!departure || departureLat === null || departureLng === null) {
      setLocError(true);
       const mapElement = document.getElementById('map-section');
       if (mapElement) {
         mapElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
       }
      setIsSubmitting(false);
      return;
    }

    const formData = new FormData();

    formData.append('from', departure);
    formData.append('fromLat', departureLat);
    formData.append('fromLng', departureLng);
    formData.append('to', destination.trim());
    formData.append('date', date);
    formData.append('departureTime', departureTime);
    formData.append('distanceKm', toNumber(distance));
    formData.append('estimatedDurationMinutes', toNumber(duration));
    formData.append('cost', toNumber(cost));
    formData.append('availableSeats', toNumber(seats));
    formData.append('carModel', model.trim());
    formData.append('carColor', color.trim());
    formData.append('carLicensePlate', license.trim());
    formData.append('driverPreference', preference);
    if (bagLimit !== '' && !isNaN(Number(bagLimit))) {
      formData.append('passengerBagLimit', toNumber(bagLimit));
    }


    if (carImageFile) {
      formData.append('carImage', carImageFile);
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert(isArabic ? 'الرجاء تسجيل الدخول مرة أخرى - الرمز مفقود.' : 'Please log in again – token missing.');
        setIsSubmitting(false);
        return;
      }

      const res = await fetch('http://localhost:8000/api/trips', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (res.ok) {
        navigate('/home');
      } else {
        const err = await res.json();
        console.error('Submission error:', err);
         let errorMsg = isArabic ? 'تعذر إنشاء الرحلة. الرجاء التحقق من جميع الحقول المطلوبة والمحاولة مرة أخرى.' : 'Unable to create trip. Please check all required fields and try again.';
         if (err && err.message) {
            errorMsg = err.message;
         } else if (err && err.errors) {
            const messages = Object.values(err.errors).map(e => e.message).join('\n');
            errorMsg = `${isArabic ? 'أخطاء التحقق:' : 'Validation Errors:'}\n${messages}`;
         }
         alert(errorMsg);
      }
    } catch (err) {
      console.error('Network error saving trip:', err);
      alert(isArabic ? 'خطأ في الشبكة - يرجى المحاولة مرة أخرى لاحقًا.' : 'Network error – please try again later.');
    } finally {
       setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-light" dir={isArabic ? 'rtl' : 'ltr'}>
      <div className="container-fluid p-0">
        <NavBar lang={lang} setLang={setLang} />
        <div className="container py-4">
          <div className="row justify-content-center">
            <div className="col-md-10 col-lg-8">
              <div className="card shadow-sm">
                <div className="card-header bg-primary text-white">
                  <h4 className="mb-0">
                    <i className={`fas fa-car-side ${isArabic ? 'ms-2' : 'me-2'}`}></i>
                    {isArabic ? 'إنشاء رحلة جديدة' : 'Create a New Trip'}
                  </h4>
                </div>
                <div className="card-body p-lg-4">
                  <form ref={formRef} onSubmit={handleCreateTrip} noValidate>
                    <h5 className="mb-3">{isArabic ? '1. تفاصيل السيارة' : '1. Car Details'}</h5>
                    <div className="row mb-3 g-3">
                      <div className="col-md-4">
                        <label htmlFor="carModelInput" className="form-label">
                          {isArabic ? 'موديل السيارة' : 'Car Model'}<span className="text-danger">*</span>
                        </label>
                        <input id="carModelInput" type="text" className="form-control" value={model} onChange={(e) => setModel(e.target.value)} required maxLength="50" />
                      </div>
                      <div className="col-md-4">
                        <label htmlFor="carColorInput" className="form-label">
                          {isArabic ? 'لون السيارة' : 'Color'}<span className="text-danger">*</span>
                        </label>
                        <input id="carColorInput" type="text" className="form-control" value={color} onChange={(e) => setColor(e.target.value)} required maxLength="30" />
                      </div>
                      <div className="col-md-4">
                        <label htmlFor="licensePlateInput" className="form-label">
                          {isArabic ? 'رقم اللوحة' : 'License Plate'}<span className="text-danger">*</span>
                        </label>
                        <input id="licensePlateInput" type="text" className="form-control" value={license} onChange={(e) => setLicense(e.target.value)} required maxLength="20" />
                      </div>
                    </div>
                     <div className="mb-4">
                      <label htmlFor="carImageInput" className="form-label">{isArabic ? 'صورة السيارة' : 'Car Image'} <span className="text-muted small">{isArabic ? '(اختياري)' : '(Optional)'}</span></label>
                      <input id="carImageInput" type="file" accept="image/png, image/jpeg, image/webp" className="form-control" onChange={handleImageChange} />
                      {carImage && (
                        <img src={carImage} alt={isArabic ? 'معاينة' : 'Preview'} className="img-thumbnail mt-2" style={{ maxWidth: 200, maxHeight: 150, objectFit: 'cover' }} />
                      )}
                      <div className="form-text">{isArabic ? 'الحجم الأقصى 5 ميجابايت (JPG, PNG, WEBP)' : 'Max 5MB (JPG, PNG, WEBP)'}</div>
                    </div>


                    <hr/>
                      <h5 className="mb-3">{isArabic ? '2. تفاصيل الرحلة' : '2. Trip Details'}</h5>
                     <div className="row mb-3 g-3">
                       <div className="col-md-6">
                         <label htmlFor="tripDateInput" className="form-label">
                           {isArabic ? 'تاريخ الرحلة' : 'Trip Date'}<span className="text-danger">*</span>
                         </label>
                         <input id="tripDateInput" type="date" className="form-control" value={date} onChange={(e) => setDate(e.target.value)} required min={getTodayDateString()}/>
                       </div>
                       <div className="col-md-6">
                         <label htmlFor="departureTimeInput" className="form-label">
                           {isArabic ? 'وقت المغادرة' : 'Departure Time'}<span className="text-danger">*</span>
                         </label>
                         <input id="departureTimeInput" type="time" className="form-control" value={departureTime} onChange={(e) => setDepartureTime(e.target.value)} required />
                       </div>
                     </div>

                     <div className="row mb-3 g-3">
                      <div className="col-md-4">
                        <label htmlFor="durationInput" className="form-label">
                          {isArabic ? 'المدة المقدرة (دقائق)' : 'Est. Duration (min)'}<span className="text-danger">*</span>
                        </label>
                        <input id="durationInput" type="number" min="1" max="1440" className="form-control" value={duration} onChange={(e) => setDuration(e.target.value)} required placeholder={isArabic ? 'مثال: 60' : 'e.g., 60'} />
                      </div>
                      <div className="col-md-4">
                        <label htmlFor="distanceInput" className="form-label">
                          {isArabic ? 'المسافة المقدرة (كم)' : 'Est. Distance (km)'}<span className="text-danger">*</span>
                        </label>
                        <input id="distanceInput" type="number" min="1" max="5000" className="form-control" value={distance} onChange={(e) => setDistance(e.target.value)} required placeholder={isArabic ? 'مثال: 100' : 'e.g., 100'}/>
                      </div>
                      <div className="col-md-4">
                        <label htmlFor="costInput" className="form-label">
                          {isArabic ? 'التكلفة الإجمالية (ر.س)' : 'Total Cost (SAR)'}<span className="text-danger">*</span>
                        </label>
                        <input id="costInput" type="number" step="0.5" min="1" max="1000" className="form-control" value={cost} onChange={(e) => setCost(e.target.value)} required placeholder={isArabic ? 'مثال: 50.5' : 'e.g., 50.5'}/>
                      </div>
                    </div>


                     <hr/>
                     <h5 className="mb-3">{isArabic ? '3. تفاصيل الركاب' : '3. Passenger Details'}</h5>
                    <div className="row mb-4 g-3">
                        <div className="col-md-4">
                         <label htmlFor="seatsInput" className="form-label">
                           {isArabic ? 'المقاعد المتاحة' : 'Available Seats'}<span className="text-danger">*</span>
                         </label>
                         <input id="seatsInput" type="number" min="1" max="10" className="form-control" value={seats} onChange={(e) => setSeats(e.target.value)} required placeholder="1-10" />
                       </div>
                       <div className="col-md-4">
                        <label htmlFor="preferenceInput" className="form-label">
                          {isArabic ? 'تفضيل الركاب' : 'Passenger Preference'}
                        </label>
                        <select id="preferenceInput" className="form-select" value={preference} onChange={(e) => setPreference(e.target.value)}>
                          <option value="Any">{isArabic ? 'أيًّا كان' : 'Any'}</option>
                          <option value="Males Only">{isArabic ? 'ذكور فقط' : 'Males Only'}</option>
                          <option value="Females Only">{isArabic ? 'إناث فقط' : 'Females Only'}</option>
                        </select>
                      </div>
                      <div className="col-md-4">
                        <label htmlFor="bagLimitInput" className="form-label">
                          {isArabic ? 'حد الحقائب للراكب' : 'Bag Limit per Passenger'}
                        </label>
                        <input id="bagLimitInput" type="number" min="0" max="5" className="form-control" placeholder={isArabic ? '0 = لا حقائب (اختياري)' : '0 = No bags (Optional)'} value={bagLimit} onChange={(e) => setBagLimit(e.target.value)} />
                      </div>
                    </div>


                    <hr />
                    <h5 className="mb-3" id="map-section">{isArabic ? '4. مسار الرحلة' : '4. Trip Route'}</h5>
                    <div className="mb-3">
                      <label className="form-label">{isArabic ? 'نقطة الانطلاق (اختر من الخريطة)' : 'Pickup Location (Pick from Map)'}<span className="text-danger">*</span></label>
                      {departure && <p className="small text-success mb-1"><i className="fas fa-check-circle me-1"></i>{departure}</p>}
                      {locError && (
                        <p className="text-danger small mb-1"><i className="fas fa-exclamation-triangle me-1"></i>{isArabic ? 'الرجاء تحديد نقطة الانطلاق بالنقر على الخريطة.' : 'Please select the pickup point by clicking on the map.'}</p>
                      )}
                      <div style={{ height: 300, width: '100%', border: locError ? '2px solid #dc3545' : '1px solid #ced4da', borderRadius: '0.375rem' }}>
                        <MapContainer ref={mapRef} center={[26.3071, 50.1459]} zoom={13} style={{ height: '100%', width: '100%', borderRadius: 'calc(0.375rem - 1px)' }}>
                          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' />
                          <MapClickHandler setDepartureLocation={setDeparture} setDepartureLat={setDepartureLat} setDepartureLng={setDepartureLng} lang={lang} setLocError={setLocError} />
                          {departureLat && departureLng && <Marker position={[departureLat, departureLng]} />}
                        </MapContainer>
                      </div>
                    </div>

                    <div className="mb-4">
                        <label htmlFor="destinationInput" className="form-label">{isArabic ? 'الوجهة (اسم المدينة/الحي)' : 'Destination (City/Neighborhood Name)'}<span className="text-danger">*</span></label>
                        <input id="destinationInput" type="text" className="form-control" value={destination} onChange={(e) => setDestination(e.target.value)} required maxLength="100" placeholder={isArabic ? 'مثال: الرياض, حي العليا' : 'e.g., Riyadh, Olaya District'}/>
                    </div>

                    <hr/>
                    <div className="d-grid gap-2">
                      <button type="submit" className="btn btn-primary btn-lg" disabled={isSubmitting}>
                        {isSubmitting ? (
                            <>
                                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                {isArabic ? 'جاري الإنشاء...' : 'Creating Trip...'}
                            </>
                        ) : (
                            isArabic ? 'تأكيد ونشر الرحلة' : 'Confirm & Publish Trip'
                        )}
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