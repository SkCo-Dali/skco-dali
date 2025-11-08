import { useAuth } from '@/contexts/AuthContext';
import { getRolePermissions } from '@/types/crm';

/**
 * Hook to check if the current user has access to a specific page
 * @param pageName - The page identifier (should match accessiblePages in getRolePermissions)
 * @returns Object with hasAccess boolean and permissions object
 */
export const usePageAccess = (pageName: string) => {
  const { user: currentUser, loading } = useAuth();
  const permissions = currentUser ? getRolePermissions(currentUser.role) : null;
  
  const hasAccess = permissions?.accessiblePages.includes(pageName) ?? false;
  
  return {
    hasAccess,
    permissions,
    currentUser,
    isLoading: loading
  };
};
