import React, { useState, useEffect } from 'react';
import { AuthContext } from './AuthContextObject';
import {
  registerAccount,
  verifyEmail,
  forgotPassword,
  resetPassword,
  loginWithEmailPassword,
  refreshSession,
  loginWithDemoUser,
  fetchDemoUsers,
  fetchCurrentUser
} from '../api/auth';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('accessToken') || '');
  const [demoUsers, setDemoUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showLoginModal, setShowLoginModal] = useState(false);

  // Verification state for registration flow
  const [pendingVerificationEmail, setPendingVerificationEmail] = useState('');
  const [activeVerificationCode, setActiveVerificationCode] = useState('');

  // Load demo user choices on mount
  useEffect(() => {
    fetchDemoUsers()
      .then(setDemoUsers)
      .catch((err) => console.warn('[AUTH] Could not fetch demo user options:', err.message));
  }, []);

  // Restore user session on startup via Access Token or Refresh Token
  useEffect(() => {
    async function initAuth() {
      const storedAccessToken = localStorage.getItem('accessToken');
      const storedRefreshToken = localStorage.getItem('refreshToken');

      if (storedAccessToken) {
        try {
          const res = await fetchCurrentUser(storedAccessToken);
          setUser(res.user);
          setToken(storedAccessToken);
        } catch {
          // Access token expired, attempt refresh token rotation
          if (storedRefreshToken) {
            try {
              const refreshRes = await refreshSession(storedRefreshToken);
              saveAuthSession(refreshRes.accessToken, refreshRes.refreshToken, refreshRes.user);
            } catch {
              console.warn('[AUTH] Session expired, please log in again.');
              logout();
            }
          } else {
            logout();
          }
        }
      } else if (storedRefreshToken) {
        try {
          const refreshRes = await refreshSession(storedRefreshToken);
          saveAuthSession(refreshRes.accessToken, refreshRes.refreshToken, refreshRes.user);
        } catch {
          logout();
        }
      }

      setLoading(false);
    }
    initAuth();
  }, []);

  const saveAuthSession = (newAccessToken, newRefreshToken, newUser) => {
    if (newAccessToken) {
      localStorage.setItem('accessToken', newAccessToken);
      localStorage.setItem('authToken', newAccessToken); // Backwards compatibility for API headers
      setToken(newAccessToken);
    }
    if (newRefreshToken) {
      localStorage.setItem('refreshToken', newRefreshToken);
    }
    setUser(newUser);
    setShowLoginModal(false);
  };

  const registerUser = async (name, email, password, role) => {
    const data = await registerAccount(name, email, password, role);
    setPendingVerificationEmail(email);
    if (data.verificationCode) {
      setActiveVerificationCode(data.verificationCode);
    }
    return data;
  };

  const verifyUserEmail = async (email, code) => {
    const data = await verifyEmail(email, code);
    setPendingVerificationEmail('');
    setActiveVerificationCode('');
    return data;
  };

  const loginUser = async (email, password) => {
    const data = await loginWithEmailPassword(email, password);
    saveAuthSession(data.accessToken, data.refreshToken, data.user);
    return data.user;
  };

  // Request password reset (forgot password)
  const requestPasswordReset = async (email) => {
    const data = await forgotPassword(email);
    return data;
  };

  // Complete password reset using token
  const completePasswordReset = async (token, newPassword) => {
    const data = await resetPassword(token, newPassword);
    return data;
  };

  const loginAsDemo = async (userId) => {
    const data = await loginWithDemoUser(userId);
    saveAuthSession(data.accessToken, data.refreshToken, data.user);
    return data.user;
  };

  const logout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('authToken');
    setToken('');
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        demoUsers,
        showLoginModal,
        setShowLoginModal,
        pendingVerificationEmail,
        setPendingVerificationEmail,
        activeVerificationCode,
        registerUser,
        verifyUserEmail,
        loginUser,
        loginAsDemo,
        requestPasswordReset,
        completePasswordReset,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export default AuthProvider;
