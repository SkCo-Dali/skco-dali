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
import { roles } from "@/utils/userRoleUtils";

export default function UsersPage() {
  const { hasAccess, permissions, currentUser } = usePageAccess("users");
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]); // Para los KPIs
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]); // Para filtrado por múltiples roles
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

      // Detectar tipo de búsqueda según el término
      let searchParams: {
        page: number;
        pageSize: number;
        sortBy: "CreatedAt" | "UpdatedAt" | "Name" | "Email" | "Role" | "IsActive";
        sortDir: "asc" | "desc";
        name?: string;
        email?: string;
        role?: string;
        isActive?: boolean;
      } = {
        page: currentPage,
        pageSize: usersPerPage,
        sortBy,
        sortDir,
      };

      // Si hay término de búsqueda, determinar qué buscar
      if (searchTerm) {
        const term = searchTerm.toLowerCase().trim();
        
        // Buscar por email si contiene @
        if (term.includes('@')) {
          searchParams.email = searchTerm;
        }
        // Buscar por estado si dice "activo" o "inactivo"
        else if (term === 'activo' || term === 'active') {
          searchParams.isActive = true;
        }
        else if (term === 'inactivo' || term === 'inactive' || term === 'desactivado') {
          searchParams.isActive = false;
        }
        // Buscar por rol si coincide con algún rol
        else {
          const matchingRole = roles.find(r => 
            r.label.toLowerCase().includes(term) || 
            r.value.toLowerCase().includes(term)
          );
          
          if (matchingRole) {
            searchParams.role = matchingRole.value;
          } else {
            // Si no coincide con nada específico, buscar por nombre
            searchParams.name = searchTerm;
          }
        }
      }

      // Agregar filtro de rol del dropdown si está seleccionado
      if (roleFilter !== "all") {
        searchParams.role = roleFilter;
      }

      const result = await getAllUsers(searchParams);

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
      // Detectar tipo de búsqueda según el término
      let searchParams: {
        page: number;
        pageSize: number;
        sortBy: "CreatedAt" | "UpdatedAt" | "Name" | "Email" | "Role" | "IsActive";
        sortDir: "asc" | "desc";
        name?: string;
        email?: string;
        role?: string;
        isActive?: boolean;
      } = {
        page: 1,
        pageSize: 200,
        sortBy: "CreatedAt",
        sortDir: "desc",
      };

      // Si hay término de búsqueda, determinar qué buscar
      if (searchTerm) {
        const term = searchTerm.toLowerCase().trim();
        
        if (term.includes('@')) {
          searchParams.email = searchTerm;
        }
        else if (term === 'activo' || term === 'active') {
          searchParams.isActive = true;
        }
        else if (term === 'inactivo' || term === 'inactive' || term === 'desactivado') {
          searchParams.isActive = false;
        }
        else {
          const matchingRole = roles.find(r => 
            r.label.toLowerCase().includes(term) || 
            r.value.toLowerCase().includes(term)
          );
          
          if (matchingRole) {
            searchParams.role = matchingRole.value;
          } else {
            searchParams.name = searchTerm;
          }
        }
      }

      // Agregar filtro de rol del dropdown si está seleccionado
      if (roleFilter !== "all") {
        searchParams.role = roleFilter;
      }

      // 1) Primera página para conocer total de páginas
      const first = await getAllUsers(searchParams);

      let aggregated: User[] = [...first.users];

      if (first.totalPages > 1) {
        const requests = [] as Promise<{
          users: User[];
          page: number;
          pageSize: number;
          total: number;
          totalPages: number;
        }>[];

        for (let p = 2; p <= first.totalPages; p++) {
          requests.push(
            getAllUsers({
              ...searchParams,
              page: p,
            })
          );
        }

        const results = await Promise.all(requests);
        results.forEach((r) => {
          aggregated = aggregated.concat(r.users);
        });
      }

      setAllUsers(aggregated);
    } catch (error) {
      console.error("Error loading all users for KPIs:", error);
      // Fallback: usar los usuarios visibles para evitar mostrar 0
      setAllUsers(users);
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
    setSelectedRoles([]); // Limpiar filtro de múltiples roles al usar el dropdown
    setCurrentPage(1);
  };

  const handleKPIRoleFilter = (roles: string[]) => {
    setSelectedRoles(roles);
    setRoleFilter("all"); // Resetear el filtro del dropdown
    setCurrentPage(1);
  };

  // Filtrar usuarios mostrados si hay roles seleccionados desde KPI
  const displayedUsers = selectedRoles.length > 0 
    ? users.filter(user => selectedRoles.includes(user.role))
    : users;

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

        <UsersKPICards 
          users={allUsers} 
          totalUsers={totalUsers}
          onRoleFilter={handleKPIRoleFilter}
          selectedRoles={selectedRoles}
        />
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
            users={displayedUsers}
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
