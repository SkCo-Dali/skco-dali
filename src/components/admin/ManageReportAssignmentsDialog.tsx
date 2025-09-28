import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { X, Plus, Search, Users } from 'lucide-react';
import { Report } from '@/types/powerbi';
import { User } from '@/types/crm';

interface ManageReportAssignmentsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  report: Report;
  onUpdateAssignments: (assignedUsers: string[]) => void;
}

export function ManageReportAssignmentsDialog({ 
  open, 
  onOpenChange, 
  report, 
  onUpdateAssignments 
}: ManageReportAssignmentsDialogProps) {
  const [assignedUsers, setAssignedUsers] = useState<string[]>([]);
  const [availableUsers, setAvailableUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (report) {
      setAssignedUsers([]); // TODO: Fetch from access management API
      fetchAvailableUsers();
    }
  }, [report]);

  const fetchAvailableUsers = async () => {
    try {
      setLoading(true);
      
      // TODO: Replace with actual API call
      // const response = await fetch('/api/users');
      // const users = await response.json();
      
      // Mock users for now
      const mockUsers: User[] = [
        {
          id: '1',
          name: 'Juan Pérez',
          email: 'juan.perez@skandia.com.co',
          role: 'fp',
          avatar: '',
          isActive: true,
          lastLogin: new Date(),
          createdAt: new Date().toISOString()
        },
        {
          id: '2',
          name: 'María García',
          email: 'maria.garcia@skandia.com.co',
          role: 'gestor',
          avatar: '',
          isActive: true,
          lastLogin: new Date(),
          createdAt: new Date().toISOString()
        },
        {
          id: '3',
          name: 'Carlos López',
          email: 'carlos.lopez@skandia.com.co',
          role: 'supervisor',
          avatar: '',
          isActive: true,
          lastLogin: new Date(),
          createdAt: new Date().toISOString()
        }
      ];
      
      setAvailableUsers(mockUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleUserAssignment = (userEmail: string, isAssigned: boolean) => {
    if (isAssigned) {
      setAssignedUsers(prev => [...prev, userEmail]);
    } else {
      setAssignedUsers(prev => prev.filter(email => email !== userEmail));
    }
  };

  const addUserByEmail = () => {
    const email = newUserEmail.trim().toLowerCase();
    if (email && !assignedUsers.includes(email)) {
      setAssignedUsers(prev => [...prev, email]);
      setNewUserEmail('');
    }
  };

  const removeAssignedUser = (userEmail: string) => {
    setAssignedUsers(prev => prev.filter(email => email !== userEmail));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateAssignments(assignedUsers);
  };

  const filteredUsers = availableUsers.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Asignar Usuarios - {report?.name}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Usuarios actualmente asignados */}
          <div className="space-y-2">
            <Label>Usuarios Asignados ({assignedUsers.length})</Label>
            <div className="flex flex-wrap gap-2 min-h-[60px] p-3 border rounded-md bg-gray-50">
              {assignedUsers.length === 0 ? (
                <span className="text-sm text-muted-foreground">No hay usuarios asignados</span>
              ) : (
                assignedUsers.map((userEmail) => {
                  const user = availableUsers.find(u => u.email === userEmail);
                  return (
                    <Badge key={userEmail} variant="secondary" className="flex items-center gap-1">
                      {user ? user.name : userEmail}
                      <X 
                        className="h-3 w-3 cursor-pointer hover:text-red-500" 
                        onClick={() => removeAssignedUser(userEmail)}
                      />
                    </Badge>
                  );
                })
              )}
            </div>
          </div>

          {/* Agregar usuario por email */}
          <div className="space-y-2">
            <Label htmlFor="newUserEmail">Agregar Usuario por Email</Label>
            <div className="flex gap-2">
              <Input
                id="newUserEmail"
                value={newUserEmail}
                onChange={(e) => setNewUserEmail(e.target.value)}
                placeholder="usuario@skandia.com.co"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addUserByEmail())}
              />
              <Button type="button" onClick={addUserByEmail} size="sm">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Buscar y seleccionar usuarios existentes */}
          <div className="space-y-2">
            <Label>Seleccionar de Usuarios Existentes</Label>
            
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar usuarios..."
                className="pl-10"
              />
            </div>

            <div className="max-h-60 overflow-y-auto border rounded-md">
              {loading ? (
                <div className="p-4 text-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#00C73D] mx-auto"></div>
                </div>
              ) : filteredUsers.length === 0 ? (
                <div className="p-4 text-center text-muted-foreground">
                  {searchTerm ? 'No se encontraron usuarios' : 'No hay usuarios disponibles'}
                </div>
              ) : (
                <div className="space-y-2 p-2">
                  {filteredUsers.map((user) => {
                    const isAssigned = assignedUsers.includes(user.email);
                    return (
                      <div 
                        key={user.id} 
                        className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded"
                      >
                        <Checkbox
                          checked={isAssigned}
                          onCheckedChange={(checked) => 
                            toggleUserAssignment(user.email, checked as boolean)
                          }
                        />
                        <div className="flex-1">
                          <div className="font-medium">{user.name}</div>
                          <div className="text-sm text-muted-foreground">{user.email}</div>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {user.role}
                        </Badge>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" className="bg-[#00C73D] hover:bg-[#00C73D]/90">
              Guardar Asignaciones
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}