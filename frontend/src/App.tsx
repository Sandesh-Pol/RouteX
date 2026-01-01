import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/auth/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";

// Pages
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Auth from "./pages/Auth";

// Client Pages
import ClientDashboard from "./client/ClientDashboard";
import SendParcel from "./client/SendParcel";
import TrackParcel from "./client/TrackParcel";

// Driver Pages
import DriverDashboard from "./driver/DriverDashboard";
import DriverAssignments from "./driver/DriverAssignments";
import DriverNavigation from "./driver/DriverNavigation";

// Admin Pages
import AdminDashboard from "./admin/AdminDashboard";
import AdminRequests from "./admin/AdminRequests";
import AdminTracking from "./admin/AdminTracking";
import AdminDrivers from "./admin/AdminDrivers";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />

            {/* Client Routes */}
            <Route
              path="/client"
              element={
                <ProtectedRoute allowedRoles={['client']}>
                  <ClientDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/client/send"
              element={
                <ProtectedRoute allowedRoles={['client']}>
                  <SendParcel />
                </ProtectedRoute>
              }
            />
            <Route
              path="/client/track"
              element={
                <ProtectedRoute allowedRoles={['client']}>
                  <TrackParcel />
                </ProtectedRoute>
              }
            />

            {/* Driver Routes */}
            <Route
              path="/driver"
              element={
                <ProtectedRoute allowedRoles={['driver']}>
                  <DriverDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/driver/assignments"
              element={
                <ProtectedRoute allowedRoles={['driver']}>
                  <DriverAssignments />
                </ProtectedRoute>
              }
            />
            <Route
              path="/driver/navigation"
              element={
                <ProtectedRoute allowedRoles={['driver']}>
                  <DriverNavigation />
                </ProtectedRoute>
              }
            />

            {/* Admin Routes */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/requests"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminRequests />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/tracking"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminTracking />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/drivers"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminDrivers />
                </ProtectedRoute>
              }
            />

            {/* Catch-all */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
