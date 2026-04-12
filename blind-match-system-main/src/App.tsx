import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { AppLayout } from "@/components/layout/AppLayout";

import Login from "./pages/Login";
import NotFound from "./pages/NotFound";

// Student
import MyProposals from "./pages/student/MyProposals";
import NewProposal from "./pages/student/NewProposal";
import ProposalDetail from "./pages/student/ProposalDetail";

// Supervisor
import BlindReview from "./pages/supervisor/BlindReview";
import MyMatches from "./pages/supervisor/MyMatches";
import ExpertiseManagement from "./pages/supervisor/ExpertiseManagement";

// Module Leader
import AdminDashboard from "./pages/admin/AdminDashboard";
import AllocationOversight from "./pages/admin/AllocationOversight";
import ResearchAreas from "./pages/admin/ResearchAreas";
import UserManagement from "./pages/admin/UserManagement";

// System Admin
import SysAdminUsers from "./pages/sysadmin/SysAdminUsers";
import SystemConfig from "./pages/sysadmin/SystemConfig";
import ActivityLog from "./pages/sysadmin/ActivityLog";

const queryClient = new QueryClient();

function RoleRedirect() {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" />;
  switch (user.role) {
    case "student": return <Navigate to="/student/proposals" />;
    case "supervisor": return <Navigate to="/supervisor/review" />;
    case "module_leader": return <Navigate to="/admin/dashboard" />;
    case "system_admin": return <Navigate to="/sysadmin/users" />;
  }
}

function ProtectedRoutes() {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" />;

  return (
    <AppLayout>
      <Routes>
        {/* Student */}
        <Route path="/student/proposals" element={<MyProposals />} />
        <Route path="/student/proposals/new" element={<NewProposal />} />
        <Route path="/student/proposals/:id" element={<ProposalDetail />} />

        {/* Supervisor */}
        <Route path="/supervisor/review" element={<BlindReview />} />
        <Route path="/supervisor/matches" element={<MyMatches />} />
        <Route path="/supervisor/expertise" element={<ExpertiseManagement />} />

        {/* Module Leader */}
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/allocations" element={<AllocationOversight />} />
        <Route path="/admin/research-areas" element={<ResearchAreas />} />
        <Route path="/admin/users" element={<UserManagement />} />

        {/* System Admin */}
        <Route path="/sysadmin/users" element={<SysAdminUsers />} />
        <Route path="/sysadmin/config" element={<SystemConfig />} />
        <Route path="/sysadmin/activity" element={<ActivityLog />} />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </AppLayout>
  );
}

function AppRoutes() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/login" element={user ? <RoleRedirect /> : <Login />} />
      <Route path="/" element={<RoleRedirect />} />
      <Route path="/*" element={<ProtectedRoutes />} />
    </Routes>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
