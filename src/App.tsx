
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { BudgetProvider } from "@/contexts/BudgetContext";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Settings from "./pages/Settings";
import Templates from "./pages/Templates";
import Statistics from "./pages/Statistics";
import Categories from "./pages/Categories";
import Limits from "./pages/Limits";
import SavingsGoals from "./pages/SavingsGoals";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
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
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </BudgetProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
