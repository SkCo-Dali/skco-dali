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
import { useAuth } from '@/contexts/AuthContext';

export function AccessTab() {
  const { getAccessToken } = useAuth();
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
      console.log('🔐 === INICIANDO fetchInitialData ===');
      setLoading(true);
      
      const tokens = await getAccessToken();
      if (!tokens) {
        console.error('❌ No se pudo obtener token de autenticación para fetchInitialData');
        throw new Error('No se pudo obtener token de autenticación');
      }
      
      console.log('🔑 Token obtenido para fetchInitialData:', tokens.idToken.substring(0, 50) + '...');
      
      // Log the API calls details
      console.log('📡 === DETALLES DE LAS LLAMADAS API INICIALES ===');
      console.log('🌐 Endpoints: GET /api/pbi/areas, GET /api/pbi/workspaces, GET /api/pbi/reports');
      console.log('🔐 Authorization Header: Bearer ' + tokens.idToken.substring(0, 50) + '...');
      console.log('📊 Method: GET (x3)');
      console.log('📦 Body: N/A (GET requests)');
      
      const [areasData, workspacesData, reportsData] = await Promise.all([
        powerbiService.getAllAreas(tokens.idToken),
        powerbiService.getAllWorkspaces(tokens.idToken),
        powerbiService.getReports({}, tokens.idToken)
      ]);
      
      console.log('✅ Datos iniciales obtenidos:');
      console.log('  - Areas:', areasData);
      console.log('  - Workspaces:', workspacesData);
      console.log('  - Reportes:', reportsData);
      
      setAreas(areasData.filter(a => a.isActive));
      setWorkspaces(workspacesData.filter(w => w.isActive));
      setReports(reportsData.filter(r => r.isActive));
    } catch (error) {
      console.error('❌ Error fetching initial data:', error);
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
      console.log('🔐 === INICIANDO fetchWorkspaceAccess ===');
      console.log('🔍 Workspace seleccionado:', selectedWorkspace);
      
      const tokens = await getAccessToken();
      if (!tokens) {
        console.error('❌ No se pudo obtener token de autenticación');
        throw new Error('No se pudo obtener token de autenticación');
      }
      
      console.log('🔑 Token obtenido para workspace access:', tokens.idToken.substring(0, 50) + '...');
      
      // Log the API call details
      console.log('📡 === DETALLES DE LA LLAMADA API ===');
      console.log('🌐 Endpoint: GET /api/pbi/workspaces/' + selectedWorkspace + '/access');
      console.log('🔐 Authorization Header: Bearer ' + tokens.idToken.substring(0, 50) + '...');
      console.log('📊 Method: GET');
      console.log('📦 Body: N/A (GET request)');
      
      const access = await powerbiService.getWorkspaceAccess(selectedWorkspace, {}, tokens.idToken);
      
      console.log('✅ Workspace access obtenido:', access);
      setWorkspaceAccess(access);
    } catch (error) {
      console.error('❌ Error fetching workspace access:', error);
    }
  };

  const fetchReportAccess = async () => {
    try {
      console.log('🔐 === INICIANDO fetchReportAccess ===');
      console.log('🔍 Reporte seleccionado:', selectedReport);
      
      const tokens = await getAccessToken();
      if (!tokens) {
        console.error('❌ No se pudo obtener token de autenticación');
        throw new Error('No se pudo obtener token de autenticación');
      }
      
      console.log('🔑 Token obtenido para report access:', tokens.idToken.substring(0, 50) + '...');
      
      // Log the API call details
      console.log('📡 === DETALLES DE LA LLAMADA API ===');
      console.log('🌐 Endpoint: GET /api/pbi/reports/' + selectedReport + '/access');
      console.log('🔐 Authorization Header: Bearer ' + tokens.idToken.substring(0, 50) + '...');
      console.log('📊 Method: GET');
      console.log('📦 Body: N/A (GET request)');
      
      const access = await powerbiService.getReportAccess(selectedReport, {}, tokens.idToken);
      
      console.log('✅ Report access obtenido:', access);
      setReportAccess(access);
    } catch (error) {
      console.error('❌ Error fetching report access:', error);
    }
  };

  const fetchEffectiveAccess = async () => {
    try {
      console.log('🔐 === INICIANDO fetchEffectiveAccess ===');
      console.log('🔍 Reporte para acceso efectivo:', effectiveAccessReport);
      
      const tokens = await getAccessToken();
      if (!tokens) {
        console.error('❌ No se pudo obtener token de autenticación');
        throw new Error('No se pudo obtener token de autenticación');
      }
      
      console.log('🔑 Token obtenido para effective access:', tokens.idToken.substring(0, 50) + '...');
      
      // Log the API call details
      console.log('📡 === DETALLES DE LA LLAMADA API ===');
      console.log('🌐 Endpoint: GET /api/pbi/reports/' + effectiveAccessReport + '/users');
      console.log('🔐 Authorization Header: Bearer ' + tokens.idToken.substring(0, 50) + '...');
      console.log('📊 Method: GET');
      console.log('📦 Body: N/A (GET request)');
      
      const access = await powerbiService.getEffectiveReportUsers(effectiveAccessReport, {}, tokens.idToken);
      
      console.log('✅ Effective access obtenido:', access);
      setEffectiveAccess(access);
    } catch (error) {
      console.error('❌ Error fetching effective access:', error);
    }
  };

  const searchUsers = async () => {
    try {
      console.log('🔐 === INICIANDO searchUsers ===');
      console.log('🔍 Búsqueda de usuario:', userSearch);
      
      const tokens = await getAccessToken();
      if (!tokens) {
        console.error('❌ No se pudo obtener token de autenticación');
        throw new Error('No se pudo obtener token de autenticación');
      }
      
      console.log('🔑 Token obtenido para user search:', tokens.idToken.substring(0, 50) + '...');
      
      // Log the API call details
      console.log('📡 === DETALLES DE LA LLAMADA API ===');
      console.log('🌐 Endpoint: GET /api/users');
      console.log('🔐 Authorization Header: Bearer ' + tokens.idToken.substring(0, 50) + '...');
      console.log('📊 Method: GET');
      console.log('📦 Query params: search=' + userSearch);
      
      const usersData = await powerbiService.getUsers(userSearch, tokens.idToken);
      
      console.log('✅ Usuarios encontrados:', usersData);
      setUsers(usersData);
    } catch (error) {
      console.error('❌ Error searching users:', error);
    }
  };

  const handleGrantWorkspaceAccess = async () => {
    if (!selectedWorkspace || !selectedUser) return;
    
    try {
      console.log('🔐 === INICIANDO handleGrantWorkspaceAccess ===');
      console.log('🔍 Workspace:', selectedWorkspace);
      console.log('🔍 Usuario:', selectedUser);
      
      const tokens = await getAccessToken();
      if (!tokens) {
        console.error('❌ No se pudo obtener token de autenticación');
        throw new Error('No se pudo obtener token de autenticación');
      }
      
      console.log('🔑 Token obtenido para grant workspace access:', tokens.idToken.substring(0, 50) + '...');
      
      // Log the API call details
      console.log('📡 === DETALLES DE LA LLAMADA API ===');
      console.log('🌐 Endpoint: POST /api/pbi/workspaces/' + selectedWorkspace + '/access');
      console.log('🔐 Authorization Header: Bearer ' + tokens.idToken.substring(0, 50) + '...');
      console.log('📊 Method: POST');
      console.log('📦 Body:', { userId: selectedUser });
      
      await powerbiService.grantWorkspaceAccess(selectedWorkspace, selectedUser, undefined, tokens.idToken);
      
      console.log('✅ Acceso a workspace concedido correctamente');
      toast({
        title: "Éxito",
        description: "Acceso concedido correctamente"
      });
      await fetchWorkspaceAccess();
      setShowGrantWorkspaceDialog(false);
      setSelectedUser('');
      setUserSearch('');
    } catch (error: any) {
      console.error('❌ Error granting workspace access:', error);
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
      console.log('🔐 === INICIANDO handleRevokeWorkspaceAccess ===');
      console.log('🔍 Workspace:', selectedWorkspace);
      console.log('🔍 Usuario:', userId, userName);
      
      const tokens = await getAccessToken();
      if (!tokens) {
        console.error('❌ No se pudo obtener token de autenticación');
        throw new Error('No se pudo obtener token de autenticación');
      }
      
      console.log('🔑 Token obtenido para revoke workspace access:', tokens.idToken.substring(0, 50) + '...');
      
      // Log the API call details
      console.log('📡 === DETALLES DE LA LLAMADA API ===');
      console.log('🌐 Endpoint: DELETE /api/pbi/workspaces/' + selectedWorkspace + '/access/' + userId);
      console.log('🔐 Authorization Header: Bearer ' + tokens.idToken.substring(0, 50) + '...');
      console.log('📊 Method: DELETE');
      console.log('📦 Body: N/A (DELETE request)');
      
      await powerbiService.revokeWorkspaceAccess(selectedWorkspace, userId, tokens.idToken);
      
      console.log('✅ Acceso a workspace revocado correctamente');
      toast({
        title: "Éxito",
        description: "Acceso revocado correctamente"
      });
      await fetchWorkspaceAccess();
    } catch (error) {
      console.error('❌ Error revoking workspace access:', error);
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
      console.log('🔐 === INICIANDO handleGrantReportAccess ===');
      console.log('🔍 Reporte:', selectedReport);
      console.log('🔍 Usuario:', selectedUser);
      
      const tokens = await getAccessToken();
      if (!tokens) {
        console.error('❌ No se pudo obtener token de autenticación');
        throw new Error('No se pudo obtener token de autenticación');
      }
      
      console.log('🔑 Token obtenido para grant report access:', tokens.idToken.substring(0, 50) + '...');
      
      // Log the API call details
      console.log('📡 === DETALLES DE LA LLAMADA API ===');
      console.log('🌐 Endpoint: POST /api/pbi/reports/' + selectedReport + '/access');
      console.log('🔐 Authorization Header: Bearer ' + tokens.idToken.substring(0, 50) + '...');
      console.log('📊 Method: POST');
      console.log('📦 Body:', { userId: selectedUser });
      
      await powerbiService.grantReportAccess(selectedReport, selectedUser, undefined, tokens.idToken);
      
      console.log('✅ Acceso a reporte concedido correctamente');
      toast({
        title: "Éxito",
        description: "Acceso concedido correctamente"
      });
      await fetchReportAccess();
      setShowGrantReportDialog(false);
      setSelectedUser('');
      setUserSearch('');
    } catch (error: any) {
      console.error('❌ Error granting report access:', error);
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
      console.log('🔐 === INICIANDO handleRevokeReportAccess ===');
      console.log('🔍 Reporte:', selectedReport);
      console.log('🔍 Usuario:', userId, userName);
      
      const tokens = await getAccessToken();
      if (!tokens) {
        console.error('❌ No se pudo obtener token de autenticación');
        throw new Error('No se pudo obtener token de autenticación');
      }
      
      console.log('🔑 Token obtenido para revoke report access:', tokens.idToken.substring(0, 50) + '...');
      
      // Log the API call details
      console.log('📡 === DETALLES DE LA LLAMADA API ===');
      console.log('🌐 Endpoint: DELETE /api/pbi/reports/' + selectedReport + '/access/' + userId);
      console.log('🔐 Authorization Header: Bearer ' + tokens.idToken.substring(0, 50) + '...');
      console.log('📊 Method: DELETE');
      console.log('📦 Body: N/A (DELETE request)');
      
      await powerbiService.revokeReportAccess(selectedReport, userId, tokens.idToken);
      
      console.log('✅ Acceso a reporte revocado correctamente');
      toast({
        title: "Éxito",
        description: "Acceso revocado correctamente"
      });
      await fetchReportAccess();
    } catch (error) {
      console.error('❌ Error revoking report access:', error);
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