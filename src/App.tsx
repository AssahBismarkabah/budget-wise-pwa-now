import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { BudgetProvider } from "@/contexts/BudgetContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { AccountProvider } from "@/contexts/AccountContext";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Settings from "./pages/Settings";
import Templates from "./pages/Templates";
import Statistics from "./pages/Statistics";
import Categories from "./pages/Categories";
import Limits from "./pages/Limits";
import SavingsGoals from "./pages/SavingsGoals";
import RecurringItems from "./pages/RecurringItems";
import Onboarding from "./pages/Onboarding";
import { useTranslation } from 'react-i18next';
import { useAccount } from "@/contexts/AccountContext";
import PWAInstallPrompt from './components/PWAInstallPrompt';
import FirefoxInstallHint from './components/FirefoxInstallHint';
import { QRCodeCanvas } from 'qrcode.react';
import { useEffect, useState } from 'react';

const queryClient = new QueryClient();

// Protected route component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAccount();
  return isAuthenticated ? <>{children}</> : <Navigate to="/onboarding" replace />;
};

const DesktopOverlay = () => {
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const checkDesktop = () => {
      setIsDesktop(window.innerWidth > 900);
    };
    checkDesktop();
    window.addEventListener('resize', checkDesktop);
    return () => window.removeEventListener('resize', checkDesktop);
  }, []);

  if (!isDesktop) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      background: 'rgba(0,0,0,0.85)',
      zIndex: 9999,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#fff',
      textAlign: 'center',
    }}>
      <h2 style={{ fontSize: 32, marginBottom: 16 }}>Open on your mobile device</h2>
      <p style={{ fontSize: 18, marginBottom: 24 }}>Scan this QR code to open and install the app on your phone or tablet.</p>
      <QRCodeCanvas value={window.location.href} size={200} bgColor="#fff" fgColor="#1E90FF" />
      <p style={{ marginTop: 24, fontSize: 16 }}>Or visit this URL on your mobile browser:<br /><span style={{ color: '#1E90FF' }}>{window.location.href}</span></p>
    </div>
  );
};

const App = () => {
  const { t, i18n } = useTranslation();
  const language = i18n.language;
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const checkDesktop = () => {
      setIsDesktop(window.innerWidth > 900);
    };
    checkDesktop();
    window.addEventListener('resize', checkDesktop);
    return () => window.removeEventListener('resize', checkDesktop);
  }, []);

  if (isDesktop) {
    return <DesktopOverlay />;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="system" storageKey="budget-wise-theme">
        <TooltipProvider>
          <BrowserRouter>
            <AccountProvider>
              <BudgetProvider>
                <Toaster />
                <Sonner />
                <PWAInstallPrompt />
                <FirefoxInstallHint />
                <Routes>
                  <Route path="/onboarding" element={<Onboarding />} />
                  <Route
                    path="/"
                    element={
                      <ProtectedRoute>
                        <Index />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/settings"
                    element={
                      <ProtectedRoute>
                        <Settings />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/templates"
                    element={
                      <ProtectedRoute>
                        <Templates />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/statistics"
                    element={
                      <ProtectedRoute>
                        <Statistics />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/categories/:type"
                    element={
                      <ProtectedRoute>
                        <Categories />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/limits"
                    element={
                      <ProtectedRoute>
                        <Limits />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/savings-goals"
                    element={
                      <ProtectedRoute>
                        <SavingsGoals />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/recurring"
                    element={
                      <ProtectedRoute>
                        <RecurringItems />
                      </ProtectedRoute>
                    }
                  />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </BudgetProvider>
            </AccountProvider>
          </BrowserRouter>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
