// Confirmation.jsx
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import NavBar from '../Components/NavBar';
import 'bootstrap/dist/css/bootstrap.min.css';
import '@fortawesome/fontawesome-free/css/all.min.css';

function Confirmation() {
  const location = useLocation();
  const navigate = useNavigate();
  const { tripDetails } = location.state || {};

  const [lang, setLang] = useState(navigator.language.startsWith('ar') ? 'ar' : 'en');

  useEffect(() => {
    const storedLang = localStorage.getItem('lang');
    if (storedLang) {
      setLang(storedLang);
    } else {
      localStorage.setItem('lang', navigator.language.startsWith('ar') ? 'ar' : 'en');
    }
  }, []);

  const isArabic = lang === 'ar';

  useEffect(() => {
      if (!tripDetails) {
          alert(isArabic ? 'تفاصيل الحجز غير متوفرة. الرجاء العودة لصفحة البحث.' : 'Booking details not available. Please return to search.');
          navigate('/home');
      }
  }, [tripDetails, navigate, isArabic]);


  const handleGoHome = () => {
    navigate('/home');
  };

  const handleDownloadReceipt = () => {
    window.print();
  };

  const driverName = tripDetails?.driver
    ? `${tripDetails.driver.firstName || ''} ${tripDetails.driver.lastName || ''}`.trim()
    : (isArabic ? 'غير محدد' : 'Unknown');

  const formattedDate = tripDetails?.date
    ? new Date(tripDetails.date).toLocaleDateString(isArabic ? 'ar-SA' : 'en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
    : (isArabic ? 'غير محدد' : 'N/A');

   const formattedTime = tripDetails?.departureTime
    ? new Date(`1970-01-01T${tripDetails.departureTime}`).toLocaleTimeString(isArabic ? 'ar-SA' : 'en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
    : (isArabic ? 'غير محدد' : 'N/A');

    const dummyBookingId = 'BK-' + (tripDetails?._id || Math.random().toString(36).substr(2, 9)).slice(-8).toUpperCase();


  if (!tripDetails) {
      return (
        <div className="d-flex justify-content-center align-items-center" style={{ height: '80vh' }}>
            <div className="spinner-border" role="status"><span className="visually-hidden">Loading...</span></div>
        </div>
      );
  }

  return (
    <div className="bg-light" dir={isArabic ? 'rtl' : 'ltr'} lang={lang}>
      <div className="container-fluid p-0">
        <NavBar lang={lang} setLang={setLang} />
        <div className="container py-5">
          <div className="row justify-content-center">
            <div className="col-md-8">
              <div className="card shadow-sm">
                <div className="card-body text-center p-5">
                  <div className="mb-4">
                    <i className="fas fa-check-circle text-success fa-5x"></i>
                  </div>
                  <h2 className="mb-3">
                    {isArabic ? 'تم تأكيد الحجز!' : 'Reservation Confirmed!'}
                  </h2>
                  <p className="text-muted mb-4">
                    {isArabic
                      ? 'تم حجز رحلتك بنجاح. سيصل السائق إلى موقع الالتقاء في الوقت المحدد.'
                      : 'Your ride has been successfully booked. The driver will arrive at the pickup location at the scheduled time.'}
                  </p>

                  <div className="card bg-light mb-4 text-start" id="tripDetails">
                    <div className="card-body">
                      <div className="row g-3">
                        <div className="col-md-6">
                          <h5 className="mb-3">
                            {isArabic ? 'تفاصيل الرحلة' : 'Trip Details'}
                          </h5>
                          <p className="mb-1"><strong>{isArabic ? 'رقم الحجز:' : 'Booking ID:'}</strong> {dummyBookingId}</p>
                          <p className="mb-1"><strong>{isArabic ? 'التاريخ:' : 'Date:'}</strong> {formattedDate}</p>
                          <p className="mb-1"><strong>{isArabic ? 'الوقت:' : 'Time:'}</strong> {formattedTime}</p>
                          <p className="mb-1"><strong>{isArabic ? 'من:' : 'From:'}</strong> {tripDetails.from || (isArabic ? 'غير محدد' : 'N/A')}</p>
                          <p className="mb-1"><strong>{isArabic ? 'إلى:' : 'To:'}</strong> {tripDetails.to || (isArabic ? 'غير محدد' : 'N/A')}</p>
                          <p className="mb-0"><strong>{isArabic ? 'التكلفة الإجمالية:' : 'Total Cost:'}</strong> {tripDetails.cost ? `${tripDetails.cost.toFixed(2)} ${isArabic ? 'ر.س' : 'SAR'}` : (isArabic ? 'غير محدد' : 'N/A')}</p>
                        </div>
                        <div className="col-md-6">
                          <h5 className="mb-3">
                            {isArabic ? 'تفاصيل السائق' : 'Driver Details'}
                          </h5>
                          <div className="d-flex align-items-center mb-2">
                            <div className={isArabic ? 'ms-3' : 'me-3'}>
                               {tripDetails.driver?.profileImage && tripDetails.driver?.profileImageType ? (
                                   <img
                                       src={`data:${tripDetails.driver.profileImageType};base64,${Buffer.from(tripDetails.driver.profileImage.data).toString('base64')}`}
                                       className="rounded-circle"
                                       alt="Driver"
                                       style={{ width: '60px', height: '60px', objectFit: 'cover' }}
                                   />
                                ) : (
                                    <img
                                       src="https://via.placeholder.com/60"
                                       className="rounded-circle"
                                       alt="Driver Placeholder"
                                       style={{ width: '60px', height: '60px', objectFit: 'cover' }}
                                    />
                                )}
                            </div>
                            <div>
                              <p className="mb-0"><strong>{driverName}</strong></p>
                              {tripDetails.driver?.averageRating > 0 && (
                                 <p className="mb-0 text-warning">
                                     {'★'.repeat(Math.round(tripDetails.driver.averageRating))}
                                     {'☆'.repeat(5 - Math.round(tripDetails.driver.averageRating))}
                                 </p>
                              )}
                            </div>
                          </div>
                          <p className="mb-1"><strong>{isArabic ? 'السيارة:' : 'Car:'}</strong> {tripDetails.carModel || (isArabic ? 'غير محدد' : 'N/A')} ({tripDetails.carColor || (isArabic ? 'غير محدد' : 'N/A')})</p>
                          <p className="mb-1"><strong>{isArabic ? 'رقم اللوحة:' : 'License Plate:'}</strong> {tripDetails.carLicensePlate || (isArabic ? 'غير محدد' : 'N/A')}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="d-grid gap-2">
                    <button type="button" className="btn btn-primary btn-lg" onClick={handleGoHome}>
                      {isArabic ? 'العودة إلى الصفحة الرئيسية' : 'Back to Home'}
                    </button>
                    <button type="button" className="btn btn-outline-secondary" onClick={handleDownloadReceipt}>
                      <i className="fas fa-download me-1"></i> {isArabic ? 'تحميل الإيصال' : 'Download Receipt'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div >
    </div>
  );
}

export default Confirmation;