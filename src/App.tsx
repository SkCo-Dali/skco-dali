
import React from "react";
import { BrowserRouter as Router } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/contexts/AuthContext";
import { NotificationProvider } from "@/contexts/NotificationContext";
import { SimpleConversationProvider } from "@/contexts/SimpleConversationContext";
import { AppContent } from "@/components/AppContent";
import "./App.css";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <SimpleConversationProvider>
          <NotificationProvider>
            <Router>
              <AppContent />
              <Toaster />
              <SonnerToaster />
            </Router>
          </NotificationProvider>
        </SimpleConversationProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
