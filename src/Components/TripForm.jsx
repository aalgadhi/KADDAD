import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import NavBar from './NavBar';
import 'bootstrap/dist/css/bootstrap.min.css';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Import necessary marker images
import markerIcon2x from './Images/marker-icon-2x.png';
import markerIcon from './Images/marker-icon.png';
import markerShadow from './Images/marker-shadow.png';

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

// Component to handle map clicks and update the location
function MapClickHandler({ setDepartureLocation, setDepartureLat, setDepartureLng, lang }) {
  useMapEvents({
    click: (e) => {
      const { lat, lng } = e.latlng;

      // Use the 'accept-language' header to request the address in the correct language
      fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&accept-language=${lang}`)
        .then(res => res.json())
        .then(data => {
          let locationString = '';

          if (data.address) {
            const city = data.address.city || data.address.town || data.address.village || '';
            const area = data.address.neighbourhood || data.address.suburb || '';

            if (city) {
              locationString += city;
            }
            if (area) {
              locationString += (locationString ? ', ' : '') + area; // Add comma if city exists
            }
          }

          if (locationString) {
            setDepartureLocation(locationString);
            setDepartureLat(lat);
            setDepartureLng(lng);
          } else {
            setDepartureLocation(`Latitude: ${lat}, Longitude: ${lng}`); // Fallback if address not found
            setDepartureLat(lat);
            setDepartureLng(lng);
          }
        })
        .catch(err => {
          console.error("Error reverse geocoding:", err);
          setDepartureLocation(`Latitude: ${lat}, Longitude: ${lng}`); // Fallback on error
          setDepartureLat(lat);
          setDepartureLng(lng);
        });
    },
  });

  return null;
}


function TripForm() {
  const [lang, setLang] = useState(getInitialLang);
  const [model, setModel] = useState('');
  const [color, setColor] = useState('');
  const [license, setLicense] = useState('');
  const [departure, setDeparture] = useState('');
  const [departureLat, setDepartureLat] = useState(null);
  const [departureLng, setDepartureLng] = useState(null);
  const [destination, setDestination] = useState('');
  const [estimatedTime, setEstimatedTime] = useState('');
  const [distance, setDistance] = useState('');
  const [cost, setCost] = useState('');
  const [carImage, setCarImage] = useState(null); // State for car image
  const navigate = useNavigate(); // Hook for navigation
  const mapRef = useRef(null); // Ref for the map instance


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

  const isArabic = lang === 'ar';

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setCarImage(URL.createObjectURL(e.target.files[0])); // Create URL for preview
    }
  };

  const handleCreateTrip = (e) => {
    e.preventDefault();
    const newTrip = {
      id: `local-${Date.now()}`, // Generate ID here
      car: model,
      rating: '★★★☆☆',
      from: departure,
      to: destination,
      time: estimatedTime,
      cost: cost,
      color: color,
      license: license,
      distance: distance,
      driver: 'You',
      carImage: carImage, // Save image URL to local storage
      fromLat: departureLat,  // save lat
      fromLng: departureLng,  // save lng
    };
    try {
      const existingTrips = JSON.parse(localStorage.getItem('driverTrips')) || [];
      existingTrips.push(newTrip);
      localStorage.setItem('driverTrips', JSON.stringify(existingTrips));
      navigate('/home'); // Use navigate for redirection
    } catch (error) {
      console.error("Could not save trip to localStorage:", error);
      // Handle the error appropriately (e.g., display an error message)
    }
  };

  useEffect(() => {
        delete L.Icon.Default.prototype._getIconUrl;
        L.Icon.Default.mergeOptions({
            iconRetinaUrl: markerIcon2x,
            iconUrl: markerIcon,
            shadowUrl: markerShadow,
        });
    }, []);

  return (
    <div className="bg-light" dir={isArabic ? 'rtl' : 'ltr'}>
      <div className="container-fluid p-0">
        <NavBar lang={lang} setLang={setLang} />
        <div className="container py-4">
          <div className="row justify-content-center">
            <div className="col-md-8">
              <div className="card shadow-sm">
                <div className="card-header bg-white">
                  <h4 className="mb-0">{isArabic ? 'إنشاء رحلة (سائق)' : 'Create a Trip (Driver)'}</h4>
                </div>
                <div className="card-body">
                  <form onSubmit={handleCreateTrip}>
                    <div className="row mb-3">
                      <div className="col-md-6">
                        <label className="form-label">{isArabic ? 'الموديل (مثال: كامري 2022)' : 'Model (e.g., Camry 2022)'}</label>
                        <input
                          type="text"
                          className="form-control"
                          required
                          value={model}
                          onChange={(e) => setModel(e.target.value)}
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">{isArabic ? 'اللون (مثال: أبيض)' : 'Color (e.g., White)'}</label>
                        <input
                          type="text"
                          className="form-control"
                          required
                          value={color}
                          onChange={(e) => setColor(e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="row mb-3">
                      <div className="col-md-6">
                        <label className="form-label">{isArabic ? 'اللوحة (مثال: KSA-1234)' : 'License Plate (e.g., KSA-1234)'}</label>
                        <input
                          type="text"
                          className="form-control"
                          required
                          value={license}
                          onChange={(e) => setLicense(e.target.value)}
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">{isArabic ? 'الوقت المقدر (مثال: 25 دقيقة)' : 'Estimated Time (e.g., 25 min)'}</label>
                        <input
                          type="text"
                          className="form-control"
                          required
                          value={estimatedTime}
                          onChange={(e) => setEstimatedTime(e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="row mb-3">
                      <div className="col-md-6">
                        <label className="form-label">{isArabic ? 'المسافة (مثال: 12 كم)' : 'Distance (e.g., 12 km)'}</label>
                        <input
                          type="text"
                          className="form-control"
                          required
                          value={distance}
                          onChange={(e) => setDistance(e.target.value)}
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">{isArabic ? 'التكلفة (مثال: 50.00ريال)' : 'Cost (e.g., ريال50.00)'}</label>
                        <input
                          type="text"
                          className="form-control"
                          required
                          value={cost}
                          onChange={(e) => setCost(e.target.value)}
                        />
                      </div>
                    </div>

                    {/* Car Image Upload */}
                    <div className="mb-3">
                      <label className="form-label">{isArabic ? 'صورة السيارة' : 'Car Image'}</label>
                      <input
                        type="file"
                        className="form-control"
                        accept="image/*"
                        onChange={handleImageChange}
                      />
                      {carImage && (
                        <img
                          src={carImage}
                          alt="Car Preview"
                          className="img-thumbnail mt-2"
                          style={{ maxWidth: '200px' }}
                        />
                      )}
                    </div>
                    <hr />
                    <h5 className="mb-3">{isArabic ? 'مسار الرحلة' : 'Trip Route'}</h5>

                    {/* Leaflet Map */}
                    <div className="mb-3">
                      <label className="form-label">{isArabic ? 'مكان المغادرة' : 'Pickup Location'}</label>
                      {departure && <p>{isArabic ? 'الموقع المحدد:' : 'Selected Location:'} {departure}</p>}
                      <div style={{ height: '300px', width: '100%' }}>
                        <MapContainer
                          ref={mapRef}
                          center={[26.309481137282766, 50.14613563325346]}
                          zoom={13}
                          style={{ height: '300px', width: '100%' }}
                        >
                          <TileLayer
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                          />
                          <MapClickHandler
                            setDepartureLocation={setDeparture}
                            setDepartureLat={setDepartureLat}
                            setDepartureLng={setDepartureLng}
                            lang={lang} // Pass the language to the component
                          />
                          {departureLat && departureLng && (
                            <Marker position={[departureLat, departureLng]} >
                            </Marker>
                          )}
                        </MapContainer>
                      </div>
                    </div>

                    <div className="row mb-3">


                      <div className="col-md-6">
                        <label className="form-label">{isArabic ? 'مكان الوصول' : 'Destination Location'}</label>
                        <input
                          type="text"
                          className="form-control"
                          placeholder={isArabic ? 'الرياض' : 'Riyadh'}
                          required
                          value={destination}
                          onChange={(e) => setDestination(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="d-grid gap-2">
                      <button type="submit" className="btn btn-primary">
                        {isArabic ? 'إنشاء رحلة' : 'Create Trip'}
                      </button>
                      <Link
                        to="/home"
                        className="btn btn-outline-secondary"
                      >
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

export default TripForm;