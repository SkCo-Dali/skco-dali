
import React from "react";
import { BrowserRouter as Router } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { NotificationProvider } from "@/contexts/NotificationContext";
import { SimpleConversationProvider } from "@/contexts/SimpleConversationContext";
import { AssignableUsersProvider } from "@/contexts/AssignableUsersContext";
import { AppContent } from "@/components/AppContent";
import "./App.css";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <AssignableUsersProvider>
            <SimpleConversationProvider>
              <NotificationProvider>
                <Router>
                  <AppContent />
                  <Toaster />
                  <SonnerToaster />
                </Router>
              </NotificationProvider>
            </SimpleConversationProvider>
          </AssignableUsersProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
