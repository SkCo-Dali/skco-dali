import { useRef, useEffect, useState } from "react";
import { Routes, Route, Navigate, useLocation, useNavigate } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Header } from "@/components/Header";
import { RoleBasedRedirect } from "@/components/RoleBasedRedirect";
import { RestrictedRoute } from "@/components/RestrictedRoute";
import Dashboard from "@/pages/Dashboard";
import Leads from "@/pages/Leads";
import LeadsTabbed from "@/pages/LeadsTabbed";
import Tasks from "@/pages/Tasks";
import Reports from "@/pages/Reports";
import Informes from "@/pages/Informes";
import ReportViewer from "@/pages/ReportViewer";
import Users from "@/pages/Users";
import { Opportunities } from "@/pages/Opportunities";
import { OpportunityDetails } from "@/pages/OpportunityDetails";
import MarketDaliPage from "@/pages/MarketDaliPage";
import OpportunityDetailPage from "@/pages/OpportunityDetailPage";
import ChatDali from "@/pages/ChatDali";
import Gamification from "@/pages/Gamification";
import Index from "@/pages/Index";
import Comisiones from "@/pages/Comisiones";
import MotorComisionesIndex from "@/pages/MotorComisionesIndex";
import CompensationPlans from "@/pages/CompensationPlans";
import Catalogs from "@/pages/Catalogs";
import InfoGerencialComisiones from "@/pages/InfoGerencialComisiones";
import VoiceInsights from "@/pages/VoiceInsights";
import UserProfile from "@/pages/UserProfile";
import NotFound from "@/pages/NotFound";
import PowerBIReportsAdmin from "@/components/admin/PowerBIReportsAdmin";
import GraphCallback from "@/pages/GraphCallback";
import { AdvisorsHome } from "@/features/advisor/pages/AdvisorsHome";
import { AdvisorProfile } from "@/features/advisor/pages/AdvisorProfile";
import { useAuth } from "@/contexts/AuthContext";
import { Login } from "@/components/Login";
import { AuthenticatedTemplate, UnauthenticatedTemplate } from "@azure/msal-react";
import ChatSami, { ChatSamiHandle } from "@/components/ChatSami";
import { getRolePermissions } from "@/types/crm";
import { useIsMobile } from "@/hooks/use-mobile";
import { useChatSamiState } from "@/contexts/ChatSamiContext";

export function AppContent() {
  const { user, loading } = useAuth();
  const chatDaliRef = useRef<any>(null);
  const chatSamiRef = useRef<ChatSamiHandle>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { isChatSamiOpen: chatSamiOpen, setIsChatSamiOpen: setChatSamiOpen } = useChatSamiState();

  // Check if user has ChatSami permissions
  const hasChatSamiPermissions = user ? getRolePermissions(user.role)?.chatSami : false;

  // Verificar si estamos en la página de Users
  const isUsersPage =
    location.pathname === "/users" || location.pathname === "/admin/users" || location.pathname === "/admin/reports";

  // Cerrar ChatSami si navegamos a la página de Users
  useEffect(() => {
    if (isUsersPage && chatSamiOpen) {
      setChatSamiOpen(false);
    }
  }, [isUsersPage, chatSamiOpen]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900" />
      </div>
    );
  }

  const handleBannerMessage = (automaticReply: string) => {
    // Usar ChatSami en lugar de ChatDali
    if (chatSamiRef.current) {
      chatSamiRef.current.sendMessage(automaticReply);
    }
  };

  const handleSamiToggle = () => {
    setChatSamiOpen(!chatSamiOpen);
  };

  return (
    <div className="App">
      <UnauthenticatedTemplate>
        <Routes>
          <Route path="/login" element={<Login onLogin={() => { }} />} />
          <Route
            path="*"
            element={
              <Navigate to={`/login`} state={{ from: { query: location.search, path: location.pathname } }} replace />
            }
          />
        </Routes>
      </UnauthenticatedTemplate>
      <AuthenticatedTemplate>
        <SidebarProvider defaultOpen={false}>
          <div className="min-h-screen flex w-full">
            <AppSidebar />
            <div
              className="flex-1 flex flex-col transition-all duration-300"
              style={{ marginRight: chatSamiOpen && hasChatSamiPermissions && !isUsersPage ? "380px" : "0" }}
            >
              <Header onSamiToggle={handleSamiToggle} />
              <main className="flex-1 pt-20">
                <Routes>
                  <Route path="/" element={<RoleBasedRedirect />} />
                  <Route element={<RestrictedRoute />}>
                    <Route path="/leads" element={<Leads />} />
                    <Route path="/leadstabbed" element={<LeadsTabbed />} />
                    <Route path="/tasks" element={<Tasks />} />
                    <Route path="/reports" element={<Reports />} />
                    <Route path="/informes" element={<Informes />} />
                    <Route path="/informes/:reportId" element={<ReportViewer />} />
                    <Route path="/users" element={<Users />} />
                    <Route path="/oportunidades" element={<Opportunities />} />
                    <Route path="/oportunidades/:id" element={<OpportunityDetails />} />
                    <Route path="/market-dali" element={<MarketDaliPage />} />
                    <Route path="/market-dali/:id" element={<OpportunityDetailPage />} />
                    <Route path="/admin/users" element={<Users />} />
                    <Route path="/admin/reports" element={<PowerBIReportsAdmin />} />
                    <Route path="/gamification" element={<Gamification />} />
                    <Route path="/index" element={<Index />} />
                    <Route path="/comisiones" element={<Comisiones />} />
                    <Route path="/motor-comisiones" element={<MotorComisionesIndex />} />
                    <Route path="/motor-comisiones/compensation-plans" element={<CompensationPlans />} />
                    <Route path="/motor-comisiones/catalogs" element={<Catalogs />} />
                  <Route path="/motor-comisiones/info-gerencial" element={<InfoGerencialComisiones />} />
                  <Route path="/voice-insights" element={<VoiceInsights />} />
                  <Route path="/ficha-360" element={<AdvisorsHome />} />
                  <Route path="/ficha-360/:id" element={<AdvisorProfile />} />
                </Route>
                  <Route path="/perfil" element={<UserProfile />} />
                  <Route path="/graph-callback" element={<GraphCallback />} />
                  <Route path="/login" element={<Login onLogin={() => { }} />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </main>
            </div>

            {/* ChatSami - disponible solo para usuarios con permisos, excepto en página de Users */}
            {hasChatSamiPermissions && !isUsersPage && (
              <ChatSami ref={chatSamiRef} isOpen={chatSamiOpen} onOpenChange={setChatSamiOpen} />
            )}
          </div>
        </SidebarProvider>
      </AuthenticatedTemplate>
    </div>
  );
}
