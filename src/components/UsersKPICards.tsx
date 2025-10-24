import React from "react";
import { User } from "@/types/crm";
import { KPICard } from "@/components/KPICard";
import { Users, UserX, Shield, UserCog } from "lucide-react";

interface UsersKPICardsProps {
  users: User[];
  totalUsers: number;
}

export function UsersKPICards({ users, totalUsers }: UsersKPICardsProps) {
  // Contar usuarios inactivos
  const inactiveUsers = users.filter((user) => !user.isActive).length;
  const inactivePercentage = totalUsers > 0 ? ((inactiveUsers / totalUsers) * 100).toFixed(1) : "0";

  // Contar administradores
  const adminUsers = users.filter((user) => user.role === "admin").length;
  const adminPercentage = totalUsers > 0 ? ((adminUsers / totalUsers) * 100).toFixed(1) : "0";

  // Contar agentes (FP, ejecutivo, promotor, aliado, socio)
  const agentRoles = ["fp", "ejecutivo", "promotor", "aliado", "socio"];
  const agentUsers = users.filter((user) => agentRoles.includes(user.role)).length;
  const agentPercentage = totalUsers > 0 ? ((agentUsers / totalUsers) * 100).toFixed(1) : "0";

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-2">
      <KPICard
        title="Total de Usuarios"
        value={totalUsers.toLocaleString()}
        icon={Users}
        description="Usuarios en el sistema"
      />

      <KPICard
        title="Usuarios Inactivos"
        value={inactiveUsers.toLocaleString()}
        icon={UserX}
        change={`${inactivePercentage}% del total`}
        changeType={inactiveUsers > 0 ? "negative" : "positive"}
        description="Usuarios desactivados"
      />

      <KPICard
        title="Administradores"
        value={adminUsers.toString()}
        icon={Shield}
        change={`${adminPercentage}% del total`}
        changeType="neutral"
        description="Usuarios con rol admin"
      />

      <KPICard
        title="Agentes Comerciales"
        value={agentUsers.toString()}
        icon={UserCog}
        change={`${agentPercentage}% del total`}
        changeType="neutral"
        description="FP, Ejecutivos, Promotores"
      />
    </div>
  );
}
