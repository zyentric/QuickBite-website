import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { User } from '../types';
import { api } from '../services/api';
import { wsService } from '../services/WebSocketService';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isAuthModalOpen: boolean;
  authModalTab: 'login' | 'register';
  openAuthModal: (tab?: 'login' | 'register') => void;
  closeAuthModal: () => void;
  login: (email: string, password: string) => Promise<void>;
  register: (data: { name: string; email: string; password: string; phone?: string }) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  changePassword: (currentPw: string, newPw: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);
const USER_KEY = 'quickbite_user_data';
const AUTH_MODAL_SHOWN_KEY = 'quickbite_auth_modal_dismissed';

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const u = localStorage.getItem(USER_KEY);
      if (!u || u === 'undefined' || u === 'null') return null;
      return JSON.parse(u);
    } catch { return null; }
  });

  const [token, setToken] = useState<string | null>(() => {
    const t = localStorage.getItem(api.TOKEN_KEY);
    return t && t !== 'undefined' && t !== 'null' ? t : null;
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<'login' | 'register'>('login');

  const openAuthModal = (tab: 'login' | 'register' = 'login') => {
    setAuthModalTab(tab);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
    sessionStorage.setItem(AUTH_MODAL_SHOWN_KEY, 'true');
  };

  const refreshUser = async () => {
    if (!token) { setIsLoading(false); return; }
    try {
      const profile = await api.auth.getProfile();
      setUser(profile);
      localStorage.setItem(USER_KEY, JSON.stringify(profile));
    } catch {
      logout();
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { refreshUser(); }, [token]);

  // Open Flipkart style auth modal on first website load if user is not authenticated
  useEffect(() => {
    const isDismissed = sessionStorage.getItem(AUTH_MODAL_SHOWN_KEY);
    if (!token && !isDismissed) {
      const timer = setTimeout(() => {
        setIsAuthModalOpen(true);
      }, 700);
      return () => clearTimeout(timer);
    }
  }, [token]);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    const res = await api.auth.login(email, password);
    const authToken = res.accessToken || res.token;
    if (!authToken) throw new Error('No token received');
    setToken(authToken);
    setUser(res.user);
    localStorage.setItem(api.TOKEN_KEY, authToken);
    localStorage.setItem(USER_KEY, JSON.stringify(res.user));
    
    // Connect WebSocket
    const uid = res.user?.id || res.user?._id || '';
    const role = res.user?.role || 'customer';
    if (uid) wsService.connect(uid, role);

    // Close modal
    setIsAuthModalOpen(false);
    sessionStorage.setItem(AUTH_MODAL_SHOWN_KEY, 'true');

    // Notify FavoritesContext
    window.dispatchEvent(new Event('quickbite_auth_change'));
    setIsLoading(false);
  };

  const register = async (data: { name: string; email: string; password: string; phone?: string }) => {
    setIsLoading(true);
    const res = await api.auth.register(data);
    const authToken = res.accessToken || res.token;
    if (!authToken) throw new Error('No token received');
    setToken(authToken);
    setUser(res.user);
    localStorage.setItem(api.TOKEN_KEY, authToken);
    localStorage.setItem(USER_KEY, JSON.stringify(res.user));
    const uid = res.user?.id || res.user?._id || '';
    const role = res.user?.role || 'customer';
    if (uid) wsService.connect(uid, role);

    setIsAuthModalOpen(false);
    sessionStorage.setItem(AUTH_MODAL_SHOWN_KEY, 'true');

    window.dispatchEvent(new Event('quickbite_auth_change'));
    setIsLoading(false);
  };

  const logout = () => {
    wsService.disconnect();
    setUser(null);
    setToken(null);
    localStorage.removeItem(api.TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    window.dispatchEvent(new Event('quickbite_auth_change'));
    setIsLoading(false);
  };

  const changePassword = async (currentPw: string, newPw: string) => {
    await api.auth.changePassword(currentPw, newPw);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        isLoading,
        isAuthModalOpen,
        authModalTab,
        openAuthModal,
        closeAuthModal,
        login,
        register,
        logout,
        refreshUser,
        changePassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be inside AuthProvider');
  return ctx;
};
