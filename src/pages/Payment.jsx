import React, { useState, useEffect } from 'react';
import NavBar from '../Components/NavBar';
import 'bootstrap/dist/css/bootstrap.min.css';

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

function Payment() {
  const [lang, setLang] = useState(getInitialLang);

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

  return (
    <>
      <div className="bg-light" dir={isArabic ? 'rtl' : 'ltr'}>
        <div className="container-fluid p-0">
          <NavBar lang={lang} setLang={setLang} />
          <div className="container py-4">
            <div className="row justify-content-center">
              <div className="col-md-8">
                <div className="card shadow-sm">
                  <div className="card-header bg-white">
                    <h4 className="mb-0">{isArabic ? 'دفع قيمة الرحلة' : 'Ride Payment'}</h4>
                  </div>
                  <div className="card-body">
                    <div className="mb-4">
                      <h5 className="mb-3">{isArabic ? 'ملخص الرحلة' : 'Trip Summary'}</h5>
                      <div className="card bg-light mb-3">
                        <div className="card-body">
                          <div className="row">
                            <div className="col-md-8">
                              <p className="mb-1">
                                <strong>{isArabic ? 'السائق' : 'Driver'}:</strong> Ahmed
                              </p>
                              <p className="mb-1">
                                <i className="fas fa-map-marker-alt me-2"></i>
                                {isArabic ? 'من' : 'From'}: {isArabic ? 'وسط المدينة' : 'Downtown'}
                              </p>
                              <p className="mb-1">
                                <i className="fas fa-map-marker-alt me-2"></i>
                                {isArabic ? 'إلى' : 'To'}: {isArabic ? 'المطار' : 'Airport'}
                              </p>
                              <p className="mb-1">
                                <i className="fas fa-calendar me-2"></i>
                                {isArabic ? 'التاريخ' : 'Date'}: April 12, 2025
                              </p>
                              <p className="mb-0">
                                <i className="fas fa-clock me-2"></i>
                                {isArabic ? 'الوقت' : 'Time'}: 10:30 AM
                              </p>
                            </div>
                            <div className="col-md-4 text-md-end">
                              <p className="mb-1">{isArabic ? 'الأجرة الأساسية' : 'Base Fare'}: $15.00</p>
                              <p className="mb-1">{isArabic ? 'رسوم الخدمة' : 'Service Fee'}: $2.00</p>
                              <p className="mb-1">{isArabic ? 'الضريبة' : 'Tax'}: $1.00</p>
                              <p className="fw-bold mb-0">{isArabic ? 'المجموع' : 'Total'}: $18.00</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mb-4">
                      <h5 className="mb-3">{isArabic ? 'طريقة الدفع' : 'Payment Method'}</h5>
                      <div className="row g-3">
                        <div className="col-md-6">
                          <div className="card border-primary">
                            <div className="card-body">
                              <div className="form-check">
                                <input
                                  className="form-check-input"
                                  type="radio"
                                  name="paymentCard"
                                  id="card1"
                                  defaultChecked
                                />
                                <label className="form-check-label" htmlFor="card1">
                                  <div className="d-flex justify-content-between align-items-center">
                                    <span className="text-primary">VISA</span>
                                    <span className="text-muted">**** 5432</span>
                                  </div>
                                  <small className="text-muted">{isArabic ? 'تنتهي صلاحيتها' : 'Expires'}: 05/26</small>
                                </label>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="col-md-6">
                          <div className="card">
                            <div className="card-body">
                              <div className="form-check">
                                <input
                                  className="form-check-input"
                                  type="radio"
                                  name="paymentCard"
                                  id="card2"
                                />
                                <label className="form-check-label" htmlFor="card2">
                                  <div className="d-flex justify-content-between align-items-center">
                                    <span className="text-primary">MASTERCARD</span>
                                    <span className="text-muted">**** 7890</span>
                                  </div>
                                  <small className="text-muted">{isArabic ? 'تنتهي صلاحيتها' : 'Expires'}: 08/27</small>
                                </label>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="mt-3">
                        <button
                          type="button"
                          className="btn btn-outline-primary btn-sm"
                          data-bs-toggle="modal"
                          data-bs-target="#addCardModal"
                        >
                          <i className="fas fa-plus me-1"></i> {isArabic ? 'إضافة بطاقة جديدة' : 'Add New Card'}
                        </button>
                      </div>
                    </div>

                    <div className="mb-4">
                      <h5 className="mb-3">{isArabic ? 'المبلغ' : 'Amount'}</h5>
                      <div className="card bg-light">
                        <div className="card-body">
                          <div className="d-flex justify-content-between align-items-center">
                            <span className="fs-5">{isArabic ? 'المجموع' : 'Total'}</span>
                            <span className="fs-5 fw-bold">$18.00</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="d-grid gap-2">
                      <button
                        type="button"
                        className="btn btn-primary"
                        onClick={() => (window.location.href = '/confirmation')}
                      >
                        {isArabic ? 'ادفع الآن' : 'Pay Now'}
                      </button>
                      <button
                        type="button"
                        className="btn btn-outline-secondary"
                        onClick={() => (window.location.href = '/home')}
                      >
                        {isArabic ? 'إلغاء' : 'Cancel'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div
        className="modal fade"
        id="addCardModal"
        tabIndex="-1"
        aria-labelledby="addCardModalLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" id="addCardModalLabel">
                {isArabic ? 'إضافة بطاقة جديدة' : 'Add New Card'}
              </h5>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label={isArabic ? 'إغلاق' : 'Close'}
              ></button>
            </div>
            <div className="modal-body">
              <form>
                <div className="mb-3">
                  <label htmlFor="cardNumber" className="form-label">
                    {isArabic ? 'رقم البطاقة' : 'Card Number'}
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="cardNumber"
                    placeholder="1234 5678 9012 3456"
                  />
                </div>
                <div className="row mb-3">
                  <div className="col-md-6">
                    <label htmlFor="expiryDate" className="form-label">
                      {isArabic ? 'تاريخ الانتهاء' : 'Expiry Date'}
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="expiryDate"
                      placeholder="MM/YY"
                    />
                  </div>
                  <div className="col-md-6">
                    <label htmlFor="cvv" className="form-label">
                      {isArabic ? 'CVV' : 'CVV'}
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="cvv"
                      placeholder="123"
                    />
                  </div>
                </div>
                <div className="mb-3">
                  <label htmlFor="cardholderName" className="form-label">
                    {isArabic ? 'اسم حامل البطاقة' : 'Cardholder Name'}
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="cardholderName"
                    placeholder="John Doe"
                  />
                </div>
              </form>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                data-bs-dismiss="modal"
              >
                {isArabic ? 'إلغاء' : 'Cancel'}
              </button>
              <button
                type="button"
                className="btn btn-primary"
                data-bs-dismiss="modal"
              >
                {isArabic ? 'إضافة بطاقة' : 'Add Card'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Payment;