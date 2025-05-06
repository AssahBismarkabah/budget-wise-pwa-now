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

const queryClient = new QueryClient();

// Protected route component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAccount();
  return isAuthenticated ? <>{children}</> : <Navigate to="/onboarding" replace />;
};

const App = () => {
  const { t, i18n } = useTranslation();
  const language = i18n.language;

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
