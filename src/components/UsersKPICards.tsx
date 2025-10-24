import React from "react";
import { User } from "@/types/crm";
import { KPICard } from "@/components/KPICard";
import { Users, UserX, Briefcase, BadgeCheck, Store, Headphones, ShieldCheck, Calculator, Phone, PhoneCall, Crown } from "lucide-react";

interface UsersKPICardsProps {
  users: User[];
  totalUsers: number;
}

export function UsersKPICards({ users, totalUsers }: UsersKPICardsProps) {
  // Administradores
  const admins = users.filter((user) => user.role === "admin").length;
  const adminsPercentage = totalUsers > 0 ? ((admins / totalUsers) * 100).toFixed(1) : "0";

  // Contar usuarios inactivos
  const inactiveUsers = users.filter((user) => !user.isActive).length;
  const inactivePercentage = totalUsers > 0 ? ((inactiveUsers / totalUsers) * 100).toFixed(1) : "0";

  // Ejecutivos y Analistas
  const ejecutivosAnalistasRoles = ["ejecutivo", "analista"];
  const ejecutivosAnalistas = users.filter((user) => ejecutivosAnalistasRoles.includes(user.role)).length;
  const ejecutivosAnalistasPercentage = totalUsers > 0 ? ((ejecutivosAnalistas / totalUsers) * 100).toFixed(1) : "0";

  // Comerciales Canal Seguros
  const canalSegurosRoles = ["ais", "promotor", "aliado"];
  const canalSeguros = users.filter((user) => canalSegurosRoles.includes(user.role)).length;
  const canalSegurosPercentage = totalUsers > 0 ? ((canalSeguros / totalUsers) * 100).toFixed(1) : "0";

  // Comerciales Canal Agencias y Empleados
  const canalAgenciasRoles = ["fp", "socio", "director", "gestor", "supervisor"];
  const canalAgencias = users.filter((user) => canalAgenciasRoles.includes(user.role)).length;
  const canalAgenciasPercentage = totalUsers > 0 ? ((canalAgencias / totalUsers) * 100).toFixed(1) : "0";

  // Service Desk
  const serviceDesk = users.filter((user) => user.role === "serviceDesk").length;
  const serviceDeskPercentage = totalUsers > 0 ? ((serviceDesk / totalUsers) * 100).toFixed(1) : "0";

  // Seguridad
  const seguridad = users.filter((user) => user.role === "seguridad").length;
  const seguridadPercentage = totalUsers > 0 ? ((seguridad / totalUsers) * 100).toFixed(1) : "0";

  // Operaciones de Comisiones
  const comisionesRoles = ["analistaComisiones", "supervisorComisiones"];
  const comisiones = users.filter((user) => comisionesRoles.includes(user.role)).length;
  const comisionesPercentage = totalUsers > 0 ? ((comisiones / totalUsers) * 100).toFixed(1) : "0";

  // SAC
  const sac = users.filter((user) => user.role === "sac").length;
  const sacPercentage = totalUsers > 0 ? ((sac / totalUsers) * 100).toFixed(1) : "0";

  // Comerciales SAC
  const comercialesSac = users.filter((user) => user.role === "fpSac").length;
  const comercialesSacPercentage = totalUsers > 0 ? ((comercialesSac / totalUsers) * 100).toFixed(1) : "0";

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-2 mb-2">
      <KPICard
        title="Total Usuarios"
        value={totalUsers.toLocaleString()}
        icon={Users}
        description="En el sistema"
      />

      <KPICard
        title="Administradores"
        value={admins.toString()}
        icon={Crown}
        change={`${adminsPercentage}%`}
        changeType="neutral"
        description="Rol admin"
      />

      <KPICard
        title="Inactivos"
        value={inactiveUsers.toLocaleString()}
        icon={UserX}
        change={`${inactivePercentage}%`}
        changeType={inactiveUsers > 0 ? "negative" : "positive"}
        description="Desactivados"
      />

      <KPICard
        title="Ejecutivos y Analistas"
        value={ejecutivosAnalistas.toString()}
        icon={Briefcase}
        change={`${ejecutivosAnalistasPercentage}%`}
        changeType="neutral"
        description="Administrativos"
      />

      <KPICard
        title="Canal Seguros"
        value={canalSeguros.toString()}
        icon={BadgeCheck}
        change={`${canalSegurosPercentage}%`}
        changeType="neutral"
        description="AIS, Promotores"
      />

      <KPICard
        title="Canal Agencias"
        value={canalAgencias.toString()}
        icon={Store}
        change={`${canalAgenciasPercentage}%`}
        changeType="neutral"
        description="FP, Socios"
      />

      <KPICard
        title="Service Desk"
        value={serviceDesk.toString()}
        icon={Headphones}
        change={`${serviceDeskPercentage}%`}
        changeType="neutral"
        description="Soporte"
      />

      <KPICard
        title="Seguridad"
        value={seguridad.toString()}
        icon={ShieldCheck}
        change={`${seguridadPercentage}%`}
        changeType="neutral"
        description="Seguridad"
      />

      <KPICard
        title="Comisiones"
        value={comisiones.toString()}
        icon={Calculator}
        change={`${comisionesPercentage}%`}
        changeType="neutral"
        description="Analistas"
      />

      <KPICard
        title="SAC"
        value={sac.toString()}
        icon={Phone}
        change={`${sacPercentage}%`}
        changeType="neutral"
        description="Servicio"
      />

      <KPICard
        title="Comerciales SAC"
        value={comercialesSac.toString()}
        icon={PhoneCall}
        change={`${comercialesSacPercentage}%`}
        changeType="neutral"
        description="FP SAC"
      />
    </div>
  );
}
