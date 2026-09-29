import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../api/client';

interface AuthContextType {
  isAdmin: boolean;
  adminName: string | null;
  token: string | null;
  login: (token: string, username: string) => void;
  logout: () => void;
  showLoginModal: boolean;
  openLoginModal: () => void;
  closeLoginModal: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('mandal_token'));
  const [adminName, setAdminName] = useState<string | null>(() => localStorage.getItem('mandal_admin_user'));
  const [showLoginModal, setShowLoginModal] = useState(false);

  useEffect(() => {
    if (token) {
      api
        .verifyMe()
        .then((res) => {
          setAdminName(res.admin.username);
        })
        .catch(() => {
          // Token expired or invalid
          logout();
        });
    }
  }, [token]);

  const login = (newToken: string, username: string) => {
    localStorage.setItem('mandal_token', newToken);
    localStorage.setItem('mandal_admin_user', username);
    setToken(newToken);
    setAdminName(username);
    setShowLoginModal(false);
  };

  const logout = () => {
    localStorage.removeItem('mandal_token');
    localStorage.removeItem('mandal_admin_user');
    setToken(null);
    setAdminName(null);
  };

  const openLoginModal = () => setShowLoginModal(true);
  const closeLoginModal = () => setShowLoginModal(false);

  return (
    <AuthContext.Provider
      value={{
        isAdmin: !!token,
        adminName,
        token,
        login,
        logout,
        showLoginModal,
        openLoginModal,
        closeLoginModal,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
