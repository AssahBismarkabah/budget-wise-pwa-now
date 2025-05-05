import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { BudgetProvider } from "@/contexts/BudgetContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Settings from "./pages/Settings";
import Templates from "./pages/Templates";
import Statistics from "./pages/Statistics";
import Categories from "./pages/Categories";
import Limits from "./pages/Limits";
import SavingsGoals from "./pages/SavingsGoals";
import RecurringItems from "./pages/RecurringItems";
import { useTranslation } from 'react-i18next';

const queryClient = new QueryClient();

const App = () => {
  const { t, i18n } = useTranslation();
  const language = i18n.language;

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="system" storageKey="budget-wise-theme">
        <TooltipProvider>
          <BudgetProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/templates" element={<Templates />} />
                <Route path="/statistics" element={<Statistics />} />
                <Route path="/categories/:type" element={<Categories />} />
                <Route path="/limits" element={<Limits />} />
                <Route path="/savings-goals" element={<SavingsGoals />} />
                <Route path="/recurring" element={<RecurringItems />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </BudgetProvider>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
