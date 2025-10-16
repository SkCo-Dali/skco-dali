
import { useState, useEffect } from 'react';
import { User } from '@/types/crm';
import { getAllUsers } from '@/utils/userApiClient';
import { useAuth } from '@/contexts/AuthContext';

export const useUsersApi = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const loadUsers = async () => {
    if (!user?.id) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const fetchedUsers = await getAllUsers();
      setUsers(fetchedUsers);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al cargar usuarios';
      console.error('❌ Error loading users:', errorMessage);
      setError(errorMessage);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, [user?.id]);

  return {
    users,
    loading,
    error,
    refreshUsers: loadUsers
  };
};
