import { Card } from "@/components/ui/card";
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { User, UserPermissions } from "@/types/crm";
import { UserTableRow } from "./UserTableRow";

interface UserTableProps {
  users: User[];
  permissions: UserPermissions | null;
  currentUserId: string;
  onRoleUpdate: (userId: string, newRole: User["role"]) => void;
  onUserDelete: (userId: string) => void;
  onUserStatusToggle: (userId: string, isActive: boolean) => void;
  onUserUpdate: (
    userId: string,
    updates: {
      name: string;
      email: string;
      role: User["role"];
      preferredName?: string | null;
      whatsappNumber?: string | null;
      countryCodeWhatsApp?: number | null;
      dailyEmailLimit?: number | null;
      dailyWhatsAppLimit?: number | null;
    },
  ) => void;
}

export function UserTable({
  users,
  permissions,
  currentUserId,
  onRoleUpdate,
  onUserDelete,
  onUserStatusToggle,
  onUserUpdate,
}: UserTableProps) {
  return (
    <Card className="flex flex-col h-full">
      <div className="leads-table-container-scroll">
        <div className="leads-table-scroll-wrapper shadow-sm border">
          <div className="leads-table-inner-scroll">
            <Table className="w-full">
              <TableHeader className="sticky top-0 bg-card z-10">
                <TableRow className="h-18 text-center text-md">
                  <TableHead className="text-center text-md">Usuario</TableHead>
                  <TableHead className="text-center text-md">Email</TableHead>
                  <TableHead className="text-center text-md">Rol</TableHead>
                  <TableHead className="text-center text-md">Nombre Preferido</TableHead>
                  <TableHead className="text-center text-md">Fecha Nacimiento</TableHead>
                  <TableHead className="text-center text-md">Cód. País</TableHead>
                  <TableHead className="text-center text-md">WhatsApp</TableHead>
                  <TableHead className="text-center text-md">ID Agente</TableHead>
                  <TableHead className="text-center text-md">ID Sociedad</TableHead>
                  <TableHead className="text-center text-md">ID Promotor</TableHead>
                  <TableHead className="text-center text-md">ID Aliado</TableHead>
                  <TableHead className="text-center text-md">WSaler</TableHead>
                  <TableHead className="text-center text-md">ID Supervisor</TableHead>
                  <TableHead className="text-center text-md">Límite Email</TableHead>
                  <TableHead className="text-center text-md">Límite WA</TableHead>
                  <TableHead className="text-center text-md">Fecha Creación</TableHead>
                  <TableHead className="text-center text-md">Última Act.</TableHead>
                  <TableHead className="text-center text-md">Estado</TableHead>
                  <TableHead className="text-center text-md">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="max-h-[300px]">
                {users.map((user) => (
                  <UserTableRow
                    key={user.id}
                    user={user}
                    permissions={permissions}
                    currentUserId={currentUserId}
                    onRoleUpdate={onRoleUpdate}
                    onUserDelete={onUserDelete}
                    onUserStatusToggle={onUserStatusToggle}
                    onUserUpdate={onUserUpdate}
                  />
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </Card>
  );
}
