import React, { useState, useEffect } from 'react';
import NavBar from './NavBar';
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

function Home() {
  const defaultRides = [
    {
      car: 'Camry 2025',
      rating: '★★★★★',
      from: 'KFUPM',
      to: 'Al-Hasa',
      time: '50 mins',
      cost: '$99', // Consider localizing currency/format
      driver: 'Reda',
    },
    {
      car: 'Nissan Altima',
      rating: '★★★★☆',
      from: 'Riyadh',
      to: 'KFUPM',
      time: '3 Hours',
      cost: '$30',
      driver: 'Mohammed',
    },
    {
      car: 'Hyundai Sonata',
      rating: '★★★☆☆',
      from: 'KSU',
      to: 'Jazan',
      time: '6 Hours',
      cost: '$33',
      driver: 'Ali',
    },
    {
      car: 'Kia Optima',
      rating: '★★★★☆',
      from: 'KFU',
      to: 'Hail',
      time: '6 Hours',
      cost: '$16.00',
      driver: 'Khalid',
    },
  ];

  const [lang, setLang] = useState(getInitialLang); // Initialize synchronously
  const isArabic = lang === 'ar';

  const [searchTerm, setSearchTerm] = useState('');
  const [allRides, setAllRides] = useState([]); // Start empty, populate in effect
  const [filteredRides, setFilteredRides] = useState([]); // Start empty

  // Effect to sync HTML attributes and localStorage when lang changes
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

  useEffect(() => {
    let combined = [];
    try {
      const localDriverTrips = JSON.parse(localStorage.getItem('driverTrips')) || [];
      // Add unique IDs if they don't have them for better key prop usage
      const defaultWithIds = defaultRides.map((ride, index) => ({ ...ride, id: `default-${index}` }));
      const localWithIds = localDriverTrips.map((ride, index) => ({ ...ride, id: ride.id || `local-${Date.now()}-${index}` })); // Ensure local rides have IDs
      combined = [...defaultWithIds, ...localWithIds];
    } catch (e) {
      console.error("Error loading rides from localStorage:", e);
      combined = defaultRides.map((ride, index) => ({ ...ride, id: `default-${index}` })); // Fallback to defaults
    }
    setAllRides(combined);
    setFilteredRides(combined); // Initialize filtered rides
  }, []); 

  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredRides(allRides); // Show all if search is empty
      return;
    }
    const term = searchTerm.toLowerCase();
    const results = allRides.filter((ride) =>
      (ride.from?.toLowerCase() || '').includes(term) || // Add safe navigation
      (ride.to?.toLowerCase() || '').includes(term) ||
      (ride.car?.toLowerCase() || '').includes(term) ||
      (ride.driver?.toLowerCase() || '').includes(term) // Optional: Search by driver
    );
    setFilteredRides(results);
  }, [searchTerm, allRides]); 
  return (
    <div className={`bg-light ${isArabic ? 'rtl' : 'ltr'}`} dir={isArabic ? 'rtl' : 'ltr'}>
      <div className="container-fluid p-0">

      <NavBar lang={lang} setLang={setLang} />

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
                    onChange={(e) => setSearchTerm(e.target.value)}
                    aria-label={isArabic ? 'بحث الرحلات' : 'Search rides'}
                  />
                  <button
                    className="btn btn-success ms-2" 
                    type="button"
                    onClick={() => (window.location.href = '/trip-form')}
                  >
                    {isArabic ? 'أنشئ رحلة' : 'Create Trip'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="container py-4">
          <h2 className={`mb-4 ${isArabic ? 'text-end' : 'text-start'}`}>
            {isArabic ? 'الرحلات المتاحة' : 'Available Rides'}
          </h2>
          <div className="row g-4">
            {filteredRides.length > 0 ? (
              filteredRides.map((ride) => (
                // Use a unique ride ID for the key if available, otherwise fallback to index
                <div key={ride.id || ride.car + ride.from + ride.to} className="col-md-6 col-lg-4 d-flex">
                  <div className="card h-100 shadow-sm w-100"> {/* Ensure card takes full height */}
                    <div className="card-body d-flex flex-column"> {/* Flex column for button positioning */}
                      <div className={`d-flex justify-content-between align-items-center mb-2 ${isArabic ? 'flex-row-reverse' : ''}`}>
                        <h5 className="card-title mb-0">{ride.car || (isArabic ? 'سيارة غير محددة' : 'Unnamed Car')}</h5>
                        <span className="badge bg-success">{ride.rating || 'N/A'}</span>
                      </div>
                      <div className="flex-grow-1"> {/* Make text section grow */}
                          <p className="card-text text-muted small mb-1">
                              <i className={`fas fa-map-marker-alt ${isArabic ? 'ms-1' : 'me-1'}`}></i> {isArabic ? `من: ${ride.from || 'غير محدد'}` : `From: ${ride.from || 'N/A'}`}
                          </p>
                          <p className="card-text text-muted small mb-1">
                              <i className={`fas fa-map-marker-alt ${isArabic ? 'ms-1' : 'me-1'}`}></i> {isArabic ? `إلى: ${ride.to || 'غير محدد'}` : `To: ${ride.to || 'N/A'}`}
                          </p>
                          <p className="card-text text-muted small mb-1">
                              <i className={`fas fa-clock ${isArabic ? 'ms-1' : 'me-1'}`}></i> {isArabic ? `الوقت: ${ride.time || 'غير محدد'}` : `Time: ${ride.time || 'N/A'}`}
                          </p>
                          <p className="card-text text-muted small mb-1 fw-bold">
                              {isArabic ? `التكلفة: ${ride.cost || 'غير محدد'}` : `Cost: ${ride.cost || 'N/A'}`}
                          </p>
                          {ride.driver && (
                            <p className="card-text text-muted small mb-1">
                                <i className={`fas fa-user ${isArabic ? 'ms-1' : 'me-1'}`}></i> {isArabic ? `السائق: ${ride.driver}` : `Driver: ${ride.driver}`}
                            </p>
                          )}
                      </div>
                      <div className={`mt-auto pt-2 text-${isArabic ? 'start' : 'end'}`}> {/* Push button to bottom */}
                          <a href="/map" className="btn btn-outline-primary btn-sm">
                              {isArabic ? 'عرض التفاصيل' : 'Show Details'}
                          </a>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-12 text-center mt-4">
                <p>{isArabic ? 'لا توجد رحلات مطابقة للبحث أو متاحة حاليًا.' : 'No matching rides found or none available currently.'}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;