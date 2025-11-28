import React, { createContext, useContext, useState, useEffect, ReactNode, useRef } from 'react';
import * as authService from '../models/authService';
import type { User } from '../models/authService';

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
  isAdmin: () => boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const logoutTimerRef = useRef<number | null>(null);

  // Load session from localStorage on mount
  useEffect(() => {
    const restoreSession = async () => {
      setIsLoading(true);
      try {
        const currentUser = await authService.getCurrentUser();
        if (currentUser) {
          setUser(currentUser);
        }
      } catch (error) {
        console.error('Failed to restore session:', error);
      } finally {
        setIsLoading(false);
      }
    };
    restoreSession();

    return () => {
      if (logoutTimerRef.current) {
        clearTimeout(logoutTimerRef.current);
      }
    };
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    const response = await authService.login(username, password);

    if (response.success && response.user && response.token) {
      setUser(response.user);

      // Store token
      localStorage.setItem('authToken', response.token);

      // Notify listeners that auth changed
      try {
        window.dispatchEvent(new CustomEvent('katuu:authChanged', { detail: { user: response.user } }));
      } catch (e) {
        console.error('Failed to dispatch auth event', e);
      }

      return true;
    }

    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('authToken');

    if (logoutTimerRef.current) {
      clearTimeout(logoutTimerRef.current);
      logoutTimerRef.current = null;
    }

    try {
      window.dispatchEvent(new CustomEvent('katuu:authChanged', { detail: { user: null } }));
    } catch (e) {
      console.error('Failed to dispatch auth event', e);
    }
  };

  const value: AuthContextType = {
    user,
    login,
    logout,
    isAuthenticated: !!user,
    isAdmin: () => user?.role === 'admin',
    isLoading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
