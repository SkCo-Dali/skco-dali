
import React, { useRef } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Header } from "@/components/Header";
import Dashboard from "@/pages/Dashboard";
import { Leads } from "@/pages/Leads";
import Tasks from "@/pages/Tasks";
import Reports from "@/pages/Reports";
import Informes from "@/pages/Informes";
import Users from "@/pages/Users";
import ChatDali from "@/pages/ChatDali";
import Index from "@/pages/Index";
import NotFound from "@/pages/NotFound";
import { useAuth } from "@/contexts/AuthContext";
import { Login } from "@/components/Login";

export function AppContent() {
  const { user, loading } = useAuth();
  const chatDaliRef = useRef<any>(null);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900" />
      </div>
    );
  }

  if (!user) {
    return <Login onLogin={() => {}} />;
  }

  const handleBannerMessage = (automaticReply: string) => {
    console.log('🟣🟣🟣 AppContent: Banner message received:', automaticReply);
    if (chatDaliRef.current && chatDaliRef.current.handleBannerMessage) {
      console.log('🟢🟢🟢 AppContent: Forwarding to ChatDali');
      chatDaliRef.current.handleBannerMessage(automaticReply);
    } else {
      console.log('🔴🔴🔴 AppContent: ChatDali ref not available, will retry...');
      // Reintentar después de un breve delay si ChatDali no está listo
      setTimeout(() => {
        if (chatDaliRef.current && chatDaliRef.current.handleBannerMessage) {
          console.log('🟢🟢🟢 AppContent: Retry successful, forwarding to ChatDali');
          chatDaliRef.current.handleBannerMessage(automaticReply);
        } else {
          console.log('🔴🔴🔴 AppContent: Retry failed, ChatDali still not available');
        }
      }, 1000);
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <div className="flex-1">
          <Header onBannerMessage={handleBannerMessage} />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<Navigate to="/leads" replace />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/leads" element={<Leads />} />
              <Route path="/tasks" element={<Tasks />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/informes" element={<Informes />} />
              <Route path="/users" element={<Users />} />
              <Route path="/admin/users" element={<Users />} />
              <Route path="/chat" element={<ChatDali ref={chatDaliRef} />} />
              <Route path="/Chat" element={<ChatDali ref={chatDaliRef} />} />
              <Route path="/index" element={<Index />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
