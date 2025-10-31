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
import { useUsersApi } from "@/hooks/useUsersApi";
import { getAllUsers, createUser, deleteUser, updateUser, toggleUserStatus } from "@/utils/userApiClient";
import { roles } from "@/utils/userRoleUtils";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp } from "lucide-react";

export default function UsersPage() {
  const { hasAccess, permissions, currentUser } = usePageAccess("users");
  const { toast } = useToast();
  const [allUsers, setAllUsers] = useState<User[]>([]); // Para los KPIs - siempre todos los usuarios
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]); // Para la tabla cuando hay múltiples roles
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [kpiRoleFilters, setKpiRoleFilters] = useState<string[]>([]); // Filtros múltiples desde KPI Cards
  const [sortBy, setSortBy] = useState<"CreatedAt" | "UpdatedAt" | "Name" | "Email" | "Role" | "IsActive">("UpdatedAt");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [showKPIs, setShowKPIs] = useState(true); // Mostrar KPIs por defecto

  // Construir filtros dinámicos basados en el searchTerm y filtros activos
  const getFiltersFromSearch = () => {
    const filters: any = {
      sortBy,
      sortDir,
      // Limpiar explícitamente los filtros de búsqueda cuando searchTerm está vacío
      name: undefined,
      email: undefined,
      isActive: undefined,
    };

    if (searchTerm && searchTerm.trim()) {
      const term = searchTerm.toLowerCase().trim();

      if (term.includes("@")) {
        filters.email = searchTerm;
      } else if (term === "activo" || term === "active") {
        filters.isActive = true;
      } else if (term === "inactivo" || term === "inactive" || term === "desactivado") {
        filters.isActive = false;
      } else {
        const matchingRole = roles.find(
          (r) => r.label.toLowerCase().includes(term) || r.value.toLowerCase().includes(term),
        );

        if (matchingRole) {
          filters.role = matchingRole.value;
        } else {
          filters.name = searchTerm;
        }
      }
    }

    // Priorizar filtro de KPI sobre filtro de dropdown
    // Si hay múltiples roles desde KPI, usar el primero (la lógica de múltiples roles se maneja aparte)
    if (kpiRoleFilters.length === 1) {
      filters.role = kpiRoleFilters[0];
    } else if (roleFilter !== "all") {
      filters.role = roleFilter;
    } else {
      // Si no hay filtro de rol, limpiarlo explícitamente
      filters.role = undefined;
    }

    return filters;
  };

  // Usar el hook para manejar la paginación
  const { users, loading, error, totalUsers, totalPages, currentPage, refreshUsers, setPage, setPageSize, setFilters } =
    useUsersApi({
      page: 1,
      pageSize: 50,
      sortBy: "UpdatedAt",
      sortDir: "desc",
    });

  // Verificar permisos de acceso
  if (!hasAccess || !permissions?.canAccessUserManagement) {
    return <AccessDenied message="No tienes permisos para acceder a la gestión de usuarios." />;
  }

  // Aplicar filtros cuando cambian (solo para filtro simple o dropdown)
  useEffect(() => {
    // Solo aplicar filtros normales si no hay múltiples roles seleccionados desde KPI
    if (kpiRoleFilters.length <= 1) {
      const filters = getFiltersFromSearch();
      setFilters(filters);
    }
  }, [searchTerm, roleFilter, kpiRoleFilters, sortBy, sortDir]);

  // Cargar todos los usuarios para KPIs (separado de la paginación)
  // IMPORTANTE: Siempre carga TODOS los usuarios sin filtros para que los KPIs sean correctos
  const loadAllUsersForKPIs = async () => {
    try {
      const searchParams = {
        page: 1,
        pageSize: 200,
        sortBy: "CreatedAt" as const,
        sortDir: "desc" as const,
        // NO aplicar filtros aquí - queremos TODOS los usuarios para los KPIs
      };

      const first = await getAllUsers(searchParams);
      let aggregated: User[] = [...first.users];

      if (first.totalPages > 1) {
        const requests = [];
        for (let p = 2; p <= first.totalPages; p++) {
          requests.push(getAllUsers({ ...searchParams, page: p }));
        }
        const results = await Promise.all(requests);
        results.forEach((r) => {
          aggregated = aggregated.concat(r.users);
        });
      }

      setAllUsers(aggregated);
    } catch (error) {
      console.error("Error loading all users for KPIs:", error);
      setAllUsers([]);
    }
  };

  // Cargar usuarios con múltiples roles cuando se seleccionan desde KPI
  useEffect(() => {
    const loadUsersWithMultipleRoles = async () => {
      if (kpiRoleFilters.length > 1) {
        try {
          // Hacer llamadas paralelas al API para cada rol
          const allRolePromises = kpiRoleFilters.map((role) =>
            getAllUsers({
              page: 1,
              pageSize: 200, // Cargar suficientes usuarios de cada rol
              sortBy,
              sortDir,
              role,
              ...(searchTerm && { name: searchTerm }),
            }),
          );

          const results = await Promise.all(allRolePromises);

          // Combinar todos los usuarios de los diferentes roles
          const combinedUsers: User[] = [];
          const seenIds = new Set<string>();

          results.forEach((result) => {
            result.users.forEach((user) => {
              if (!seenIds.has(user.id)) {
                seenIds.add(user.id);
                combinedUsers.push(user);
              }
            });
          });

          // Actualizar el estado con los usuarios combinados para la tabla
          setFilteredUsers(combinedUsers);
        } catch (error) {
          console.error("Error loading users with multiple roles:", error);
          toast({
            title: "Error",
            description: "No se pudieron cargar los usuarios filtrados",
            variant: "destructive",
          });
        }
      } else {
        // Limpiar usuarios filtrados cuando no hay múltiples roles
        setFilteredUsers([]);
      }
    };

    loadUsersWithMultipleRoles();
  }, [kpiRoleFilters, searchTerm, sortBy, sortDir]);

  // Cargar todos los usuarios para KPIs al montar el componente
  useEffect(() => {
    loadAllUsersForKPIs();
  }, []); // Solo cargar una vez al inicio

  const handlePageChange = (page: number) => {
    setPage(page);
  };

  const handleUsersPerPageChange = (perPage: number) => {
    setPageSize(perPage);
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
  };

  const handleRoleFilterChange = (value: string) => {
    setRoleFilter(value);
    setKpiRoleFilters([]); // Limpiar filtros de KPI
  };

  const handleKPIRoleFilter = (rolesToFilter: string[]) => {
    if (rolesToFilter.length > 0) {
      setKpiRoleFilters(rolesToFilter);
      setRoleFilter("all"); // Resetear el filtro del dropdown
    } else {
      // Limpiar TODO y volver a página 1 cuando se hace clic en "Total Usuarios"
      setKpiRoleFilters([]);
      setRoleFilter("all");
      setSearchTerm("");
      setFilteredUsers([]); // Limpiar usuarios filtrados
      setPage(1);
      setFilters({
        sortBy,
        sortDir,
        name: undefined,
        email: undefined,
        role: undefined,
        isActive: undefined,
      });
    }
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

      await refreshUsers();
      await loadAllUsersForKPIs();

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
        "fpSac",
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

      await refreshUsers();
      await loadAllUsersForKPIs();

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
      await refreshUsers();
      await loadAllUsersForKPIs();

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
      await refreshUsers();
      await loadAllUsersForKPIs();

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

  const handleUserUpdate = async (
    userId: string,
    updates: {
      name: string;
      email: string;
      preferredName?: string | null;
      whatsappNumber?: string | null;
      countryCodeWhatsApp?: number | null;
      dailyEmailLimit?: number | null;
      dailyWhatsAppLimit?: number | null;
    },
  ) => {
    try {
      const user = users.find((u) => u.id === userId);
      if (!user) return;

      await updateUser(userId, {
        name: updates.name,
        email: updates.email,
        role: user.role,
        isActive: user.isActive ?? true,
        preferredName: updates.preferredName,
        whatsappNumber: updates.whatsappNumber,
        countryCodeWhatsApp: updates.countryCodeWhatsApp,
        dailyEmailLimit: updates.dailyEmailLimit,
        dailyWhatsAppLimit: updates.dailyWhatsAppLimit,
      });

      await refreshUsers();
      await loadAllUsersForKPIs();

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
          <div className="flex items-center gap-3">
            <div>
              <h1 className="text-3xl font-bold text-primary">Gestión de Usuarios</h1>
              <p className="text-muted-foreground text-sm">Administra usuarios y roles del sistema</p>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setShowKPIs(!showKPIs)} className="self-start mt-1">
              {showKPIs ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
            </Button>
          </div>
          {permissions?.canAssignRoles && <AddUserDialog onUserAdd={handleAddUser} />}
        </div>

        {showKPIs && (
          <UsersKPICards
            users={allUsers}
            totalUsers={allUsers.length}
            onRoleFilter={handleKPIRoleFilter}
            selectedRoles={kpiRoleFilters}
          />
        )}
      </div>

      <div className="px-4">
        <UserFilters
          searchTerm={searchTerm}
          setSearchTerm={handleSearchChange}
          roleFilter={roleFilter}
          setRoleFilter={handleRoleFilterChange}
        />
      </div>

      <div className="px-4 flex-1 min-h-0">
        <UserTable
          users={kpiRoleFilters.length > 1 ? filteredUsers : users}
          permissions={permissions}
          currentUserId={currentUser?.id || ""}
          onRoleUpdate={handleRoleUpdate}
          onUserDelete={handleUserDelete}
          onUserStatusToggle={handleUserStatusToggle}
          onUserUpdate={handleUserUpdate}
        />
      </div>

      <div className="flex-shrink-0 mt-2">
        {kpiRoleFilters.length > 1 ? (
          <div className="text-sm text-muted-foreground text-center">
            Mostrando {filteredUsers.length} usuarios con roles: {kpiRoleFilters.join(", ")}
          </div>
        ) : (
          <UsersPagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalUsers={totalUsers}
            usersPerPage={users.length}
            onPageChange={handlePageChange}
            onUsersPerPageChange={handleUsersPerPageChange}
          />
        )}
      </div>
    </div>
  );
}
