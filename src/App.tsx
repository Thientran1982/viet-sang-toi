import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/ThemeProvider";
import { AuthProvider } from "@/hooks/useAuth";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import PropertyList from "./pages/PropertyList";
import PropertyDetail from "./pages/PropertyDetail";
import PropertyForm from "./pages/PropertyForm";
import Profile from "./pages/Profile";
import Favorites from "./pages/Favorites";
import MyProperties from "./pages/MyProperties";
import PropertyComparison from "./pages/PropertyComparison";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="light" storageKey="nhadep-theme">
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/properties" element={<PropertyList />} />
              <Route path="/property/:id" element={<PropertyDetail />} />
              <Route path="/add-property" element={<PropertyForm />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/favorites" element={<Favorites />} />
              <Route path="/my-properties" element={<MyProperties />} />
              <Route path="/compare" element={<PropertyComparison />} />
              <Route path="/dashboard" element={<Dashboard />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
