import { useRef, useEffect, useState } from "react";
import { Routes, Route, Navigate, useLocation, useNavigate } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Header } from "@/components/Header";
import { RoleBasedRedirect } from "@/components/RoleBasedRedirect";
import Dashboard from "@/pages/Dashboard";
import Leads from "@/pages/Leads";
import Tasks from "@/pages/Tasks";
import Reports from "@/pages/Reports";
import Informes from "@/pages/Informes";
import ReportViewer from "@/pages/ReportViewer";
import Users from "@/pages/Users";
import { Opportunities } from "@/pages/Opportunities";
import { OpportunityDetails } from "@/pages/OpportunityDetails";
import ChatDali from "@/pages/ChatDali";
import Gamification from "@/pages/Gamification";
import Index from "@/pages/Index";
import Comisiones from "@/pages/Comisiones";
import MotorComisionesIndex from "@/pages/MotorComisionesIndex";
import CompensationPlans from "@/pages/CompensationPlans";
import Catalogs from "@/pages/Catalogs";
import VoiceInsights from "@/pages/VoiceInsights";
import NotFound from "@/pages/NotFound";
import PowerBIReportsAdmin from "@/components/admin/PowerBIReportsAdmin";
import { useAuth } from "@/contexts/AuthContext";
import { Login } from "@/components/Login";
import { AuthenticatedTemplate, UnauthenticatedTemplate } from "@azure/msal-react";
import ChatSami from "@/components/ChatSami";
import { getRolePermissions } from "@/types/crm";

export function AppContent() {
  const { user, loading } = useAuth();
  const chatDaliRef = useRef<any>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const [chatSamiOpen, setChatSamiOpen] = useState(true);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900" />
      </div>
    );
  }

  const handleBannerMessage = (automaticReply: string) => {
    if (chatDaliRef.current && chatDaliRef.current.handleBannerMessage) {
      chatDaliRef.current.handleBannerMessage(automaticReply);
    } else {
      // Reintentar después de un breve delay si ChatDali no está listo
      setTimeout(() => {
        if (chatDaliRef.current && chatDaliRef.current.handleBannerMessage) {
          chatDaliRef.current.handleBannerMessage(automaticReply);
        }
      }, 1000);
    }
  };

  return (
    <div className="App">
      <UnauthenticatedTemplate>
        <Routes>
          <Route path="/login" element={<Login onLogin={() => {}} />} />
          <Route
            path="*"
            element={
              <Navigate to={`/login`} state={{ from: { query: location.search, path: location.pathname } }} replace />
            }
          />
        </Routes>
      </UnauthenticatedTemplate>
      <AuthenticatedTemplate>
        <SidebarProvider>
          <div className="min-h-screen flex w-full">
            <AppSidebar />
            <div className="flex-1 flex flex-col transition-all duration-300" style={{ marginRight: chatSamiOpen ? '380px' : '0' }}>
              <Header onBannerMessage={handleBannerMessage} />
              <main className="flex-1 pt-20">
                <Routes>
                  <Route path="/" element={<RoleBasedRedirect />} />
                  <Route path="/leads" element={<Leads />} />
                  <Route path="/tasks" element={<Tasks />} />
                  <Route path="/reports" element={<Reports />} />
                  <Route path="/informes" element={<Informes />} />
                  <Route path="/informes/:reportId" element={<ReportViewer />} />
                  <Route path="/users" element={<Users />} />
                  <Route path="/oportunidades" element={<Opportunities />} />
                  <Route path="/oportunidades/:id" element={<OpportunityDetails />} />
                  <Route path="/admin/users" element={<Users />} />
                  <Route path="/admin/reports" element={<PowerBIReportsAdmin />} />
                  <Route path="/chat" element={<ChatDali ref={chatDaliRef} />} />
                  <Route path="/Chat" element={<ChatDali ref={chatDaliRef} />} />
                  <Route path="/gamification" element={<Gamification />} />
                  <Route path="/index" element={<Index />} />
                  <Route path="/comisiones" element={<Comisiones />} />
                  <Route path="/motor-comisiones" element={<MotorComisionesIndex />} />
                  <Route path="/motor-comisiones/compensation-plans" element={<CompensationPlans />} />
                  <Route path="/motor-comisiones/catalogs" element={<Catalogs />} />
                  <Route path="/voice-insights" element={<VoiceInsights />} />
                  <Route path="/login" element={<div />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </main>
            </div>
            
            {/* ChatSami - disponible en todas las páginas */}
            {user && getRolePermissions(user.role)?.chatSami && (
              <ChatSami 
                isOpen={chatSamiOpen}
                onOpenChange={setChatSamiOpen}
              />
            )}
          </div>
        </SidebarProvider>
      </AuthenticatedTemplate>
    </div>
  );
}
