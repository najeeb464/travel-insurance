import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('tavara_access_token') || localStorage.getItem('ekta_access_token');
    if (token) {
      authApi.getMe()
        .then((res) => setUser(res.data))
        .catch(() => {
          localStorage.removeItem('tavara_access_token');
          localStorage.removeItem('tavara_refresh_token');
          localStorage.removeItem('ekta_access_token');
          localStorage.removeItem('ekta_refresh_token');
          setUser(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    const res = await authApi.login({ email, password });
    localStorage.setItem('tavara_access_token', res.data.access);
    localStorage.setItem('tavara_refresh_token', res.data.refresh);
    setUser(res.data.user);
    return res.data.user;
  };

  const register = async (userData) => {
    const res = await authApi.register(userData);
    return await login(userData.email, userData.password);
  };

  const logout = () => {
    localStorage.removeItem('tavara_access_token');
    localStorage.removeItem('tavara_refresh_token');
    localStorage.removeItem('ekta_access_token');
    localStorage.removeItem('ekta_refresh_token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
