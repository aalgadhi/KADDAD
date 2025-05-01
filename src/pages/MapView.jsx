import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import NavBar from '../components/NavBar';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

import markerIcon2x from '../assets/marker-icon-2x.png';
import markerIcon from '../assets/marker-icon.png';
import markerShadow from '../assets/marker-shadow.png';

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

const defaultLatLng = [24.7136, 46.6753]; // Default latitude and longitude for Riyadh

const defaultRides = [];

function MapView() {
    const { tripId } = useParams();
    const [lang, setLang] = useState(getInitialLang());
    const isArabic = lang === 'ar';
    const [trip, setTrip] = useState(null);
    const [map, setMap] = useState(null);
    const [pickupLocation, setPickupLocation] = useState(null);  // State for pickup location address

    useEffect(() => {
        const loadTrip = () => {
            try {
                const localTrips = JSON.parse(localStorage.getItem('driverTrips') || '[]');
                console.log("localTrips", localTrips);
                const allTrips = [
                    ...defaultRides.map((ride, index) => ({ ...ride, id: `default-${index}` })),
                    ...localTrips.map((ride, index) => ({ ...ride, id: ride.id || `local-${Date.now()}-${index}` }))
                ];

                const foundTrip = allTrips.find(t => String(t.id) === String(tripId));

                setTrip(foundTrip || null);
                console.log("Found Trip:", foundTrip);

                if (foundTrip && foundTrip.fromLat && foundTrip.fromLng) {
                    // Reverse geocode the stored coordinates to get the address
                    fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${foundTrip.fromLat}&lon=${foundTrip.fromLng}`)
                        .then(res => res.json())
                        .then(data => {
                            if (data.display_name) {
                                setPickupLocation(data.display_name); // Set the fetched address
                            } else {
                                setPickupLocation(`Latitude: ${foundTrip.fromLat}, Longitude: ${foundTrip.fromLng}`);
                            }
                        })
                        .catch(err => {
                            console.error("Error reverse geocoding:", err);
                            setPickupLocation(`Latitude: ${foundTrip.fromLat}, Longitude: ${foundTrip.fromLng}`); // Fallback on error
                        });
                } else if (foundTrip && foundTrip.from) {
                    // If coordinates are missing, use the 'from' location (if available)
                    setPickupLocation(foundTrip.from);
                }
            } catch (error) {
                console.error('Error loading trip data:', error);
                setTrip(null);
            }
        };

        loadTrip();
    }, [tripId]);

    useEffect(() => {
        document.documentElement.lang = lang;
        document.documentElement.dir = isArabic ? 'rtl' : 'ltr';
        try {
            if (localStorage.getItem('lang') !== lang) {
                localStorage.setItem('lang', lang);
            }
        } catch (e) {
            console.error("Could not update localStorage:", e);
        }
    }, [lang, isArabic]);

    const handleBookTrip = async () => {
        try {
            const response = await fetch(`http://localhost:5000/${tripId}/book`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${localStorage.getItem('token')}`, // make sure token is stored like this
                },
            });

            const result = await response.json();

            if (result.success) {
                alert(isArabic ? 'تم حجز الرحلة بنجاح' : 'Trip booked successfully');
            } else {
                alert(result.error || (isArabic ? 'فشل في الحجز' : 'Booking failed'));
            }
        } catch (error) {
            console.error('Booking error:', error);
            alert(isArabic ? 'حدث خطأ أثناء الحجز' : 'An error occurred while booking');
        }
    };

    useEffect(() => {
        if (!trip) return;

        delete L.Icon.Default.prototype._getIconUrl;
        L.Icon.Default.mergeOptions({
            iconRetinaUrl: markerIcon2x,
            iconUrl: markerIcon,
            shadowUrl: markerShadow,
        });

        // Destroy existing map instance
        if (map) {
            map.remove();
        }

        try {
            let pickupLat = trip.fromLat;
            let pickupLng = trip.fromLng;

            if (pickupLat === undefined || pickupLng === undefined) {
                pickupLat = defaultLatLng[0];
                pickupLng = defaultLatLng[1];
                console.warn("Pickup coordinates not available, using default coordinates.");
            }

            const newMap = L.map('map').setView([pickupLat, pickupLng], 13);

            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '© OpenStreetMap contributors',
            }).addTo(newMap);

            L.marker([pickupLat, pickupLng])
                .addTo(newMap)
                .bindPopup(isArabic ? 'موقع الالتقاط' : 'Pickup Location') // Keep generic popup
                .openPopup();

            setMap(newMap); // Update the map state
        } catch (error) {
            console.error("Error initializing map:", error);
            const mapContainer = document.getElementById('map');
            if (mapContainer) mapContainer.innerHTML = 'Map failed to load.';
        }
    }, [trip, isArabic]);

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

    // ✅ Add this block below your map section — anywhere in the main return of the valid trip

    return (
        <div className="container py-5 text-center">
            <div id="map" style={{ height: '400px' }}></div>

            <h3 className="mt-4">{pickupLocation}</h3>

            <div className="container py-3 text-center">
                <button className="btn btn-success" onClick={handleBookTrip}>
                    {isArabic ? 'احجز الرحلة' : 'Book Trip'}
                </button>
            </div>
        </div>
    );


    return (
        <div className={`bg-light ${isArabic ? 'rtl' : 'ltr'}`} dir={isArabic ? 'rtl' : 'ltr'}>
            <div className="container-fluid p-0">
                <NavBar lang={lang} setLang={setLang} />

                <div className="container-fluid py-3">
                    <div className="row">
                        <div className="col-lg-8 mb-4 mb-lg-0">
                            <div className="card shadow-sm h-100">
                                <div className="card-header bg-white">
                                    <h5 className="mb-0">{isArabic ? 'الموقع الدقيق' : 'Precise Location'}</h5>
                                </div>
                                <div className="card-body p-0">
                                    <div id="map" style={{ height: '500px', width: '100%' }}></div>
                                </div>
                            </div>
                        </div>

                        <div className="col-lg-4">
                            <div className="card shadow-sm">
                                <div className="card-body">
                                    <div className="text-center mb-3">
                                        <img
                                            src={trip.carImage || "https://via.placeholder.com/300x200.png?text=No+Image"}
                                            className="img-fluid rounded"
                                            alt={trip.car || (isArabic ? 'سيارة غير محددة' : 'Unnamed Car')}
                                            style={{ maxWidth: '100%', maxHeight: '200px', objectFit: 'cover' }}
                                        />
                                    </div>

                                    <h4 className="card-title">{trip.car || (isArabic ? 'سيارة غير محددة' : 'Unnamed Car')}</h4>

                                    <div className="d-flex justify-content-between mb-2">
                                        <span className="text-muted">{isArabic ? `السائق: ${trip.driver || 'غير محدد'}` : `Driver: ${trip.driver || 'N/A'}`}</span>
                                        <span className="badge bg-success">{trip.rating || 'N/A'}</span>
                                    </div>

                                    <hr />

                                    <div className="mb-3">
                                        <p className="mb-1"><i className={`fas fa-map-marker-alt ${isArabic ? 'ms-2' : 'me-2'}`}></i>{isArabic ? ` موقع الالتقاط: ${pickupLocation || 'غير محدد'}` : ` Pickup Location: ${pickupLocation || 'N/A'}`}</p>
                                        <p className="mb-1"><i className={`fas fa-map-marker-alt ${isArabic ? 'ms-2' : 'me-2'}`}></i>{isArabic ? `  الوجهة: ${trip.to || 'غير محدد'}` : ` Destination: ${trip.to || 'N/A'}`}</p>
                                        <p className="mb-1"><i className={`fas fa-car ${isArabic ? 'ms-2' : 'me-2'}`}></i> {isArabic ? `موديل السيارة: ${trip.car}` : `Model: ${trip.car}`}</p>
                                        <p className="mb-1"><i className={`fas fa-palette ${isArabic ? 'ms-2' : 'me-2'}`}></i> {isArabic ? `اللون: ${trip.color}` : `Color: ${trip.color}`}</p>
                                        <p className="mb-1"><i className={`fas fa-id-card ${isArabic ? 'ms-2' : 'me-2'}`}></i> {isArabic ? `لوحة السيارة: ${trip.license}` : `License Plate: ${trip.license}`}</p>
                                        <p className="mb-1"><i className={`fas fa-clock ${isArabic ? 'ms-2' : 'me-2'}`}></i> {isArabic ? `الوقت المقدر: ${trip.time}` : `Estimated Time: ${trip.time}`}</p>
                                        <p className="mb-1"><i className={`fas fa-road ${isArabic ? 'ms-2' : 'me-2'}`}></i> {isArabic ? `المسافة: ${trip.distance}` : `Distance: ${trip.distance}`}</p>
                                        <p className="mb-0"><i className={`fas fa-money-bill ${isArabic ? 'ms-2' : 'me-2'}`}></i> {isArabic ? `السعر: ${trip.cost}` : `Cost: ${trip.cost}`}</p>
                                    </div>

                                    <div className="d-grid gap-2">
                                        <button
                                            className="btn btn-primary"
                                            onClick={() => window.location.href = '/Payment'}
                                        >
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
            </div >
        </div >
    );
}
export default MapView;