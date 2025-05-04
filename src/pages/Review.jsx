// pages/Review.jsx
import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom'; // Added Link, useNavigate
import NavBar from '../Components/NavBar'; // Assuming NavBar exists
import 'bootstrap/dist/css/bootstrap.min.css';
import '@fortawesome/fontawesome-free/css/all.min.css'; // Ensure Font Awesome is imported

// Assume getInitialLang exists or define it
const getInitialLang = () => localStorage.getItem('lang') || (navigator.language.startsWith('ar') ? 'ar' : 'en');

export default function Review() {
    const { tripId } = useParams();
    const navigate = useNavigate();
    const [lang, setLang] = useState(getInitialLang()); // Add lang state if needed for NavBar
    const isArabic = lang === 'ar';

    const [trip, setTrip] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [rating, setRating] = useState(0); // User's selected rating
    const [submitted, setSubmitted] = useState(false); // Track submission status
    const [submitLoading, setSubmitLoading] = useState(false); // Loading state for submit button

    const userId = JSON.parse(localStorage.getItem('profileData') || '{}')?._id; // Get current user ID

    useEffect(() => {
        const fetchTrip = async () => {
            setLoading(true);
            setError('');
            try {
                const token = localStorage.getItem('token'); // Need token to potentially check passenger status later if API requires
                const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
                const res = await fetch(`http://localhost:8000/api/trips/${tripId}`, { headers });

                if (!res.ok) {
                    const errorData = await res.json().catch(() => ({ message: `HTTP error! status: ${res.status}` }));
                    throw new Error(errorData.message || `HTTP error! status: ${res.status}`);
                }

                const json = await res.json();
                if (json.success && json.data) {
                    setTrip(json.data);
                    // Basic checks after fetching trip data
                    if (json.data.status !== 'completed') {
                        setError(isArabic ? 'لا يمكنك مراجعة رحلة لم تكتمل بعد.' : 'You cannot review a trip that is not completed.');
                    }
                    // Check if current user was a passenger (important!)
                    const isPassenger = json.data.passengers?.some(p => p.user === userId || p.user?._id === userId);
                     if (!isPassenger && json.data.driver?._id !== userId) { // Allow driver viewing but not rating? Or deny non-passengers?
                        setError(isArabic ? 'أنت لست راكبًا في هذه الرحلة.' : 'You were not a passenger on this trip.');
                    }
                     if (json.data.driver?._id === userId) {
                        setError(isArabic ? 'لا يمكنك مراجعة رحلتك الخاصة.' : 'You cannot review your own trip.');
                    }


                } else {
                    throw new Error(json.message || (isArabic ? 'لم يتم العثور على الرحلة' : 'Trip not found'));
                }
            } catch (error) {
                console.error('Error fetching trip:', error);
                setError(error.message || (isArabic ? 'فشل تحميل بيانات الرحلة.' : 'Failed to load trip data.'));
            } finally {
                setLoading(false);
            }
        };
        if (tripId) {
            fetchTrip();
        }
    }, [tripId, userId, isArabic]); // Add userId dependency

    const handleSubmitReview = async () => {
        if (!rating) {
            setError(isArabic ? 'الرجاء تحديد تقييم أولاً.' : 'Please select a rating first.');
            return;
        }
        if (!trip?.driver?._id) {
             setError(isArabic ? 'معرف السائق مفقود.' : 'Driver ID is missing.');
             return;
        }

        const token = localStorage.getItem('token');
        if (!token) {
            setError(isArabic ? 'يجب تسجيل الدخول لتقديم مراجعة.' : 'You must be logged in to submit a review.');
            return;
        }

        setSubmitLoading(true);
        setError(''); // Clear previous errors

        try {
            const driverId = trip.driver._id;
            const res = await fetch(`http://localhost:8000/api/users/${driverId}/submit-review`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ rating }) // Send rating in the body
            });

            const json = await res.json();

            if (res.ok && json.success) {
                setSubmitted(true); // Mark as submitted
                setError(''); // Clear error on success
                // Optional: navigate away or show success message permanently
                 alert(isArabic ? 'تم إرسال المراجعة بنجاح!' : 'Review submitted successfully!');
                 // navigate('/my-trips'); // Example navigation
            } else {
                // Handle specific backend errors (e.g., already reviewed)
                throw new Error(json.message || (isArabic ? 'فشل إرسال المراجعة.' : 'Failed to submit review.'));
            }
        } catch (err) {
            console.error('Review submission failed:', err);
            setError(err.message || (isArabic ? 'خطأ في الخادم أثناء إرسال المراجعة.' : 'Server error during review submission.'));
            setSubmitted(false); // Allow retry on error
        } finally {
            setSubmitLoading(false);
        }
    };

    // --- Render Logic ---

    if (loading) return <div className="text-center mt-5"><div className="spinner-border text-primary" role="status"><span className="visually-hidden">Loading...</span></div></div>;

    // Display error if fetch failed or initial checks failed
    if (error && !trip) return <div className="container py-5"><NavBar lang={lang} setLang={setLang} /><div className="alert alert-danger text-center mt-4" role="alert">{error}</div><div className="text-center mt-3"><Link to="/home" className="btn btn-primary">{isArabic ? 'العودة للرئيسية' : 'Back to Home'}</Link></div></div>;

    // Guard if trip loaded but other errors occurred (like not completed, not passenger)
    if (!trip) return null; // Should have been caught by error state above, but safe check

    const driverName = trip.driver ? `${trip.driver.firstName || ''} ${trip.driver.lastName || ''}`.trim() : (isArabic ? 'غير معروف' : 'Unknown');
    const allowReview = trip.status === 'completed' && !submitted && trip.driver?._id !== userId && (trip.passengers?.some(p => p.user === userId || p.user?._id === userId));


    return (
        <div className={`bg-light ${isArabic ? 'rtl' : 'ltr'}`} dir={isArabic ? 'rtl' : 'ltr'}>
             <NavBar lang={lang} setLang={setLang} /> {/* Add NavBar */}
             <div className="container py-5">
                <h2 className="mb-4 text-center">{isArabic ? 'مراجعة رحلتك' : 'Review Your Trip'}</h2>

                 {/* Display Trip Summary Card */}
                 <div className="card mb-4 shadow-sm">
                    <div className="card-header">{isArabic ? 'ملخص الرحلة' : 'Trip Summary'}</div>
                    <div className="card-body">
                        <p><strong>{isArabic ? 'من:' : 'From:'}</strong> {trip.from}</p>
                        <p><strong>{isArabic ? 'إلى:' : 'To:'}</strong> {trip.to}</p>
                        <p><strong>{isArabic ? 'التاريخ:' : 'Date:'}</strong> {new Date(trip.date).toLocaleDateString(isArabic ? 'ar-SA' : 'en-US')}</p>
                        <p><strong>{isArabic ? 'السائق:' : 'Driver:'}</strong> {driverName}</p>
                        {/* Add more details if needed */}
                    </div>
                 </div>

                 {/* Review Form Area */}
                 {allowReview ? (
                     <div className="card shadow-sm">
                        <div className="card-body text-center">
                            <h5 className="mb-3">{isArabic ? `كيف كانت رحلتك مع ${driverName}؟` : `How was your trip with ${driverName}?`}</h5>
                            <div className="mb-4">
                                {[1, 2, 3, 4, 5].map(num => (
                                    <i
                                        key={num}
                                        className={`fa-star fa-2x mx-1 ${rating >= num ? 'fas text-warning' : 'far text-secondary'}`}
                                        style={{ cursor: 'pointer' }}
                                        onClick={() => !submitLoading && setRating(num)} // Disable click during submit
                                        title={`${num} ${isArabic ? 'نجمة' : 'Star'}${num > 1 ? 's' : ''}`}
                                    />
                                ))}
                            </div>

                            {/* Display Error Message within the form card */}
                            {error && !submitted && <div className="alert alert-danger mt-3" role="alert">{error}</div>}

                            <button
                                className="btn btn-primary btn-lg mt-3"
                                onClick={handleSubmitReview}
                                disabled={submitLoading || rating === 0} // Disable if loading or no rating selected
                            >
                                {submitLoading ? (
                                    <>
                                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                        {isArabic ? 'جاري الإرسال...' : 'Submitting...'}
                                    </>
                                ) : (
                                    isArabic ? 'إرسال المراجعة' : 'Submit Review'
                                )}
                            </button>
                        </div>
                     </div>
                 ) : submitted ? (
                     <div className="alert alert-success text-center" role="alert">
                        <i className="fas fa-check-circle me-2"></i>{isArabic ? 'شكراً لك، تم استلام مراجعتك!' : 'Thank you, your review has been submitted!'}
                     </div>
                 ) : (
                     // Show reason why review is not allowed (based on error state set earlier)
                     <div className="alert alert-warning text-center" role="alert">
                        {error || (isArabic ? 'لا يمكن تقديم مراجعة لهذه الرحلة.' : 'Review is not available for this trip.')}
                     </div>
                 )}

                <div className="text-center mt-4">
                    <Link to="/home" className="btn btn-outline-secondary">
                        {isArabic ? 'العودة للبحث' : 'Back to Search'}
                    </Link>
                </div>
             </div>
         </div>
    );
}