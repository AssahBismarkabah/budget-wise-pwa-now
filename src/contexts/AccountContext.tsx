import { createContext, useContext, useState, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';

interface AccountContextType {
  isAuthenticated: boolean;
  setIsAuthenticated: (value: boolean) => void;
  logout: () => void;
  resetOnboarding: () => void;
}

const AccountContext = createContext<AccountContextType | undefined>(undefined);

export const AccountProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('onboardingComplete') === 'true';
  });
  const navigate = useNavigate();

  const logout = () => {
    // Clear all local storage except for accounts data
    const accounts = localStorage.getItem('accounts');
    localStorage.clear();
    if (accounts) {
      localStorage.setItem('accounts', accounts);
    }
    setIsAuthenticated(false);
    navigate('/onboarding');
  };

  const resetOnboarding = () => {
    localStorage.removeItem('onboardingComplete');
    setIsAuthenticated(false);
    navigate('/onboarding');
  };

  return (
    <AccountContext.Provider value={{ isAuthenticated, setIsAuthenticated, logout, resetOnboarding }}>
      {children}
    </AccountContext.Provider>
  );
};

export const useAccount = () => {
  const context = useContext(AccountContext);
  if (context === undefined) {
    throw new Error('useAccount must be used within an AccountProvider');
  }
  return context;
}; 