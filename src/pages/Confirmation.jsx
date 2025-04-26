import React, { useState, useEffect } from 'react';
import NavBar from '../components/NavBar';
import 'bootstrap/dist/css/bootstrap.min.css';
import '@fortawesome/fontawesome-free/css/all.min.css';

function Confirmation() {
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

  const handleGoHome = () => {
    window.location.href = '/home';
  };

  const handleDownloadReceipt = () => {
    window.print();
  };

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
                      <div className="row">
                        <div className="col-md-6">
                          <h5 className="mb-3">
                            {isArabic ? 'تفاصيل الرحلة' : 'Trip Details'}
                          </h5>
                          <p className="mb-1"><strong>{isArabic ? 'رقم الحجز:' : 'Booking ID:'}</strong> KD-12345678</p>
                          <p className="mb-1"><strong>{isArabic ? 'التاريخ:' : 'Date:'}</strong> April 12, 2025</p>
                          <p className="mb-1"><strong>{isArabic ? 'الوقت:' : 'Time:'}</strong> 10:30 AM</p>
                          <p className="mb-1"><strong>{isArabic ? 'من:' : 'From:'}</strong> {isArabic ? 'وسط المدينة' : 'Downtown'}</p>
                          <p className="mb-1"><strong>{isArabic ? 'إلى:' : 'To:'}</strong> {isArabic ? 'المطار' : 'Airport'}</p>
                          <p className="mb-1"><strong>{isArabic ? 'عدد الركاب:' : 'Passengers:'}</strong> 2</p>
                          <p className="mb-0"><strong>{isArabic ? 'المبلغ المدفوع:' : 'Amount Paid:'}</strong> $18.00</p>
                        </div>
                        <div className="col-md-6">
                          <h5 className="mb-3">
                            {isArabic ? 'تفاصيل السائق' : 'Driver Details'}
                          </h5>
                          <div className="d-flex align-items-center mb-2">
                            <div className={isArabic ? 'ms-3' : 'me-3'}>
                              <img
                                src="https://via.placeholder.com/60"
                                className="rounded-circle"
                                alt="Driver"
                              />
                            </div>
                            <div>
                              <p className="mb-0"><strong>{isArabic ? 'أحمد' : 'Ahmed'}</strong></p>
                              <p className="mb-0 text-warning">★★★★☆</p>
                            </div>
                          </div>
                          <p className="mb-1"><strong>{isArabic ? 'السيارة:' : 'Car:'}</strong> Toyota Camry (White)</p>
                          <p className="mb-1"><strong>{isArabic ? 'رقم اللوحة:' : 'License Plate:'}</strong> KSA-1234</p>
                          <p className="mb-0"><strong>{isArabic ? 'رقم التواصل:' : 'Contact:'}</strong> +966 50 123 4567</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="d-grid gap-2">
                    <button type="button" className="btn btn-primary" onClick={handleGoHome}>
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