import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { User } from "@/types/crm";
import { UserFilters } from "@/components/UserFilters";
import { UserTable } from "@/components/UserTable";
import { UsersPagination } from "@/components/UsersPagination";
import { UsersKPICards } from "@/components/UsersKPICards";
import { AddUserDialog } from "@/components/AddUserDialog";
import { AccessDenied } from "@/components/AccessDenied";
import { usePageAccess } from "@/hooks/usePageAccess";
import { getAllUsers, createUser, deleteUser, updateUser, toggleUserStatus } from "@/utils/userApiClient";

export default function UsersPage() {
  const { hasAccess, permissions, currentUser } = usePageAccess("users");
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]); // Para los KPIs
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage, setUsersPerPage] = useState(50);
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [sortBy, setSortBy] = useState<"CreatedAt" | "UpdatedAt" | "Name" | "Email" | "Role" | "IsActive">("UpdatedAt");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  // Verificar permisos de acceso
  if (!hasAccess || !permissions?.canAccessUserManagement) {
    return <AccessDenied message="No tienes permisos para acceder a la gestión de usuarios." />;
  }

  const loadUsers = async () => {
    try {
      setLoading(true);

      const result = await getAllUsers({
        page: currentPage,
        pageSize: usersPerPage,
        sortBy,
        sortDir,
        name: searchTerm || undefined,
        role: roleFilter !== "all" ? roleFilter : undefined,
      });

      setUsers(result.users);
      setTotalUsers(result.total);
      setTotalPages(result.totalPages);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "No se pudieron cargar los usuarios";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadAllUsersForKPIs = async () => {
    try {
      // Cargar todos los usuarios que coincidan con los filtros actuales para los KPIs
      const result = await getAllUsers({
        page: 1,
        pageSize: 10000, // Número grande para obtener todos los usuarios que coincidan con el filtro
        sortBy: "CreatedAt",
        sortDir: "desc",
        name: searchTerm || undefined,
        role: roleFilter !== "all" ? roleFilter : undefined,
      });
      setAllUsers(result.users);
    } catch (error) {
      console.error("Error loading all users for KPIs:", error);
    }
  };

  useEffect(() => {
    loadUsers();
    loadAllUsersForKPIs(); // Cargar KPIs con los mismos filtros
  }, [currentPage, usersPerPage, sortBy, sortDir, searchTerm, roleFilter]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleUsersPerPageChange = (perPage: number) => {
    setUsersPerPage(perPage);
    setCurrentPage(1);
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleRoleFilterChange = (value: string) => {
    setRoleFilter(value);
    setCurrentPage(1);
  };

  const handleAddUser = async (email: string, role: User["role"]) => {
    try {
      // Extraer nombre del email (parte antes del @)
      const name = email.split("@")[0];

      await createUser({
        name,
        email,
        role,
        isActive: true,
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
        variant: "destructive",
      });
    }
  };

  const handleRoleUpdate = async (userId: string, newRole: User["role"]) => {
    try {
      const user = users.find((u) => u.id === userId);
      if (!user) {
        return;
      }

      // Validar que el rol sea válido
      const validRoles = [
        "admin",
        "manager",
        "agent",
        "viewer",
        "seguridad",
        "analista",
        "supervisor",
        "gestor",
        "director",
        "promotor",
        "aliado",
        "socio",
        "fp",
        "ais",
        "ejecutivo",
        "supervisorComisiones",
        "analistaComisiones",
        "serviceDesk",
        "sac",
      ];
      if (!validRoles.includes(newRole)) {
        toast({
          title: "Error",
          description: `Rol inválido: ${newRole}`,
          variant: "destructive",
        });
        return;
      }

      const updateData = {
        name: user.name,
        email: user.email,
        role: newRole,
        isActive: user.isActive ?? true,
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
        description: `No se pudo actualizar el rol: ${error instanceof Error ? error.message : "Error desconocido"}`,
        variant: "destructive",
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
        variant: "destructive",
      });
    }
  };

  const handleUserStatusToggle = async (userId: string, isActive: boolean) => {
    try {
      await toggleUserStatus(userId, isActive);
      await loadUsers();

      toast({
        title: "Estado actualizado",
        description: `Usuario ${isActive ? "activado" : "desactivado"} correctamente`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo actualizar el estado del usuario",
        variant: "destructive",
      });
    }
  };

  const handleUserUpdate = async (userId: string, name: string, email: string) => {
    try {
      const user = users.find((u) => u.id === userId);
      if (!user) return;

      await updateUser(userId, {
        name,
        email,
        role: user.role,
        isActive: user.isActive ?? true,
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
        variant: "destructive",
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
    <div className="min-h-screen pt-0">
      <div className="p-4 pb-2">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-2 mb-4">
          <div>
            <h1 className="text-3xl font-bold text-primary">Gestión de Usuarios</h1>
            <p className="text-muted-foreground text-sm">Administra usuarios y roles del sistema</p>
          </div>
          {permissions?.canAssignRoles && <AddUserDialog onUserAdd={handleAddUser} />}
        </div>

        <UsersKPICards users={allUsers} totalUsers={totalUsers} />
      </div>

      <div className="px-4">
        <UserFilters
          searchTerm={searchTerm}
          setSearchTerm={handleSearchChange}
          roleFilter={roleFilter}
          setRoleFilter={handleRoleFilterChange}
        />
      </div>

      <div className="px-4 pb-4 mt-4 flex flex-col" style={{ height: "calc(100vh - 480px)" }}>
        <div className="flex-1 min-h-0">
          <UserTable
            users={users}
            permissions={permissions}
            currentUserId={currentUser?.id || ""}
            onRoleUpdate={handleRoleUpdate}
            onUserDelete={handleUserDelete}
            onUserStatusToggle={handleUserStatusToggle}
            onUserUpdate={handleUserUpdate}
          />
        </div>

        <div className="flex-shrink-0 mt-2">
          <UsersPagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalUsers={totalUsers}
            usersPerPage={usersPerPage}
            onPageChange={handlePageChange}
            onUsersPerPageChange={handleUsersPerPageChange}
          />
        </div>
      </div>
    </div>
  );
}
