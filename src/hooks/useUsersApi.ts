import { useState, useEffect } from 'react';
import { User } from '@/types/crm';
import { getAllUsers } from '@/utils/userApiClient';
import { useAuth } from '@/contexts/AuthContext';

interface UseUsersApiOptions {
  page?: number;
  pageSize?: number;
  sortBy?: 'CreatedAt' | 'UpdatedAt' | 'Name' | 'Email' | 'Role' | 'IsActive';
  sortDir?: 'asc' | 'desc';
  name?: string;
  email?: string;
  role?: string;
  isActive?: boolean;
}

interface UseUsersApiReturn {
  users: User[];
  loading: boolean;
  error: string | null;
  totalUsers: number;
  totalPages: number;
  currentPage: number;
  refreshUsers: () => Promise<void>;
  setPage: (page: number) => void;
  setPageSize: (size: number) => void;
  setFilters: (filters: Partial<UseUsersApiOptions>) => void;
}

export const useUsersApi = (initialOptions?: UseUsersApiOptions): UseUsersApiReturn => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [options, setOptions] = useState<UseUsersApiOptions>({
    page: 1,
    pageSize: 50,
    sortBy: 'UpdatedAt',
    sortDir: 'desc',
    ...initialOptions
  });
  const { user } = useAuth();

  const loadUsers = async () => {
    if (!user?.id) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const result = await getAllUsers(options);
      
      setUsers(result.users);
      setTotalUsers(result.total);
      setTotalPages(result.totalPages);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al cargar usuarios';
      console.error('❌ Error loading users:', errorMessage);
      setError(errorMessage);
      setUsers([]);
      setTotalUsers(0);
      setTotalPages(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, [user?.id, options.page, options.pageSize, options.sortBy, options.sortDir, options.name, options.email, options.role, options.isActive]);

  const setPage = (page: number) => {
    setOptions(prev => ({ ...prev, page }));
  };

  const setPageSize = (pageSize: number) => {
    setOptions(prev => ({ ...prev, pageSize, page: 1 }));
  };

  const setFilters = (filters: Partial<UseUsersApiOptions>) => {
    setOptions(prev => ({ ...prev, ...filters, page: 1 }));
  };

  return {
    users,
    loading,
    error,
    totalUsers,
    totalPages,
    currentPage: options.page || 1,
    refreshUsers: loadUsers,
    setPage,
    setPageSize,
    setFilters
  };
};
