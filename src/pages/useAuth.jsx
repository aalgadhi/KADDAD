import { useState, useEffect } from 'react';

const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const isAdminValue = localStorage.getItem('isAdmin');

    if (token) {
      setIsAuthenticated(true);
    } else {
      setIsAuthenticated(false);
    }

    if (isAdminValue === 'true') {
      setIsAdmin(true);
    } else {
      setIsAdmin(false);
    }
  }, []); // Empty dependency array means this runs only once on mount

  return { isAuthenticated, isAdmin };
};

export default useAuth;