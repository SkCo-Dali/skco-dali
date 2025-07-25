
import { useState, useEffect } from "react";
import { TableCell, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Trash2, Edit2, Check, X } from "lucide-react";
import { User, UserPermissions, getRoleDisplayName } from "@/types/crm";
import { roles } from "@/utils/userRoleUtils";

interface UserTableRowProps {
  user: User;
  permissions: UserPermissions | null;
  currentUserId: string;
  onRoleUpdate: (userId: string, newRole: User['role']) => void;
  onUserDelete: (userId: string) => void;
  onUserStatusToggle: (userId: string, isActive: boolean) => void;
  onUserUpdate: (userId: string, name: string, email: string) => void;
}

export function UserTableRow({ 
  user, 
  permissions, 
  currentUserId, 
  onRoleUpdate, 
  onUserDelete, 
  onUserStatusToggle,
  onUserUpdate 
}: UserTableRowProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(user.name);
  const [editEmail, setEditEmail] = useState(user.email);
  const isCurrentUser = user.id === currentUserId;

  const handleSaveEdit = () => {
    if (editName.trim() && editEmail.trim()) {
      onUserUpdate(user.id, editName.trim(), editEmail.trim());
      setIsEditing(false);
    }
  };

  const handleCancelEdit = () => {
    setEditName(user.name);
    setEditEmail(user.email);
    setIsEditing(false);
  };

  const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  return (
    <TableRow>
      <TableCell>
        <div className="flex items-center space-x-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user.avatar} />
            <AvatarFallback>
              {user.name.split(" ").map(n => n[0]).join("")}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
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
                {isCurrentUser && (
                  <span className="ml-2 text-xs text-blue-600 font-medium">(Tú)</span>
                )}
              </div>
            )}
          </div>
        </div>
      </TableCell>
      <TableCell>
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
        <Badge variant="outline">
          {getRoleDisplayName(user.role)}
        </Badge>
      </TableCell>
      <TableCell>{user.jobTitle || '-'}</TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          <Badge variant={user.isActive ? "default" : "secondary"}>
            {user.isActive ? 'Activo' : 'Inactivo'}
          </Badge>
          {permissions?.canAssignRoles && !isCurrentUser && (
            <Switch
              checked={user.isActive ?? true}
              onCheckedChange={(checked) => onUserStatusToggle(user.id, checked)}
            />
          )}
        </div>
      </TableCell>
      <TableCell>
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
              {permissions?.canAssignRoles && (
                <Select
                  value={user.role}
                  onValueChange={(newRole: User['role']) => 
                    onRoleUpdate(user.id, newRole)
                  }
                  disabled={isCurrentUser}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map(role => (
                      <SelectItem key={role.value} value={role.value}>
                        {role.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              
              {permissions?.canAssignRoles && !isCurrentUser && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditing(true)}
                    style={{
                      backgroundColor: "#ffffff",
                      border: "1px solid #ffffff",
                      color: "#00c83c",
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.backgroundColor = "#3f3f3f";
                      e.currentTarget.style.color = "#ffffff";
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.backgroundColor = "#ffffff";
                      e.currentTarget.style.color = "#00c83c";
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
                          Esta acción eliminará permanentemente al usuario {user.name} ({user.email}) 
                          del sistema. Esta acción no se puede deshacer.
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
