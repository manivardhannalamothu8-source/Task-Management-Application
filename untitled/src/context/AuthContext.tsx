import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User } from '../types';
import { authAPI } from '../services/api';
import { joinUserRoom, leaveUserRoom } from '../services/socket';
import { useToast } from './ToastContext';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string, confirmPassword?: string) => Promise<boolean>;
  logout: () => void;
  updateProfile: (data: { name?: string; currentPassword?: string; newPassword?: string }) => Promise<boolean>;
  seedDemoData: () => Promise<boolean>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('taskflow_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return null;
      }
    }
    return null;
  });

  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('taskflow_token');
  });

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { showToast } = useToast();

  const logout = useCallback(() => {
    if (user?._id) {
      leaveUserRoom(user._id);
    }
    localStorage.removeItem('taskflow_token');
    localStorage.removeItem('taskflow_user');
    setUser(null);
    setToken(null);
    showToast('info', 'Logged Out', 'You have been safely signed out.');
  }, [user?._id, showToast]);

  // Initial user verify and session check
  useEffect(() => {
    let isMounted = true;
    async function verifyAuth() {
      const storedToken = localStorage.getItem('taskflow_token');
      if (storedToken) {
        try {
          const res = await authAPI.getMe();
          if (isMounted && res.success && res.user) {
            setUser(res.user);
            localStorage.setItem('taskflow_user', JSON.stringify(res.user));
            joinUserRoom(res.user._id);
          }
        } catch {
          if (isMounted) {
            localStorage.removeItem('taskflow_token');
            localStorage.removeItem('taskflow_user');
            setUser(null);
            setToken(null);
          }
        }
      }
      if (isMounted) {
        setIsLoading(false);
      }
    }

    verifyAuth();

    const handleUnauthorized = () => {
      logout();
    };

    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => {
      isMounted = false;
      window.removeEventListener('auth:unauthorized', handleUnauthorized);
    };
  }, [logout]);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      const res = await authAPI.login({ email, password });
      if (res.success && res.token && res.user) {
        setToken(res.token);
        setUser(res.user);
        localStorage.setItem('taskflow_token', res.token);
        localStorage.setItem('taskflow_user', JSON.stringify(res.user));
        joinUserRoom(res.user._id);
        showToast('success', 'Welcome back!', `Signed in as ${res.user.name}`);
        return true;
      }
      return false;
    } catch (err: any) {
      showToast('error', 'Login Failed', err.message || 'Please check your credentials.');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string, confirmPassword?: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      const res = await authAPI.register({ name, email, password, confirmPassword });
      if (res.success && res.token && res.user) {
        setToken(res.token);
        setUser(res.user);
        localStorage.setItem('taskflow_token', res.token);
        localStorage.setItem('taskflow_user', JSON.stringify(res.user));
        joinUserRoom(res.user._id);
        showToast('success', 'Account Created!', 'Welcome to TaskFlow! Starter tasks were added.');
        return true;
      }
      return false;
    } catch (err: any) {
      showToast('error', 'Registration Failed', err.message || 'Could not complete registration.');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (data: { name?: string; currentPassword?: string; newPassword?: string }): Promise<boolean> => {
    try {
      const res = await authAPI.updateProfile(data);
      if (res.success && res.user) {
        setUser(res.user);
        localStorage.setItem('taskflow_user', JSON.stringify(res.user));
        showToast('success', 'Profile Updated', 'Your profile details have been saved.');
        return true;
      }
      return false;
    } catch (err: any) {
      showToast('error', 'Update Failed', err.message || 'Unable to update profile.');
      return false;
    }
  };

  const seedDemoData = async (): Promise<boolean> => {
    try {
      const res = await authAPI.seedDemo();
      if (res.success) {
        showToast('success', 'Sample Tasks Seeded', 'Demo tasks have been added to your dashboard.');
        return true;
      }
      return false;
    } catch (err: any) {
      showToast('error', 'Seeding Failed', err.message || 'Failed to seed sample tasks.');
      return false;
    }
  };

  const refreshUser = async () => {
    if (token) {
      try {
        const res = await authAPI.getMe();
        if (res.success && res.user) {
          setUser(res.user);
          localStorage.setItem('taskflow_user', JSON.stringify(res.user));
        }
      } catch {
        // ignore
      }
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user && !!token,
        isLoading,
        login,
        register,
        logout,
        updateProfile,
        seedDemoData,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
