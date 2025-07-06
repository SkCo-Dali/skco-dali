
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
      console.log('🔄 Loading users from API...');
      const fetchedUsers = await getAllUsers();
      setUsers(fetchedUsers);
      console.log('✅ Users loaded successfully:', fetchedUsers.length);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al cargar usuarios';
      console.error('❌ Error loading users:', errorMessage);
      setError(errorMessage);
      // Fallback to empty array on error
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
