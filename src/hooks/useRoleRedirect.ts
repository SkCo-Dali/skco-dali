import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { getDefaultPageForRole } from '@/utils/roleDefaultPages';

/**
 * Hook para redirigir automáticamente a la página por defecto del rol
 * cuando el usuario accede a la raíz o login
 */
export const useRoleRedirect = () => {
  const { user, isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (loading) return;
    
    if (isAuthenticated && user) {
      // Solo redirigir si estamos en la página de login o auth
      if (location.pathname === '/login' || location.pathname === '/auth') {
        const defaultPage = getDefaultPageForRole(user.role);
        navigate(defaultPage, { replace: true });
      }
    }
  }, [user, isAuthenticated, loading, navigate, location.pathname]);

  return { user, isAuthenticated, loading };
};
