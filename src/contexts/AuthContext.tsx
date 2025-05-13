import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '@/services/authService';

interface AuthContextType {
  isAuthenticated: boolean;
  user: AuthResponse['userProfile'] | null;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  error: string | null;
}

interface AuthResponse {
  userProfile: {
    name: string;
    lastLogin?: string;
  };
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<AuthResponse['userProfile'] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check if user is already logged in
    const storedUser = localStorage.getItem('user');
    const onboardingComplete = localStorage.getItem('onboardingComplete') === 'true';
    if (storedUser && onboardingComplete) {
      setUser(JSON.parse(storedUser));
      setIsAuthenticated(true);
    }
  }, []);

  const login = async (username: string, password: string) => {
    try {
      setError(null);
      const response = await authService.login(username, password);
      setUser(response.userProfile);
      setIsAuthenticated(true);
      localStorage.setItem('user', JSON.stringify(response.userProfile));
      
      // Check if onboarding is needed
      const onboardingComplete = localStorage.getItem('onboardingComplete') === 'true';
      if (!onboardingComplete) {
        setIsAuthenticated(false);
      }
    } catch (err) {
      setError('Login failed. Please check your credentials.');
      throw err;
    }
  };

  const register = async (username: string, password: string) => {
    try {
      setError(null);
      const response = await authService.register(username, password);
      setUser(response.userProfile);
      localStorage.setItem('user', JSON.stringify(response.userProfile));
      // Don't set isAuthenticated to true yet, as we need to complete onboarding
      setIsAuthenticated(false);
    } catch (err) {
      setError('Registration failed. Please try again.');
      throw err;
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
      setUser(null);
      setIsAuthenticated(false);
      localStorage.removeItem('user');
      localStorage.removeItem('onboardingComplete');
    } catch (err) {
      setError('Logout failed. Please try again.');
      throw err;
    }
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, register, logout, error }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 