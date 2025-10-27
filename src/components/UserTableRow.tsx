import { useState, useEffect } from "react";
import { TableCell, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Trash2, Edit2, Check, X } from "lucide-react";
import { User, UserPermissions, getRoleDisplayName } from "@/types/crm";
import { roles } from "@/utils/userRoleUtils";

interface UserTableRowProps {
  user: User;
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

export function UserTableRow({
  user,
  permissions,
  currentUserId,
  onRoleUpdate,
  onUserDelete,
  onUserStatusToggle,
  onUserUpdate,
}: UserTableRowProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(user.name);
  const [editEmail, setEditEmail] = useState(user.email);
  const [editPreferredName, setEditPreferredName] = useState(user.preferredName || "");
  const [editWhatsappNumber, setEditWhatsappNumber] = useState(user.whatsappNumber || "");
  const [editCountryCode, setEditCountryCode] = useState(user.countryCodeWhatsApp?.toString() || "57");
  const [editEmailLimit, setEditEmailLimit] = useState(user.dailyEmailLimit?.toString() || "");
  const [editWhatsAppLimit, setEditWhatsAppLimit] = useState(user.dailyWhatsAppLimit?.toString() || "");
  const isCurrentUser = user.id === currentUserId;

  const handleSaveEdit = () => {
    if (editName.trim() && editEmail.trim()) {
      onUserUpdate(user.id, {
        name: editName.trim(),
        email: editEmail.trim(),
        preferredName: editPreferredName.trim() || null,
        whatsappNumber: editWhatsappNumber.trim() || null,
        countryCodeWhatsApp: editCountryCode ? parseInt(editCountryCode) : null,
        dailyEmailLimit: editEmailLimit ? parseInt(editEmailLimit) : null,
        dailyWhatsAppLimit: editWhatsAppLimit ? parseInt(editWhatsAppLimit) : null,
      });
      setIsEditing(false);
    }
  };

  const handleCancelEdit = () => {
    setEditName(user.name);
    setEditEmail(user.email);
    setEditPreferredName(user.preferredName || "");
    setEditWhatsappNumber(user.whatsappNumber || "");
    setEditCountryCode(user.countryCodeWhatsApp?.toString() || "57");
    setEditEmailLimit(user.dailyEmailLimit?.toString() || "");
    setEditWhatsAppLimit(user.dailyWhatsAppLimit?.toString() || "");
    setIsEditing(false);
  };

  const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  return (
    <TableRow>
      <TableCell>
        <div className="flex items-center space-x-4 px-2 h-20">
          <Avatar className="h-10 w-10 mr-2">
            <AvatarImage src={user.avatar} />
            <AvatarFallback>
              {user.name
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 !text-xs !mx-2">
            {isEditing ? (
              <Input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="h-8"
                placeholder="Nombre del usuario"
              />
            ) : (
              <div>
                <span className="font-medium">{user.name}</span>
                {isCurrentUser && <span className="ml-2 text-xs text-blue-600 font-medium">(Tú)</span>}
              </div>
            )}
          </div>
        </div>
      </TableCell>
      <TableCell className="h-8 !text-xs !mx-2">
        {isEditing ? (
          <Input
            type="email"
            value={editEmail}
            onChange={(e) => setEditEmail(e.target.value)}
            className="h-8"
            placeholder="Email del usuario"
          />
        ) : (
          user.email
        )}
      </TableCell>
      <TableCell>
        {permissions?.canAssignRoles && !isCurrentUser ? (
          <Select
            value={user.role}
            onValueChange={(newRole: User["role"]) => onRoleUpdate(user.id, newRole)}
            disabled={isEditing}
          >
            <SelectTrigger className="h-8 w-32 !text-xs !ring-0 !mx-2">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {roles.map((role) => (
                <SelectItem key={role.value} value={role.value}>
                  {role.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : (
          <Badge variant="outline">{getRoleDisplayName(user.role)}</Badge>
        )}
      </TableCell>
      <TableCell className="!text-xs !mx-2">
        {isEditing ? (
          <Input
            value={editPreferredName}
            onChange={(e) => setEditPreferredName(e.target.value)}
            className="h-8"
            placeholder="Nombre preferido"
          />
        ) : (
          user.preferredName || "-"
        )}
      </TableCell>
      <TableCell className="text-xs text-center mx-2">
        {user.birthDate ? new Date(user.birthDate).toLocaleDateString("es-CO") : "-"}
      </TableCell>
      <TableCell className="text-xs text-center mx-2">
        {isEditing ? (
          <Input
            value={editCountryCode}
            onChange={(e) => setEditCountryCode(e.target.value)}
            className="h-8 w-16"
            placeholder="57"
            type="number"
          />
        ) : (
          user.countryCodeWhatsApp || "-"
        )}
      </TableCell>
      <TableCell className="text-xs text-center mx-2">
        {isEditing ? (
          <Input
            value={editWhatsappNumber}
            onChange={(e) => setEditWhatsappNumber(e.target.value)}
            className="h-8"
            placeholder="WhatsApp"
          />
        ) : (
          user.whatsappNumber || "-"
        )}
      </TableCell>
      <TableCell className="text-xs text-center mx-2">{user.idAgte ?? "-"} </TableCell>
      <TableCell className="text-xs text-center mx-2">{user.idSociedad ?? "-"}</TableCell>
      <TableCell className="text-xs text-center mx-2">{user.idPromotor ?? "-"}</TableCell>
      <TableCell className="text-xs text-center mx-2">{user.idAliado ?? "-"}</TableCell>
      <TableCell className="text-xs text-center mx-2">{user.wSaler || "-"}</TableCell>
      <TableCell className="text-xs text-center mx-2">{user.idSupervisor ?? "-"}</TableCell>
      <TableCell className="text-xs text-center mx-2">
        {isEditing ? (
          <Input
            value={editEmailLimit}
            onChange={(e) => setEditEmailLimit(e.target.value)}
            className="h-8 w-20"
            placeholder="100"
            type="number"
          />
        ) : (
          (user.dailyEmailLimit ?? "-")
        )}
      </TableCell>
      <TableCell className="text-xs text-center mx-2">
        {isEditing ? (
          <Input
            value={editWhatsAppLimit}
            onChange={(e) => setEditWhatsAppLimit(e.target.value)}
            className="h-8 w-20"
            placeholder="20"
            type="number"
          />
        ) : (
          (user.dailyWhatsAppLimit ?? "-")
        )}
      </TableCell>
      <TableCell className="text-xs text-center mx-2">
        {user.createdAt ? new Date(user.createdAt).toLocaleDateString("es-CO") : "-"}
      </TableCell>
      <TableCell className="text-xs text-center mx-2">
        {user.updatedAt ? new Date(user.updatedAt).toLocaleDateString("es-CO") : "-"}
      </TableCell>
      <TableCell className="text-xs text-center mx-2">
        <div className="flex items-center gap-2">
          <Badge variant={user.isActive ? "default" : "secondary"}>{user.isActive ? "Activo" : "Inactivo"}</Badge>
          {permissions?.canAssignRoles && !isCurrentUser && (
            <Switch
              checked={user.isActive ?? true}
              onCheckedChange={(checked) => onUserStatusToggle(user.id, checked)}
            />
          )}
        </div>
      </TableCell>
      <TableCell className="text-xs text-center mx-2">
        <div className="flex items-center gap-2">
          {isEditing ? (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={handleSaveEdit}
                disabled={!editName.trim() || !editEmail.trim() || !isValidEmail(editEmail)}
                className="text-green-600 hover:text-green-700"
              >
                <Check className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCancelEdit}
                className="text-gray-600 hover:text-gray-700"
              >
                <X className="h-4 w-4" />
              </Button>
            </>
          ) : (
            <>
              {permissions?.canAssignRoles && !isCurrentUser && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditing(true)}
                    style={{
                      backgroundColor: "#ffffff",
                      border: "1px solid #ffffff",
                      color: "#00C73D",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = "#3f3f3f";
                      e.currentTarget.style.color = "#ffffff";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = "#ffffff";
                      e.currentTarget.style.color = "#00C73D";
                    }}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>¿Eliminar usuario?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Esta acción eliminará permanentemente al usuario {user.name} ({user.email}) del sistema. Esta
                          acción no se puede deshacer.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                          className="bg-red-600 hover:bg-red-700"
                          onClick={() => onUserDelete(user.id)}
                        >
                          Eliminar
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </>
              )}
            </>
          )}
        </div>
      </TableCell>
    </TableRow>
  );
}
