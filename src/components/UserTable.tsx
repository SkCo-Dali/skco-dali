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
              <TableHeader className="sticky top-0 bg-card z-10 text-center text-md">
                <TableRow className="h-20">
                  <TableHead>Usuario</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Rol</TableHead>
                  <TableHead>Nombre Preferido</TableHead>
                  <TableHead>Fecha Nacimiento</TableHead>
                  <TableHead>Cód. País</TableHead>
                  <TableHead>WhatsApp</TableHead>
                  <TableHead>ID Agente</TableHead>
                  <TableHead>ID Sociedad</TableHead>
                  <TableHead>ID Promotor</TableHead>
                  <TableHead>ID Aliado</TableHead>
                  <TableHead>WSaler</TableHead>
                  <TableHead>ID Supervisor</TableHead>
                  <TableHead>Límite Email</TableHead>
                  <TableHead>Límite WA</TableHead>
                  <TableHead>Fecha Creación</TableHead>
                  <TableHead>Última Act.</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Acciones</TableHead>
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
