import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/useAuth";
import ProtectedRoute from "@/components/ProtectedRoute";
import RoleRoute from "@/components/RoleRoute";
import Index from "./pages/Index";
import Onboarding from "./pages/Onboarding";
import Dashboard from "./pages/Dashboard";
import OwnerDashboard from "./pages/OwnerDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import NotFound from "./pages/NotFound";
import RegisterRestaurant from "./pages/RegisterRestaurant";
import CustomerDashboard from "./pages/CustomerDashboard";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/join" element={<Onboarding />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/owner"
              element={
                <RoleRoute allowedRoles={["RESTAURANT_OWNER", "SUPER_ADMIN"]}>
                  <OwnerDashboard />
                </RoleRoute>
              }
            />
            <Route
              path="/admin"
              element={
                <RoleRoute allowedRoles={["SUPER_ADMIN"]}>
                  <AdminDashboard />
                </RoleRoute>
              }
            />
            <Route
              path="/customer"
              element={
                <RoleRoute allowedRoles={["CUSTOMER"]}>
                  <CustomerDashboard />
                </RoleRoute>
              }
            />
            <Route path="/register/restaurant" element={<RegisterRestaurant />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
