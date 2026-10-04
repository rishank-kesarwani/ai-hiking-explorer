'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, FitnessLevel } from '../lib/types';
import { api } from '../lib/api';
import { useToast } from './ToastContext';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isLoginModalOpen: boolean;
  openLoginModal: (redirectAction?: () => void) => void;
  closeLoginModal: () => void;
  login: (email: string, pass: string) => Promise<void>;
  register: (email: string, pass: string, name: string, fitnessLevel?: FitnessLevel) => Promise<void>;
  logout: () => Promise<void>;
  requireAuth: (callback: () => void) => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);
  const { showToast } = useToast();

  useEffect(() => {
    // Connect api 401 callback to open login modal gracefully
    api.setOnAuthRequired(() => {
      setUser(null);
      setToken(null);
      setIsLoginModalOpen(true);
    });

    const initAuth = async () => {
      const storedToken = localStorage.getItem('hiking_access_token');
      if (storedToken) {
        setToken(storedToken);
        try {
          const userData = await api.get<User>('/auth/me');
          if (userData) {
            setUser(userData);
          }
        } catch {
          // Token expired or invalid
          api.setStoredToken(null);
          setToken(null);
          setUser(null);
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const openLoginModal = (callback?: () => void) => {
    if (callback) {
      setPendingAction(() => callback);
    }
    setIsLoginModalOpen(true);
  };

  const closeLoginModal = () => {
    setIsLoginModalOpen(false);
    setPendingAction(null);
  };

  const requireAuth = (callback: () => void) => {
    if (user) {
      callback();
    } else {
      openLoginModal(callback);
    }
  };

  const refreshUser = async () => {
    try {
      const userData = await api.get<User>('/users/profile');
      if (userData) {
        setUser(userData);
      }
    } catch {
      // Ignore
    }
  };

  const login = async (email: string, pass: string) => {
    const res = await api.post<{ user: User; accessToken: string }>('/auth/login', {
      email,
      password: pass,
    });

    api.setStoredToken(res.accessToken);
    setToken(res.accessToken);
    setUser(res.user);
    setIsLoginModalOpen(false);
    showToast('success', `Welcome back, ${res.user.name}!`);

    if (pendingAction) {
      pendingAction();
      setPendingAction(null);
    }
  };

  const register = async (email: string, pass: string, name: string, fitnessLevel?: FitnessLevel) => {
    const res = await api.post<{ user: User; accessToken: string }>('/auth/register', {
      email,
      password: pass,
      name,
      fitnessLevel: fitnessLevel || 'Beginner',
    });

    api.setStoredToken(res.accessToken);
    setToken(res.accessToken);
    setUser(res.user);
    setIsLoginModalOpen(false);
    showToast('success', `Welcome to AI Hiking Explorer, ${name}!`);

    if (pendingAction) {
      pendingAction();
      setPendingAction(null);
    }
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch {
      // Ignore
    }
    api.setStoredToken(null);
    setToken(null);
    setUser(null);
    showToast('info', 'You have been logged out.');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        isLoading,
        isLoginModalOpen,
        openLoginModal,
        closeLoginModal,
        login,
        register,
        logout,
        requireAuth,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
