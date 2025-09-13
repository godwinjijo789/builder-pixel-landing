import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import Enrollment from "./pages/Enrollment";
import Alerts from "./pages/Alerts";
import SystemStatus from "./pages/SystemStatus";
import AnnualAttendance from "./pages/AnnualAttendance";
import ManualAttendance from "./pages/ManualAttendance";
import DOOffice from "./pages/DOOffice";
import Students from "./pages/Students";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import { AuthProvider, useAuth } from "@/context/auth";

const queryClient = new QueryClient();

function Protected({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<Protected><Index /></Protected>} />
            <Route path="/enrollment" element={<Protected><Enrollment /></Protected>} />
            <Route path="/alerts" element={<Protected><Alerts /></Protected>} />
            <Route path="/status" element={<Protected><SystemStatus /></Protected>} />
            <Route path="/annual" element={<Protected><AnnualAttendance /></Protected>} />
            <Route path="/manual" element={<Protected><ManualAttendance /></Protected>} />
            <Route path="/students" element={<Protected><Students /></Protected>} />
            <Route path="/do-office" element={<Protected><DOOffice /></Protected>} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

createRoot(document.getElementById("root")!).render(<App />);
