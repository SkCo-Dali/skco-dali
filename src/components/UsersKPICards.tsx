import React from "react";
import { User } from "@/types/crm";
import { KPICard } from "@/components/KPICard";
import { Users, UserX, Briefcase, BadgeCheck, Store, Headphones, ShieldCheck, Calculator, Phone, PhoneCall, Crown } from "lucide-react";

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

  const isRoleSelected = (roles: string[]) => {
    return roles.length === selectedRoles.length && roles.every(r => selectedRoles.includes(r));
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

      <div onClick={() => onRoleFilter(["ejecutivo", "analista"])} className="cursor-pointer">
        <KPICard
          title="Ejecutivos y Analistas"
          value={ejecutivosAnalistas.toString()}
          icon={Briefcase}
          change={`${ejecutivosAnalistasPercentage}%`}
          changeType="neutral"
          description="Administrativos"
        />
      </div>

      <div onClick={() => onRoleFilter(["ais", "promotor", "aliado"])} className="cursor-pointer">
        <KPICard
          title="Canal Seguros"
          value={canalSeguros.toString()}
          icon={BadgeCheck}
          change={`${canalSegurosPercentage}%`}
          changeType="neutral"
          description="AIS, Promotores"
        />
      </div>

      <div onClick={() => onRoleFilter(["fp", "socio", "director", "gestor", "supervisor"])} className="cursor-pointer">
        <KPICard
          title="Canal Agencias"
          value={canalAgencias.toString()}
          icon={Store}
          change={`${canalAgenciasPercentage}%`}
          changeType="neutral"
          description="FP, Socios"
        />
      </div>

      <div onClick={() => onRoleFilter(["serviceDesk"])} className="cursor-pointer">
        <KPICard
          title="Service Desk"
          value={serviceDesk.toString()}
          icon={Headphones}
          change={`${serviceDeskPercentage}%`}
          changeType="neutral"
          description="Soporte"
        />
      </div>

      <div onClick={() => onRoleFilter(["seguridad"])} className="cursor-pointer">
        <KPICard
          title="Seguridad"
          value={seguridad.toString()}
          icon={ShieldCheck}
          change={`${seguridadPercentage}%`}
          changeType="neutral"
          description="Seguridad"
        />
      </div>

      <div onClick={() => onRoleFilter(["analistaComisiones", "supervisorComisiones"])} className="cursor-pointer">
        <KPICard
          title="Comisiones"
          value={comisiones.toString()}
          icon={Calculator}
          change={`${comisionesPercentage}%`}
          changeType="neutral"
          description="Analistas"
        />
      </div>

      <div onClick={() => onRoleFilter(["sac"])} className="cursor-pointer">
        <KPICard
          title="SAC"
          value={sac.toString()}
          icon={Phone}
          change={`${sacPercentage}%`}
          changeType="neutral"
          description="Servicio"
        />
      </div>

      <div onClick={() => onRoleFilter(["fpSac"])} className="cursor-pointer">
        <KPICard
          title="Comerciales SAC"
          value={comercialesSac.toString()}
          icon={PhoneCall}
          change={`${comercialesSacPercentage}%`}
          changeType="neutral"
          description="FP SAC"
        />
      </div>
    </div>
  );
}
