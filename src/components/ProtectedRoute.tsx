
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full mx-auto mb-4 bg-skandia-green p-2 overflow-hidden">
            <img 
              src="https://aistudiojarvis0534199251.blob.core.windows.net/skandia-icons/DaliLogo.jpg" 
              alt="Dali AI Logo" 
              className="w-full h-full object-contain"
            />
          </div>
          <p className="text-gray-600 dark:text-gray-400">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // Verificar si el usuario está activo
  if (!user.isActive) {
    // Limpiar sesión si el usuario no está activo
    sessionStorage.removeItem('skandia-crm-user');
    sessionStorage.removeItem('authenticated-user-uuid');
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
};
