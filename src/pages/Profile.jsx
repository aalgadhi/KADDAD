import React, { useState, useEffect } from 'react';
import NavBar from '../components/NavBar';
import 'bootstrap/dist/css/bootstrap.min.css';
// import '@fortawesome/fontawesome-free/css/all.min.css';

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

function Profile() {
  const [lang, setLang] = useState(getInitialLang); // Initialize synchronously
  const isArabic = lang === 'ar';

  const [isEditMode, setIsEditMode] = useState(false);
  const [firstName, setFirstName] = useState('Yousef');
  const [lastName, setLastName] = useState('Floss');
  const [username, setUsername] = useState('Brq');
  const [email, setEmail] = useState('9aro5@gmail.com');
  const [phone, setPhone] = useState('+966505011222');
  const [address, setAddress] = useState('Al-hizam KFUPM, Dhahran, Saudi Arabia');
  const [profilePic, setProfilePic] = useState('');
  const [paymentMethods, setPaymentMethods] = useState([
    { id: 1, type: 'Visa', last4: '5432', expires: '05/26', isDefault: true },
    { id: 2, type: 'Mastercard', last4: '7890', expires: '08/27', isDefault: false }
  ]);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [newPayType, setNewPayType] = useState('');
  const [newPayLast4, setNewPayLast4] = useState('');
  const [newPayExpires, setNewPayExpires] = useState('');
  const [paymentModalErrors, setPaymentModalErrors] = useState({ type: '', last4: '', expires: '' });

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

  // Effect to load profile/payment data (runs only once on mount)
  useEffect(() => {
    const data = JSON.parse(localStorage.getItem('profileData'));
    if (data) {
      setFirstName(data.firstName || 'Yousef');
      setLastName(data.lastName || 'Floss');
      setUsername(data.username || 'Brq');
      setEmail(data.email || '9aro5@gmail.com');
      setPhone(data.phone || '+966505011222');
      setAddress(data.address || 'Al-hizam KFUPM, Dhahran, Saudi Arabia');
      setProfilePic(data.profilePic || '');
    }
    const storedPayments = JSON.parse(localStorage.getItem('paymentMethods'));
    if (storedPayments) {
        setPaymentMethods(storedPayments);
    }
  }, []);

  const saveData = () => {
    const profileData = {
        firstName, lastName, username, email, phone, address, profilePic
    };
    localStorage.setItem('profileData', JSON.stringify(profileData));
    localStorage.setItem('paymentMethods', JSON.stringify(paymentMethods));
  };

  const handleEdit = () => setIsEditMode(true);

  const handleSave = () => {
    setIsEditMode(false);
    saveData();
  };

  const handleCancel = () => {
    setIsEditMode(false);
    const data = JSON.parse(localStorage.getItem('profileData'));
     if (data) {
       setFirstName(data.firstName || 'Yousef');
       setLastName(data.lastName || 'Floss');
       setUsername(data.username || 'Brq');
       setEmail(data.email || '9aro5@gmail.com');
       setPhone(data.phone || '+966505011222');
       setAddress(data.address || 'Al-hizam KFUPM, Dhahran, Saudi Arabia');
       setProfilePic(data.profilePic || '');
     }
  };

  const openPaymentModal = () => {
    setNewPayType('');
    setNewPayLast4('');
    setNewPayExpires('');
    setPaymentModalErrors({ type: '', last4: '', expires: '' });
    setShowPaymentModal(true);
  };

  const closePaymentModal = () => {
    setShowPaymentModal(false);
    setPaymentModalErrors({ type: '', last4: '', expires: '' });
  };

  const handleAddPayment = () => {
    let errors = { type: '', last4: '', expires: '' };
    let isValid = true;
    const t = newPayType.trim();
    const l4 = newPayLast4.trim();
    const exp = newPayExpires.trim();

    if (!t) {
        errors.type = isArabic ? 'حقل النوع مطلوب.' : 'Type field is required.'; isValid = false;
    }
    if (!l4 || !/^\d{4}$/.test(l4)) {
        errors.last4 = isArabic ? 'يرجى إدخال آخر 4 أرقام بشكل صحيح.' : 'Please enter the last 4 digits correctly.'; isValid = false;
    }
    const validExp = /^(0[1-9]|1[0-2])\/\d{2}$/.test(exp);
    if (!exp || !validExp) {
        errors.expires = isArabic ? 'يرجى إدخال تاريخ انتهاء صلاحية صالح (MM/YY).' : 'Please enter a valid expiry date (MM/YY).'; isValid = false;
    }
    setPaymentModalErrors(errors);
    if (!isValid) return;

    const newMethod = { id: Date.now(), type: t, last4: l4, expires: exp, isDefault: paymentMethods.length === 0 };
    const updatedPayments = [...paymentMethods, newMethod];
    setPaymentMethods(updatedPayments);
    localStorage.setItem('paymentMethods', JSON.stringify(updatedPayments));
    closePaymentModal();
  };

  const handleDeletePayment = (idToDelete) => {
    const updated = paymentMethods.filter(pm => pm.id !== idToDelete);
    const deletedCard = paymentMethods.find(pm => pm.id === idToDelete);
    if (deletedCard?.isDefault && updated.length > 0) {
        updated[0].isDefault = true;
    }
    setPaymentMethods(updated);
    localStorage.setItem('paymentMethods', JSON.stringify(updated));
  };

  const handleSetDefault = (idToSetDefault) => {
    const updated = paymentMethods.map(pm => ({ ...pm, isDefault: pm.id === idToSetDefault }));
    setPaymentMethods(updated);
    localStorage.setItem('paymentMethods', JSON.stringify(updated));
  };

  const handlePhoneChange = (e) => {
    const val = e.target.value;
    if (/^[\+\d\s]*$/.test(val)) setPhone(val);
  };

  const handleEmailChange = (e) => setEmail(e.target.value);

  const handleExpireChange = (e) => {
    let val = e.target.value;
    val = val.replace(/[^0-9\/]/g, '');
    if (val.length === 2 && newPayExpires.length === 1 && !val.includes('/')) val += '/';
    else if (val.length === 3 && val.charAt(2) !== '/' && newPayExpires.length === 2) val = val.substring(0, 2) + '/' + val.substring(2);
    if (val.length > 5) val = val.substring(0, 5);
    setNewPayExpires(val);
    if (paymentModalErrors.expires) setPaymentModalErrors(prev => ({ ...prev, expires: '' }));
  };

  const handleLast4Change = (e) => {
    const val = e.target.value;
    if (/^\d*$/.test(val) && val.length <= 4) {
      setNewPayLast4(val);
      if (paymentModalErrors.last4) setPaymentModalErrors(prev => ({ ...prev, last4: '' }));
    }
  }

  const handleProfilePicChange = (e) => setProfilePic(e.target.value);

  return (
    <div className={`bg-light ${isArabic ? 'rtl' : 'ltr'}`} dir={isArabic ? 'rtl' : 'ltr'}>
      <NavBar lang={lang} setLang={setLang} />

      <div className="container py-4">
        <div className="row">
          <div className="col-lg-4 mb-4">
            <div className="card shadow-sm">
              <div className="card-body text-center">
                <div className="mb-3 position-relative">
                  <img
                    src={profilePic || `https://via.placeholder.com/150?text=${firstName?.[0] || '?'}`}
                    className="rounded-circle img-thumbnail"
                    alt={isArabic ? 'الصورة الشخصية' : 'Profile'}
                    style={{ width: '150px', height: '150px', objectFit: 'cover' }}
                    onError={(e) => { e.target.onerror = null; e.target.src=`https://via.placeholder.com/150?text=${firstName?.[0] || '?'}` }}
                  />
                   {isEditMode && (
                      <label htmlFor="profilePicInput" className="position-absolute bottom-0 end-0 btn btn-sm btn-light rounded-circle" style={{ transform: 'translate(25%, 25%)', cursor: 'pointer' }}>
                      </label>
                    )}
                </div>
                <h4 className="mb-1">{firstName} {lastName}</h4>
                <p className="text-muted mb-3">@{username}</p>
                <div className="d-grid">
                  {!isEditMode && (
                    <button className="btn btn-outline-primary" onClick={handleEdit}>
                      <i className={`fas fa-edit ${isArabic ? 'ms-1' : 'me-1'}`}></i> {isArabic ? 'تعديل الملف الشخصي' : 'Edit Profile'}
                    </button>
                  )}
                  {isEditMode && (
                    <div className="d-flex gap-2 flex-wrap justify-content-center">
                      <button className="btn btn-primary" onClick={handleSave}>{isArabic ? 'حفظ التغييرات' : 'Save Changes'}</button>
                      <button className="btn btn-outline-secondary" onClick={handleCancel}>{isArabic ? 'إلغاء' : 'Cancel'}</button>
                    </div>
                  )}
                </div>
              </div>
              <div className="card-footer bg-white">
                <div className="row text-center">
                  <div className="col-4"><h5>12</h5><small className="text-muted">{isArabic ? 'رحلات' : 'Rides'}</small></div>
                  <div className="col-4"><h5>4.8</h5><small className="text-muted">{isArabic ? 'تقييم' : 'Rating'}</small></div>
                  <div className="col-4"><h5>$250</h5><small className="text-muted">{isArabic ? 'منصرف' : 'Spent'}</small></div>
                </div>
              </div>
            </div>
          </div>

          <div className="col-lg-8">
            <div className="card shadow-sm mb-4">
              <div className="card-header bg-white"><h5 className="mb-0">{isArabic ? 'تفاصيل الحساب' : 'Account Details'}</h5></div>
              <div className="card-body">
                <form onSubmit={(e) => e.preventDefault()}>
                  <div className="row mb-3">
                    <div className="col-md-6">
                      <label className="form-label">{isArabic ? 'الاسم الأول' : 'First Name'}</label>
                      <input type="text" className="form-control" disabled={!isEditMode} value={firstName} onChange={e => setFirstName(e.target.value)} />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">{isArabic ? 'الاسم الأخير' : 'Last Name'}</label>
                      <input type="text" className="form-control" disabled={!isEditMode} value={lastName} onChange={e => setLastName(e.target.value)} />
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">{isArabic ? 'اسم المستخدم' : 'Username'}</label>
                    <input type="text" className="form-control" disabled={!isEditMode} value={username} onChange={e => setUsername(e.target.value)} />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">{isArabic ? 'البريد الإلكتروني' : 'Email'}</label>
                    <input type="email" className="form-control" disabled={!isEditMode} value={email} onChange={handleEmailChange} />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">{isArabic ? 'الهاتف' : 'Phone'}</label>
                    <input type="tel" className="form-control" disabled={!isEditMode} value={phone} onChange={handlePhoneChange} />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">{isArabic ? 'العنوان' : 'Address'}</label>
                    <textarea className="form-control" rows="2" disabled={!isEditMode} value={address} onChange={e => setAddress(e.target.value)}></textarea>
                  </div>
                  {isEditMode && (
                    <div className="mb-3">
                      <label className="form-label">{isArabic ? 'رابط الصورة الشخصية (اختياري)' : 'Profile Image URL (optional)'}</label>
                      <input type="url" className="form-control" placeholder={isArabic ? 'https://example.com/image.jpg' : 'https://your-image-link.jpg'} value={profilePic} onChange={handleProfilePicChange} />
                       {profilePic && <img src={profilePic} alt="Preview" style={{width: '50px', height: '50px', objectFit: 'cover', marginTop: '10px'}} onError={(e) => { e.target.style.display='none'; }} onLoad={(e) => { e.target.style.display='inline-block'; }}/>}
                    </div>
                  )}
                </form>
              </div>
            </div>

            <div className="card shadow-sm mb-4">
              <div className="card-header bg-white d-flex justify-content-between align-items-center">
                <h5 className="mb-0">{isArabic ? 'طرق الدفع' : 'Payment Methods'}</h5>
                <button className="btn btn-sm btn-outline-primary" onClick={openPaymentModal}><i className={`fas fa-plus ${isArabic ? 'ms-1' : 'me-1'}`}></i> {isArabic ? 'إضافة جديد' : 'Add New'}</button>
              </div>
              <div className="card-body">
                {paymentMethods.length === 0 && (<p className="text-muted">{isArabic ? 'لا توجد طرق دفع محفوظة.' : 'No saved payment methods.'}</p>)}
                {paymentMethods.map((pm) => (
                  <div key={pm.id} className="d-flex justify-content-between align-items-center mb-3 p-2 border rounded flex-wrap">
                    <div className={`d-flex align-items-center ${isArabic ? 'ms-md-0' : 'me-md-3'} mb-2 mb-md-0`}>
                      <i className={`fab fa-cc-${pm.type.toLowerCase().includes('visa')?'visa': pm.type.toLowerCase().includes('master') || pm.type.toLowerCase().includes('ماستر')?'mastercard': pm.type.toLowerCase().includes('paypal') || pm.type.toLowerCase().includes('باي')?'paypal':'credit-card'} fa-2x text-primary ${isArabic ? 'ms-3' : 'me-3'}`}></i>
                      <div>
                        <p className="mb-0 fw-bold">{pm.type} {isArabic ? 'ينتهي بـ' : 'ending in'} {pm.last4}</p>
                        <p className="mb-0 small text-muted">{isArabic ? 'تنتهي الصلاحية' : 'Expires'} {pm.expires}</p>
                      </div>
                    </div>
                    <div className="d-flex align-items-center flex-shrink-0">
                      {pm.isDefault && <span className={`badge bg-success ${isArabic ? 'ms-2' : 'me-2'}`}>{isArabic ? 'افتراضي' : 'Default'}</span>}
                      {!pm.isDefault && (<button className={`btn btn-sm btn-outline-secondary ${isArabic ? 'ms-2' : 'me-2'}`} onClick={() => handleSetDefault(pm.id)}>{isArabic ? 'تعيين كافتراضي' : 'Set Default'}</button>)}
                      <button className="btn btn-sm btn-outline-danger" onClick={() => handleDeletePayment(pm.id)}><i className="fas fa-trash"></i></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="card shadow-sm">
              <div className="card-header bg-white"><h5 className="mb-0">{isArabic ? 'الرحلات الأخيرة' : 'Recent Rides'}</h5></div>
              <div className="card-body">
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead><tr><th>{isArabic ? 'التاريخ' : 'Date'}</th><th>{isArabic ? 'من' : 'From'}</th><th>{isArabic ? 'إلى' : 'To'}</th><th>{isArabic ? 'المبلغ' : 'Amount'}</th><th>{isArabic ? 'الحالة' : 'Status'}</th></tr></thead>
                    <tbody>
                      <tr><td>{isArabic ? '١٠ أبريل ٢٠٢٥' : 'Apr 10, 2025'}</td><td>{isArabic ? 'وسط المدينة' : 'Downtown'}</td><td>{isArabic ? 'المطار' : 'Airport'}</td><td>$18.00</td><td><span className="badge bg-success">{isArabic ? 'مكتملة' : 'Completed'}</span></td></tr>
                      <tr><td>{isArabic ? '٥ أبريل ٢٠٢٥' : 'Apr 5, 2025'}</td><td>{isArabic ? 'المول' : 'Mall'}</td><td>{isArabic ? 'الجامعة' : 'University'}</td><td>$12.50</td><td><span className="badge bg-success">{isArabic ? 'مكتملة' : 'Completed'}</span></td></tr>
                      <tr><td>{isArabic ? '٢٨ مارس ٢٠٢٥' : 'Mar 28, 2025'}</td><td>{isArabic ? 'المستشفى' : 'Hospital'}</td><td>{isArabic ? 'المنزل' : 'Home'}</td><td>$15.75</td><td><span className="badge bg-success">{isArabic ? 'مكتملة' : 'Completed'}</span></td></tr>
                    </tbody>
                  </table>
                </div>
                {/*
                                // <div className="text-center mt-2"><a href="/my-rides" className="text-decoration-none">{isArabic ? 'عرض كل رحلاتي' : 'View My Rides'}</a></div>

                */}
              </div>
            </div>
          </div>
        </div>
      </div>

      {showPaymentModal && (
        <>
          <div className="modal-backdrop fade show"></div>
          <div className="modal fade show" style={{ display: 'block' }} tabIndex="-1" role="dialog" aria-labelledby="paymentModalLabel" aria-modal="true">
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title" id="paymentModalLabel">{isArabic ? 'إضافة طريقة دفع جديدة' : 'Add New Payment Method'}</h5>
                  <button type="button" className="btn-close" onClick={closePaymentModal} aria-label={isArabic ? 'إغلاق' : 'Close'}></button>
                </div>
                <div className="modal-body">
                  <div className="mb-3">
                    <label htmlFor="payTypeInput" className="form-label">{isArabic ? 'النوع (مثال: فيزا)' : 'Type (e.g., Visa)'}</label>
                    <input type="text" id="payTypeInput" className={`form-control ${paymentModalErrors.type ? 'is-invalid' : ''}`} value={newPayType} onChange={e => {setNewPayType(e.target.value);if (paymentModalErrors.type) setPaymentModalErrors(prev => ({ ...prev, type: '' }));}} required />
                    {paymentModalErrors.type && <div className="invalid-feedback">{paymentModalErrors.type}</div>}
                  </div>
                  <div className="mb-3">
                    <label htmlFor="payLast4Input" className="form-label">{isArabic ? 'آخر 4 أرقام' : 'Last 4 Digits'}</label>
                    <input type="text" id="payLast4Input" className={`form-control ${paymentModalErrors.last4 ? 'is-invalid' : ''}`} maxLength={4} value={newPayLast4} onChange={handleLast4Change} required inputMode="numeric" pattern="\d{4}" />
                     {paymentModalErrors.last4 && <div className="invalid-feedback">{paymentModalErrors.last4}</div>}
                  </div>
                  <div className="mb-3">
                    <label htmlFor="payExpiresInput" className="form-label">{isArabic ? 'تاريخ الانتهاء (MM/YY)' : 'Expires (MM/YY)'}</label>
                    <input type="text" id="payExpiresInput" className={`form-control ${paymentModalErrors.expires ? 'is-invalid' : ''}`} placeholder="MM/YY" value={newPayExpires} onChange={handleExpireChange} required maxLength={5} />
                    {paymentModalErrors.expires && <div className="invalid-feedback">{paymentModalErrors.expires}</div>}
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={closePaymentModal}>{isArabic ? 'إلغاء' : 'Cancel'}</button>
                  <button type="button" className="btn btn-primary" onClick={handleAddPayment}>{isArabic ? 'إضافة' : 'Add'}</button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default Profile;