
import React from "react";
import { BrowserRouter as Router } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { NotificationProvider } from "@/contexts/NotificationContext";
import { SimpleConversationProvider } from "@/contexts/SimpleConversationContext";
import { AuthPage } from "@/components/AuthPage";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AppContent } from "@/components/AppContent";
import { useAuth } from "@/contexts/AuthContext";
import "./App.css";

const queryClient = new QueryClient();

function AppRouter() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-80 h-48 mx-auto mb-4 rounded-lg overflow-hidden">
            <video 
              src="https://aistudiojarvis0534199251.blob.core.windows.net/skandia-icons/Dali_.mp4"
              autoPlay
              loop
              muted
              className="w-full h-full object-contain"
            />
          </div>
          <p className="text-gray-600 dark:text-gray-400">Cargando aplicación...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthPage />;
  }

  return (
    <ProtectedRoute>
      <AppContent />
    </ProtectedRoute>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <SimpleConversationProvider>
            <NotificationProvider>
              <Router>
                <AppRouter />
                <Toaster />
                <SonnerToaster />
              </Router>
            </NotificationProvider>
          </SimpleConversationProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
