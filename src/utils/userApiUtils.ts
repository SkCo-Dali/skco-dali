
import { User } from '@/types/crm';
import { assignRoleBasedOnEmail } from './userRoleUtils';

const USERS_STORAGE_KEY = 'skandia-crm-managed-users';

export const loadUsersFromStorage = (): User[] => {
  try {
    const storedUsers = localStorage.getItem(USERS_STORAGE_KEY);
    return storedUsers ? JSON.parse(storedUsers) : [];
  } catch (error) {
    console.error('Error cargando usuarios del almacenamiento:', error);
    return [];
  }
};

export const saveUsersToStorage = (users: User[]): void => {
  try {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
  } catch (error) {
    console.error('Error guardando usuarios en el almacenamiento:', error);
  }
};

export const addUserToStorage = (email: string, role: User['role']): User => {
  const users = loadUsersFromStorage();
  
  // Verificar si el usuario ya existe
  const existingUserIndex = users.findIndex(u => u.email.toLowerCase() === email.toLowerCase());
  
  const newUser: User = {
    id: `user-${Date.now()}`,
    name: email.split('@')[0], // Usar la parte antes del @ como nombre por defecto
    email: email,
    role: role,
    avatar: null,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  if (existingUserIndex >= 0) {
    // Actualizar usuario existente
    users[existingUserIndex] = { ...users[existingUserIndex], role, updatedAt: new Date().toISOString() };
  } else {
    // Agregar nuevo usuario
    users.push(newUser);
  }
  
  saveUsersToStorage(users);
  return existingUserIndex >= 0 ? users[existingUserIndex] : newUser;
};

export const removeUserFromStorage = (userId: string): void => {
  const users = loadUsersFromStorage();
  const filteredUsers = users.filter(u => u.id !== userId);
  saveUsersToStorage(filteredUsers);
};

export const updateUserRoleInStorage = (userId: string, newRole: User['role']): void => {
  const users = loadUsersFromStorage();
  const userIndex = users.findIndex(u => u.id === userId);
  
  if (userIndex >= 0) {
    users[userIndex] = { 
      ...users[userIndex], 
      role: newRole, 
      updatedAt: new Date().toISOString() 
    };
    saveUsersToStorage(users);
  }
};

export const findUserByEmail = (email: string): User | null => {
  const users = loadUsersFromStorage();
  return users.find(u => u.email.toLowerCase() === email.toLowerCase()) || null;
};

// Función para obtener el rol de un usuario por email, si no existe en el storage, usar la función de asignación por defecto
export const getUserRoleByEmail = (email: string): User['role'] => {
  const user = findUserByEmail(email);
  return user ? user.role : assignRoleBasedOnEmail(email);
};
