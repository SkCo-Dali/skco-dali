import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/types/crm';
import { getDefaultPageForRole } from '@/utils/roleDefaultPages';

/**
 * Hook to protect routes based on user roles
 * Redirects to /informes if user doesn't have required role
 */
export const useRequireRole = (...allowedRoles: UserRole[]) => {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/auth', { replace: true });
      return;
    }

    if (!allowedRoles.includes(user.role)) {
      const defaultPage = getDefaultPageForRole(user.role);
      navigate(defaultPage, { replace: true });
      return;
    }
  }, [user, allowedRoles, navigate]);

  const hasRole = user && allowedRoles.includes(user.role);
  
  return {
    hasRole,
    user,
    isLoading: !user
  };
};

/**
 * Check if user has any of the specified roles
 */
export const useHasRole = (...roles: UserRole[]) => {
  const { user } = useAuth();
  return user ? roles.includes(user.role) : false;
};