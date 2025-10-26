import React from "react";
import { User } from "@/types/crm";
import { KPICard } from "@/components/KPICard";
import {
  Users,
  Crown,
} from "lucide-react";

interface UsersKPICardsProps {
  users: User[];
  totalUsers: number;
  onRoleFilter: (roles: string[]) => void;
  selectedRoles: string[];
}

export function UsersKPICards({ users, totalUsers, onRoleFilter, selectedRoles }: UsersKPICardsProps) {
  // Administradores
  const admins = users.filter((user) => user.role === "admin").length;
  const adminsPercentage = totalUsers > 0 ? ((admins / totalUsers) * 100).toFixed(1) : "0";

  // Contar usuarios inactivos
  const inactiveUsers = users.filter((user) => !user.isActive).length;

  const isRoleSelected = (roles: string[]) => {
    return roles.length === selectedRoles.length && roles.every((r) => selectedRoles.includes(r));
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 mb-2">
      <div onClick={() => onRoleFilter([])} className="cursor-pointer">
        <KPICard
          title="Total Usuarios"
          value={`${totalUsers.toLocaleString()} (${inactiveUsers} inactivos)`}
          icon={Users}
          description="En el sistema"
        />
      </div>

      <div onClick={() => onRoleFilter(["admin"])} className="cursor-pointer">
        <KPICard
          title="Administradores"
          value={admins.toString()}
          icon={Crown}
          change={`${adminsPercentage}%`}
          changeType="neutral"
          description="Rol admin"
        />
      </div>
    </div>
  );
}
