import React, { useState, useEffect } from 'react';
import { Users, UserPlus, UserMinus, Search, Eye, Shield } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { powerbiService } from '@/services/powerbiService';
import { Area, Workspace, Report, UserAccess } from '@/types/powerbi';
import { toast } from '@/hooks/use-toast';

export function AccessTab() {
  const [areas, setAreas] = useState<Area[]>([]);
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('workspace');
  
  // Workspace access
  const [selectedWorkspace, setSelectedWorkspace] = useState<string>('');
  const [workspaceAccess, setWorkspaceAccess] = useState<UserAccess[]>([]);
  const [showGrantWorkspaceDialog, setShowGrantWorkspaceDialog] = useState(false);
  
  // Report access
  const [selectedReport, setSelectedReport] = useState<string>('');
  const [reportAccess, setReportAccess] = useState<UserAccess[]>([]);
  const [showGrantReportDialog, setShowGrantReportDialog] = useState(false);
  
  // Effective access
  const [effectiveAccessReport, setEffectiveAccessReport] = useState<string>('');
  const [effectiveAccess, setEffectiveAccess] = useState<UserAccess[]>([]);
  
  // Grant access form
  const [selectedUser, setSelectedUser] = useState<string>('');
  const [userSearch, setUserSearch] = useState<string>('');
  
  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (selectedWorkspace) {
      fetchWorkspaceAccess();
    }
  }, [selectedWorkspace]);

  useEffect(() => {
    if (selectedReport) {
      fetchReportAccess();
    }
  }, [selectedReport]);

  useEffect(() => {
    if (effectiveAccessReport) {
      fetchEffectiveAccess();
    }
  }, [effectiveAccessReport]);

  useEffect(() => {
    if (userSearch) {
      searchUsers();
    } else {
      setUsers([]);
    }
  }, [userSearch]);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const [areasData, workspacesData, reportsData] = await Promise.all([
        powerbiService.getAllAreas(),
        powerbiService.getAllWorkspaces(),
        powerbiService.getReports()
      ]);
      
      setAreas(areasData.filter(a => a.isActive));
      setWorkspaces(workspacesData.filter(w => w.isActive));
      setReports(reportsData.filter(r => r.isActive));
    } catch (error) {
      console.error('Error fetching initial data:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los datos",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchWorkspaceAccess = async () => {
    try {
      const access = await powerbiService.getWorkspaceAccess(selectedWorkspace);
      setWorkspaceAccess(access);
    } catch (error) {
      console.error('Error fetching workspace access:', error);
    }
  };

  const fetchReportAccess = async () => {
    try {
      const access = await powerbiService.getReportAccess(selectedReport);
      setReportAccess(access);
    } catch (error) {
      console.error('Error fetching report access:', error);
    }
  };

  const fetchEffectiveAccess = async () => {
    try {
      const access = await powerbiService.getEffectiveReportAccess(effectiveAccessReport);
      setEffectiveAccess(access);
    } catch (error) {
      console.error('Error fetching effective access:', error);
    }
  };

  const searchUsers = async () => {
    try {
      const usersData = await powerbiService.getUsers(userSearch);
      setUsers(usersData);
    } catch (error) {
      console.error('Error searching users:', error);
    }
  };

  const handleGrantWorkspaceAccess = async () => {
    if (!selectedWorkspace || !selectedUser) return;
    
    try {
      await powerbiService.grantWorkspaceAccess(selectedWorkspace, selectedUser);
      toast({
        title: "Éxito",
        description: "Acceso concedido correctamente"
      });
      await fetchWorkspaceAccess();
      setShowGrantWorkspaceDialog(false);
      setSelectedUser('');
      setUserSearch('');
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "No se pudo conceder el acceso",
        variant: "destructive"
      });
    }
  };

  const handleRevokeWorkspaceAccess = async (userId: string, userName: string) => {
    if (!confirm(`¿Estás seguro de que quieres revocar el acceso a ${userName}?`)) {
      return;
    }

    try {
      await powerbiService.revokeWorkspaceAccess(selectedWorkspace, userId);
      toast({
        title: "Éxito",
        description: "Acceso revocado correctamente"
      });
      await fetchWorkspaceAccess();
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo revocar el acceso",
        variant: "destructive"
      });
    }
  };

  const handleGrantReportAccess = async () => {
    if (!selectedReport || !selectedUser) return;
    
    try {
      await powerbiService.grantReportAccess(selectedReport, selectedUser);
      toast({
        title: "Éxito",
        description: "Acceso concedido correctamente"
      });
      await fetchReportAccess();
      setShowGrantReportDialog(false);
      setSelectedUser('');
      setUserSearch('');
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "No se pudo conceder el acceso",
        variant: "destructive"
      });
    }
  };

  const handleRevokeReportAccess = async (userId: string, userName: string) => {
    if (!confirm(`¿Estás seguro de que quieres revocar el acceso a ${userName}?`)) {
      return;
    }

    try {
      await powerbiService.revokeReportAccess(selectedReport, userId);
      toast({
        title: "Éxito",
        description: "Acceso revocado correctamente"
      });
      await fetchReportAccess();
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo revocar el acceso",
        variant: "destructive"
      });
    }
  };

  const getWorkspaceName = (workspaceId: string) => {
    const workspace = workspaces.find(w => w.id === workspaceId);
    return workspace ? workspace.name : 'Workspace no encontrado';
  };

  const getReportName = (reportId: string) => {
    const report = reports.find(r => r.id === reportId);
    return report ? report.name : 'Reporte no encontrado';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-semibold">Gestión de Accesos</h2>
        <p className="text-muted-foreground">
          Administra los permisos de acceso a workspaces y reportes
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="workspace">Acceso por Workspace</TabsTrigger>
          <TabsTrigger value="report">Acceso por Reporte</TabsTrigger>
          <TabsTrigger value="effective">Acceso Efectivo</TabsTrigger>
        </TabsList>

        {/* Workspace Access Tab */}
        <TabsContent value="workspace" className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Select value={selectedWorkspace} onValueChange={setSelectedWorkspace}>
                <SelectTrigger className="w-64">
                  <SelectValue placeholder="Seleccionar workspace" />
                </SelectTrigger>
                <SelectContent>
                  {workspaces.map((workspace) => (
                    <SelectItem key={workspace.id} value={workspace.id}>
                      {workspace.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {selectedWorkspace && (
              <Button onClick={() => setShowGrantWorkspaceDialog(true)}>
                <UserPlus className="h-4 w-4 mr-2" />
                Conceder Acceso
              </Button>
            )}
          </div>

          {selectedWorkspace ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="h-5 w-5" />
                  <span>Usuarios con acceso a {getWorkspaceName(selectedWorkspace)}</span>
                </CardTitle>
                <CardDescription>
                  {workspaceAccess.length} usuario(s) con acceso
                </CardDescription>
              </CardHeader>
              <CardContent>
                {workspaceAccess.length === 0 ? (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">
                      No hay usuarios con acceso a este workspace
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {workspaceAccess.map((access) => (
                      <div key={access.userId} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">{access.userName}</p>
                          <p className="text-sm text-muted-foreground">{access.userEmail}</p>
                          <div className="flex items-center space-x-2 mt-1">
                            <Badge variant="outline">{access.accessLevel}</Badge>
                            <span className="text-xs text-muted-foreground">
                              Concedido: {new Date(access.grantedAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleRevokeWorkspaceAccess(access.userId, access.userName!)}
                          className="text-destructive hover:text-destructive"
                        >
                          <UserMinus className="h-4 w-4 mr-1" />
                          Revocar
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card className="p-8 text-center">
              <Shield className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">
                Selecciona un workspace para ver y gestionar los accesos
              </p>
            </Card>
          )}
        </TabsContent>

        {/* Report Access Tab */}
        <TabsContent value="report" className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Select value={selectedReport} onValueChange={setSelectedReport}>
                <SelectTrigger className="w-64">
                  <SelectValue placeholder="Seleccionar reporte" />
                </SelectTrigger>
                <SelectContent>
                  {reports.map((report) => (
                    <SelectItem key={report.id} value={report.id}>
                      {report.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {selectedReport && (
              <Button onClick={() => setShowGrantReportDialog(true)}>
                <UserPlus className="h-4 w-4 mr-2" />
                Conceder Acceso
              </Button>
            )}
          </div>

          {selectedReport ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="h-5 w-5" />
                  <span>Usuarios con acceso directo a {getReportName(selectedReport)}</span>
                </CardTitle>
                <CardDescription>
                  {reportAccess.length} usuario(s) con acceso directo
                </CardDescription>
              </CardHeader>
              <CardContent>
                {reportAccess.length === 0 ? (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">
                      No hay usuarios con acceso directo a este reporte
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {reportAccess.map((access) => (
                      <div key={access.userId} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">{access.userName}</p>
                          <p className="text-sm text-muted-foreground">{access.userEmail}</p>
                          <div className="flex items-center space-x-2 mt-1">
                            <Badge variant="outline">{access.accessLevel}</Badge>
                            <span className="text-xs text-muted-foreground">
                              Concedido: {new Date(access.grantedAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleRevokeReportAccess(access.userId, access.userName!)}
                          className="text-destructive hover:text-destructive"
                        >
                          <UserMinus className="h-4 w-4 mr-1" />
                          Revocar
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card className="p-8 text-center">
              <Shield className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">
                Selecciona un reporte para ver y gestionar los accesos directos
              </p>
            </Card>
          )}
        </TabsContent>

        {/* Effective Access Tab */}
        <TabsContent value="effective" className="space-y-4">
          <div className="flex items-center space-x-4">
            <Select value={effectiveAccessReport} onValueChange={setEffectiveAccessReport}>
              <SelectTrigger className="w-64">
                <SelectValue placeholder="Seleccionar reporte" />
              </SelectTrigger>
              <SelectContent>
                {reports.map((report) => (
                  <SelectItem key={report.id} value={report.id}>
                    {report.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {effectiveAccessReport ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Eye className="h-5 w-5" />
                  <span>Acceso efectivo a {getReportName(effectiveAccessReport)}</span>
                </CardTitle>
                <CardDescription>
                  Usuarios que pueden acceder al reporte (por workspace + acceso directo)
                </CardDescription>
              </CardHeader>
              <CardContent>
                {effectiveAccess.length === 0 ? (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground">
                      No hay usuarios con acceso efectivo a este reporte
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {effectiveAccess.map((access, index) => (
                      <div key={`${access.userId}-${index}`} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">{access.userName}</p>
                          <p className="text-sm text-muted-foreground">{access.userEmail}</p>
                          <div className="flex items-center space-x-2 mt-1">
                            <Badge variant="outline">{access.accessLevel}</Badge>
                            <Badge variant="secondary">
                              {access.grantedBy === 'workspace' ? 'Via Workspace' : 'Directo'}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card className="p-8 text-center">
              <Eye className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">
                Selecciona un reporte para ver todos los usuarios que tienen acceso
              </p>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Grant Workspace Access Dialog */}
      <Dialog open={showGrantWorkspaceDialog} onOpenChange={setShowGrantWorkspaceDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Conceder Acceso al Workspace</DialogTitle>
            <DialogDescription>
              Concede acceso al workspace "{getWorkspaceName(selectedWorkspace)}"
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="userSearch">Buscar Usuario</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  id="userSearch"
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  placeholder="Buscar por nombre o email..."
                  className="pl-10"
                />
              </div>
            </div>
            
            {users.length > 0 && (
              <div className="space-y-2">
                <Label>Seleccionar Usuario</Label>
                <Select value={selectedUser} onValueChange={setSelectedUser}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar usuario" />
                  </SelectTrigger>
                  <SelectContent>
                    {users.map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.name} ({user.email})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowGrantWorkspaceDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleGrantWorkspaceAccess} disabled={!selectedUser}>
              Conceder Acceso
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Grant Report Access Dialog */}
      <Dialog open={showGrantReportDialog} onOpenChange={setShowGrantReportDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Conceder Acceso al Reporte</DialogTitle>
            <DialogDescription>
              Concede acceso directo al reporte "{getReportName(selectedReport)}"
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="userSearch">Buscar Usuario</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  id="userSearch"
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  placeholder="Buscar por nombre o email..."
                  className="pl-10"
                />
              </div>
            </div>
            
            {users.length > 0 && (
              <div className="space-y-2">
                <Label>Seleccionar Usuario</Label>
                <Select value={selectedUser} onValueChange={setSelectedUser}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar usuario" />
                  </SelectTrigger>
                  <SelectContent>
                    {users.map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.name} ({user.email})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowGrantReportDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleGrantReportAccess} disabled={!selectedUser}>
              Conceder Acceso
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}