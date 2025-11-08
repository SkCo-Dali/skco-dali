
import React, { useEffect } from "react";
import { BrowserRouter as Router } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { MsalProvider } from "@azure/msal-react";
import { AuthProvider } from "@/contexts/AuthContext";
import { NotificationProvider } from "@/contexts/NotificationContext";
import { SimpleConversationProvider } from "@/contexts/SimpleConversationContext";
import { AssignableUsersProvider } from "@/contexts/AssignableUsersContext";
import { AppContent } from "@/components/AppContent";
import "./App.css";
import { IPublicClientApplication } from "@azure/msal-browser";

const queryClient = new QueryClient();
type AppProps = {
    pca: IPublicClientApplication;
};

function App({ pca }: AppProps) {
    useEffect(() => {
        const hasRefreshed = sessionStorage.getItem('auto-refresh-done');
        
        if (!hasRefreshed) {
            const timer = setTimeout(() => {
                sessionStorage.setItem('auto-refresh-done', 'true');
                window.location.reload();
            }, 5000);
            
            return () => clearTimeout(timer);
        }
    }, []);

    return (
        <QueryClientProvider client={queryClient}>
            <ThemeProvider>
                <MsalProvider instance={pca}>
                    <AuthProvider>
                        <NotificationProvider>
                            <AssignableUsersProvider>
                                <SimpleConversationProvider>
                                    <Router>
                                        <AppContent />
                                        <Toaster />
                                        <SonnerToaster />
                                    </Router>
                                </SimpleConversationProvider>
                            </AssignableUsersProvider>
                        </NotificationProvider>
                    </AuthProvider>
                </MsalProvider>
            </ThemeProvider>
        </QueryClientProvider>
    );
}

export default App;
