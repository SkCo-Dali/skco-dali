import React, { createContext, useContext, useEffect, useState } from 'react';
import { AssignableUser, getAssignableUsers } from '@/utils/leadAssignmentApiClient';
import { useAuth } from './AuthContext';

interface AssignableUsersContextType {
  users: AssignableUser[];
  loading: boolean;
  error: string | null;
  refreshUsers: () => Promise<void>;
}

const AssignableUsersContext = createContext<AssignableUsersContextType | undefined>(undefined);

export const useAssignableUsers = () => {
  const context = useContext(AssignableUsersContext);
  if (context === undefined) {
    throw new Error('useAssignableUsers must be used within an AssignableUsersProvider');
  }
  return context;
};

interface AssignableUsersProviderProps {
  children: React.ReactNode;
}

export const AssignableUsersProvider: React.FC<AssignableUsersProviderProps> = ({ children }) => {
  const [users, setUsers] = useState<AssignableUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const loadUsers = async () => {
    if (!user?.id) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const fetchedUsers = await getAssignableUsers();
      setUsers(fetchedUsers);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al cargar usuarios asignables';
      console.error('❌ Error loading assignable users:', errorMessage);
      setError(errorMessage);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, [user?.id]);

  const value: AssignableUsersContextType = {
    users,
    loading,
    error,
    refreshUsers: loadUsers
  };

  return (
    <AssignableUsersContext.Provider value={value}>
      {children}
    </AssignableUsersContext.Provider>
  );
};