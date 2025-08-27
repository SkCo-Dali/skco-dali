
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Shield } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { User, getRolePermissions } from "@/types/crm";
import { UserFilters } from "@/components/UserFilters";
import { UserTable } from "@/components/UserTable";
import { AddUserDialog } from "@/components/AddUserDialog";
import { 
  getAllUsers,
  createUser,
  deleteUser,
  updateUser,
  toggleUserStatus
} from "@/utils/userApiClient";

export default function UsersPage() {
  const { user: currentUser } = useAuth();
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [loading, setLoading] = useState(true);

  const permissions = currentUser ? getRolePermissions(currentUser.role) : null;

  // Verificar permisos de acceso
  if (!permissions?.canAccessUserManagement) {
    return (
      <div className="container mx-auto py-5">
        <Card>
          <CardContent className="text-center py-5">
            <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Acceso Restringido</h2>
            <p className="text-gray-600">No tienes permisos para acceder a la gestión de usuarios.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const loadUsers = async () => {
    try {
      setLoading(true);
      const allUsers = await getAllUsers();
      setUsers(allUsers);
      setFilteredUsers(allUsers);
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudieron cargar los usuarios",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    let filtered = users;

    if (searchTerm) {
      filtered = filtered.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (roleFilter !== "all") {
      filtered = filtered.filter(user => user.role === roleFilter);
    }

    setFilteredUsers(filtered);
  }, [users, searchTerm, roleFilter]);

  const handleAddUser = async (email: string, role: User['role']) => {
    try {
      // Extraer nombre del email (parte antes del @)
      const name = email.split('@')[0];
      
      await createUser({
        name,
        email,
        role,
        isActive: true
      });
      
      await loadUsers();
      
      toast({
        title: "Usuario agregado",
        description: `Usuario ${email} agregado con rol ${role}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo agregar el usuario",
        variant: "destructive"
      });
    }
  };

  const handleRoleUpdate = async (userId: string, newRole: User['role']) => {
    try {
      const user = users.find(u => u.id === userId);
      if (!user) {
        return;
      }

      // Validar que el rol sea válido
      const validRoles = ['admin', 'seguridad', 'analista', 'supervisor', 'gestor', 'director', 'promotor', 'aliado', 'socio', 'fp'];
      if (!validRoles.includes(newRole)) {
        toast({
          title: "Error",
          description: `Rol inválido: ${newRole}`,
          variant: "destructive"
        });
        return;
      }

      const updateData = {
        name: user.name,
        email: user.email,
        role: newRole,
        isActive: user.isActive ?? true
      };

      await updateUser(userId, updateData);

      await loadUsers();

      toast({
        title: "Éxito",
        description: `Rol actualizado a ${newRole} correctamente`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: `No se pudo actualizar el rol: ${error instanceof Error ? error.message : 'Error desconocido'}`,
        variant: "destructive"
      });
    }
  };

  const handleUserDelete = async (userId: string) => {
    try {
      await deleteUser(userId);
      await loadUsers();

      toast({
        title: "Usuario eliminado",
        description: "Usuario eliminado correctamente",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo eliminar el usuario",
        variant: "destructive"
      });
    }
  };

  const handleUserStatusToggle = async (userId: string, isActive: boolean) => {
    try {
      await toggleUserStatus(userId, isActive);
      await loadUsers();

      toast({
        title: "Estado actualizado",
        description: `Usuario ${isActive ? 'activado' : 'desactivado'} correctamente`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo actualizar el estado del usuario",
        variant: "destructive"
      });
    }
  };

  const handleUserUpdate = async (userId: string, name: string, email: string) => {
    try {
      const user = users.find(u => u.id === userId);
      if (!user) return;

      await updateUser(userId, {
        name,
        email,
        role: user.role,
        isActive: user.isActive ?? true
      });

      await loadUsers();

      toast({
        title: "Usuario actualizado",
        description: "Datos del usuario actualizados correctamente",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudieron actualizar los datos del usuario",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-16">
      <div className="p-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-4">
          <h1 className="text-3xl font-bold mb-1 text-[#00c73d]">Gestión de Usuarios</h1>
          <p className="text-muted-foreground">Administra usuarios y roles del sistema</p>
        </div>
        {permissions?.canAssignRoles && (
          <AddUserDialog onUserAdd={handleAddUser} />
        )}
      </div>

      <UserFilters
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        roleFilter={roleFilter}
        setRoleFilter={setRoleFilter}
      />

      <UserTable
        users={filteredUsers}
        permissions={permissions}
        currentUserId={currentUser?.id || ''}
        onRoleUpdate={handleRoleUpdate}
        onUserDelete={handleUserDelete}
        onUserStatusToggle={handleUserStatusToggle}
        onUserUpdate={handleUserUpdate}
      />
    </div>
  );
}
