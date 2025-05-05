import React, { useState, useEffect } from 'react';
import axios from 'axios';
import useAuth from './useAuth';

const API_BASE_URL = 'https://kaddad-backend.onrender.com';

function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [userTrips, setUserTrips] = useState({});
  const [loadingTrips, setLoadingTrips] = useState({});
  const [error, setError] = useState('');
  const { isAuthenticated, isAdmin } = useAuth();

  useEffect(() => {
    if (isAuthenticated && isAdmin) {
      fetchUsers();
    } else if (isAuthenticated && !isAdmin) {
        setError('Forbidden: Admin access required.');
    } else {
        setError('Please log in to view this page.');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, isAdmin]);

  const getToken = () => {
      const token = localStorage.getItem('token');
      if (!token) {
          setError('Authentication token not found.');
          return null;
      }
      setError('');
      return token;
  }

  const fetchUsers = async () => {
    setError('');
    const token = getToken();
    if (!token) return;

    try {
      const response = await axios.get(`${API_BASE_URL}/api/admin/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(response.data);
    } catch (err) {
        console.error("Error fetching users:", err);
        setError(`Error fetching users: ${err.response?.status || ''} - ${err.response?.data?.message || err.message}`);
    }
  };

  const handleBanUser = async (userId) => {
    setError('');
    const token = getToken();
    if (!token) return;

    try {
      await axios.put(`${API_BASE_URL}/api/admin/users/${userId}/ban`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchUsers();
    } catch (err) {
       console.error("Error banning/unbanning user:", err);
       setError(`Error updating ban status: ${err.response?.status || ''} - ${err.response?.data?.message || err.message}`);
    }
  };

  const fetchUserTrips = async (userId) => {
    setError('');
    const token = getToken();
    if (!token) return;

    if (userTrips[userId]) {
        setUserTrips(prev => ({ ...prev, [userId]: undefined }));
        return;
    }

    setLoadingTrips(prev => ({ ...prev, [userId]: true }));
    try {
        const response = await axios.get(`${API_BASE_URL}/api/admin/users/${userId}/trips`, {
             headers: { Authorization: `Bearer ${token}` },
        });
        setUserTrips(prev => ({ ...prev, [userId]: response.data || [] }));
    } catch (err) {
        console.error(`Error fetching trips for user ${userId}:`, err);
        setError(`Error fetching trips: ${err.response?.status || ''} - ${err.response?.data?.message || err.message}`);
        setUserTrips(prev => ({ ...prev, [userId]: [] }));
    } finally {
        setLoadingTrips(prev => ({ ...prev, [userId]: false }));
    }
  }

  const handleDeleteTripActual = async (tripId, userId) => {
     setError('');
     const token = getToken();
     if (!token) return;

     if (!window.confirm(`Are you sure you want to delete trip ${tripId}? This cannot be undone.`)) {
         return;
     }

     try {
        await axios.delete(`${API_BASE_URL}/api/admin/trips/${tripId}`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        setUserTrips(prevUserTrips => ({
            ...prevUserTrips,
            [userId]: prevUserTrips[userId]?.filter(trip => trip._id !== tripId) || []
        }));
        alert('Trip deleted successfully.');
     } catch (err) {
        console.error(`Error deleting trip ${tripId}:`, err);
        setError(`Error deleting trip: ${err.response?.status || ''} - ${err.response?.data?.message || err.message}`);
     }
  }

  const handleDeleteUser = async (userId, userName) => {
    setError('');
    const token = getToken();
    if (!token) return;

    if (!window.confirm(`ARE YOU ABSOLUTELY SURE?\n\nThis will permanently delete user "${userName}" (${userId}) and potentially their associated data (like trips).\n\nThis action cannot be undone.`)) {
      return;
    }

    try {
      console.log(`Attempting to delete user: ${userId}`);
      await axios.delete(`${API_BASE_URL}/api/admin/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert(`User ${userName} deleted successfully.`);
      fetchUsers();
    } catch (err) {
      console.error(`Error deleting user ${userId}:`, err);
      setError(`Error deleting user: ${err.response?.status || ''} - ${err.response?.data?.message || err.message}`);
    }
  };

  if (!isAuthenticated) return <p>Please log in to view this page.</p>;
  if (!isAdmin) return <p>You are not authorized to view this page. Admin access required.</p>;

  return (
    <div className="container mt-4">
      <h1>Admin Dashboard</h1>
      {error && <div className="alert alert-danger" role="alert">{error}</div>}
      {users.length > 0 ? (
        <div className="list-group">
          {users.map((user) => (
            <div key={user._id} className="list-group-item list-group-item-action flex-column align-items-start mb-2">
              <div className="d-flex w-100 justify-content-between">
                <h5 className="mb-1">{user.firstName} {user.lastName}</h5>
                <small>ID: {user._id}</small>
              </div>
              <p className="mb-1">{user.email}{user.isBanned && <span className="badge bg-danger ms-2">Banned</span>}</p>
              <div className="mt-2">
                  <button
                      className={`btn btn-sm me-2 ${user.isBanned ? 'btn-success' : 'btn-warning'}`}
                      onClick={() => handleBanUser(user._id)}
                      title={user.isBanned ? 'Unban User' : 'Ban User'}
                   >
                    {user.isBanned ? <i className="fas fa-check-circle"></i> : <i className="fas fa-ban"></i>} {user.isBanned ? 'Unban' : 'Ban'}
                  </button>
                  <button
                      className="btn btn-info btn-sm me-2"
                      onClick={() => fetchUserTrips(user._id)}
                      disabled={loadingTrips[user._id]}
                      title="View/Hide User's Trips"
                   >
                   <i className="fas fa-route"></i> {loadingTrips[user._id] ? 'Loading...' : (userTrips[user._id] ? 'Hide Trips' : 'View Trips')}
                  </button>
                  <button
                      className="btn btn-danger btn-sm"
                      onClick={() => handleDeleteUser(user._id, `${user.firstName} ${user.lastName}`)}
                      title="Permanently Delete User Account"
                   >
                   <i className="fas fa-trash-alt"></i> Delete Account
                  </button>
              </div>

              {userTrips[user._id] && (
                  <div className="mt-3 ps-3 border-start">
                      <h6>Trips Driven by {user.firstName}:</h6>
                      {userTrips[user._id].length > 0 ? (
                          <ul className="list-group list-group-flush">
                            {userTrips[user._id].map((trip) => (
                                <li key={trip._id} className="list-group-item list-group-item-action d-flex justify-content-between align-items-center py-1 px-0">
                                    <span className="text-muted small">
                                        To: {trip.to || 'N/A'} (ID: {trip._id})
                                    </span>
                                    <button
                                        className="btn btn-outline-danger btn-sm py-0 px-1"
                                        onClick={() => handleDeleteTripActual(trip._id, user._id)}
                                        title="Delete This Specific Trip"
                                    >
                                        <i className="fas fa-times"></i>
                                    </button>
                                </li>
                            ))}
                          </ul>
                      ) : (
                          <p className="text-muted small">No trips found where this user is the driver.</p>
                      )}
                  </div>
              )}
            </div>
          ))}
        </div>
      ) : (
         !error && <p>Loading users or no users found...</p>
      )}
    </div>
  );
}

export default AdminDashboard;