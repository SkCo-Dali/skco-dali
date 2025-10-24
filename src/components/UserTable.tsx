import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Users } from "lucide-react";
import { User, UserPermissions } from "@/types/crm";
import { ScrollArea } from "@/components/ui/scroll-area";
import { UserTableRow } from "./UserTableRow";

interface UserTableProps {
  users: User[];
  permissions: UserPermissions | null;
  currentUserId: string;
  onRoleUpdate: (userId: string, newRole: User["role"]) => void;
  onUserDelete: (userId: string) => void;
  onUserStatusToggle: (userId: string, isActive: boolean) => void;
  onUserUpdate: (userId: string, name: string, email: string) => void;
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
      <ScrollArea className="max-h-[280px]">
        <div className="max-h-[359px]">
          <Table>
            <TableHeader className="sticky top-0 bg-card z-10">
              <TableRow>
                <TableHead>Usuario</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Rol</TableHead>
                <TableHead>Cargo</TableHead>
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
      </ScrollArea>
    </Card>
  );
}
