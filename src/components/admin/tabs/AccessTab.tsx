import React, { useState, useEffect, useCallback } from 'react';
import { Users, UserPlus, UserMinus, Search, Eye, Shield, Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Area, Workspace, Report, UserAccess } from '@/types/powerbi';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { ENV } from '@/config/environment';

// User type for search results
interface SearchUser {
  Id: string;
  Name: string;
  PreferredName?: string;
  Email: string;
  Role: string;
  IsActive: boolean;
  CreatedAt: string;
  UpdatedAt: string;
}

// Helper function to make API calls
const apiCall = async (endpoint: string, options: RequestInit = {}) => {
  const response = await fetch(endpoint, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API Error ${response.status}: ${errorText}`);
  }

  return response.json();
};

export function AccessTab() {
  const { getAccessToken } = useAuth();
  const [areas, setAreas] = useState<Area[]>([]);
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [foundUsers, setFoundUsers] = useState<SearchUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('workspace');
  
  // Workspace access
  const [selectedWorkspace, setSelectedWorkspace] = useState<string>('');
  const [workspaceAccess, setWorkspaceAccess] = useState<UserAccess[]>([]);
  const [showGrantWorkspaceDialog, setShowGrantWorkspaceDialog] = useState(false);
  
  // Report access
  const [selectedArea, setSelectedArea] = useState<string>('');
  const [selectedReportWorkspace, setSelectedReportWorkspace] = useState<string>('');
  const [selectedReport, setSelectedReport] = useState<string>('');
  const [reportAccess, setReportAccess] = useState<UserAccess[]>([]);
  const [showGrantReportDialog, setShowGrantReportDialog] = useState(false);
  
  // Effective access
  const [effectiveAccessArea, setEffectiveAccessArea] = useState<string>('');
  const [effectiveAccessWorkspace, setEffectiveAccessWorkspace] = useState<string>('');
  const [effectiveAccessReport, setEffectiveAccessReport] = useState<string>('');
  const [effectiveAccess, setEffectiveAccess] = useState<UserAccess[]>([]);
  
  // User search state
  const [selectedUser, setSelectedUser] = useState<string>('');
  const [userSearch, setUserSearch] = useState<string>('');
  const [userSearchLoading, setUserSearchLoading] = useState(false);
  const [userSearchError, setUserSearchError] = useState<string | null>(null);
  const [userSearchSkip, setUserSearchSkip] = useState(0);
  const [hasMoreUsers, setHasMoreUsers] = useState(false);
  const [loadingMoreUsers, setLoadingMoreUsers] = useState(false);

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (selectedWorkspace) {
      fetchWorkspaceAccess();
    }
  }, [selectedWorkspace]);

  useEffect(() => {
    if (selectedArea) {
      fetchWorkspacesByArea(selectedArea);
    }
  }, [selectedArea]);

  useEffect(() => {
    if (selectedReportWorkspace) {
      fetchReportsByWorkspace(selectedReportWorkspace);
    }
  }, [selectedReportWorkspace]);

  useEffect(() => {
    if (selectedReport) {
      fetchReportAccess();
    }
  }, [selectedReport]);

  useEffect(() => {
    if (effectiveAccessArea) {
      fetchWorkspacesByArea(effectiveAccessArea, 'effective');
    }
  }, [effectiveAccessArea]);

  useEffect(() => {
    if (effectiveAccessWorkspace) {
      fetchReportsByWorkspace(effectiveAccessWorkspace, 'effective');
    }
  }, [effectiveAccessWorkspace]);

  useEffect(() => {
    if (effectiveAccessReport) {
      fetchEffectiveAccess();
    }
  }, [effectiveAccessReport]);

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
      console.log('🌐 Endpoints:');
      console.log('  - GET /api/reports/areas?only_active=true&search=&page=1&page_size=200');
      console.log('  - GET /api/reports/workspaces?only_active=true&search=&page=1&page_size=200');
      console.log('🔐 Authorization Header: Bearer ' + tokens.idToken.substring(0, 50) + '...');
      console.log('📊 Method: GET (x2)');
      console.log('📦 Body: N/A (GET requests)');
      
      const [areasResponse, workspacesResponse] = await Promise.all([
        apiCall(`${ENV.CRM_API_BASE_URL}/api/reports/areas?only_active=true&search=&page=1&page_size=200`, {
          headers: { 'Authorization': `Bearer ${tokens.idToken}` }
        }),
        apiCall(`${ENV.CRM_API_BASE_URL}/api/reports/workspaces?only_active=true&search=&page=1&page_size=200`, {
          headers: { 'Authorization': `Bearer ${tokens.idToken}` }
        })
      ]);
      
      console.log('✅ Datos iniciales obtenidos:');
      console.log('  - Areas:', areasResponse);
      console.log('  - Workspaces:', workspacesResponse);
      
      setAreas(areasResponse.items || areasResponse);
      setWorkspaces(workspacesResponse.items || workspacesResponse);
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

  const fetchWorkspacesByArea = async (areaId: string, context: string = 'default') => {
    try {
      console.log(`🔐 === INICIANDO fetchWorkspacesByArea (${context}) ===`);
      console.log('🔍 Area seleccionada:', areaId);
      
      const tokens = await getAccessToken();
      if (!tokens) {
        console.error('❌ No se pudo obtener token de autenticación');
        throw new Error('No se pudo obtener token de autenticación');
      }
      
      console.log('🔑 Token obtenido para workspaces by area:', tokens.idToken.substring(0, 50) + '...');
      
      const endpoint = `${ENV.CRM_API_BASE_URL}/api/reports/workspaces?only_active=true&area_id=${areaId}&search=&page=1&page_size=200`;
      console.log('📡 === DETALLES DE LA LLAMADA API ===');
      console.log('🌐 Endpoint: GET', endpoint);
      console.log('🔐 Authorization Header: Bearer ' + tokens.idToken.substring(0, 50) + '...');
      console.log('📊 Method: GET');
      console.log('📦 Body: N/A (GET request)');
      
      const workspacesResponse = await apiCall(endpoint, {
        headers: { 'Authorization': `Bearer ${tokens.idToken}` }
      });
      
      console.log('✅ Workspaces por área obtenidos:', workspacesResponse);
      
      const workspacesList = workspacesResponse.items || workspacesResponse;
      if (context === 'effective') {
        // Reset dependent selections
        setEffectiveAccessWorkspace('');
        setEffectiveAccessReport('');
        setEffectiveAccess([]);
      } else {
        setSelectedReportWorkspace('');
        setSelectedReport('');
        setReportAccess([]);
        setReports([]);
      }
    } catch (error) {
      console.error(`❌ Error fetching workspaces by area (${context}):`, error);
    }
  };

  const fetchReportsByWorkspace = async (workspaceId: string, context: string = 'default') => {
    try {
      console.log(`🔐 === INICIANDO fetchReportsByWorkspace (${context}) ===`);
      console.log('🔍 Workspace seleccionado:', workspaceId);
      
      const tokens = await getAccessToken();
      if (!tokens) {
        console.error('❌ No se pudo obtener token de autenticación');
        throw new Error('No se pudo obtener token de autenticación');
      }
      
      console.log('🔑 Token obtenido para reports by workspace:', tokens.idToken.substring(0, 50) + '...');
      
      const endpoint = `${ENV.CRM_API_BASE_URL}/api/reports/reports?only_active=true&workspace_id=${workspaceId}&search=&page=1&page_size=200`;
      console.log('📡 === DETALLES DE LA LLAMADA API ===');
      console.log('🌐 Endpoint: GET', endpoint);
      console.log('🔐 Authorization Header: Bearer ' + tokens.idToken.substring(0, 50) + '...');
      console.log('📊 Method: GET');
      console.log('📦 Body: N/A (GET request)');
      
      const reportsResponse = await apiCall(endpoint, {
        headers: { 'Authorization': `Bearer ${tokens.idToken}` }
      });
      
      console.log('✅ Reportes por workspace obtenidos:', reportsResponse);
      
      const reportsList = reportsResponse.items || reportsResponse;
      setReports(reportsList);
      
      if (context === 'effective') {
        setEffectiveAccessReport('');
        setEffectiveAccess([]);
      } else {
        setSelectedReport('');
        setReportAccess([]);
      }
    } catch (error) {
      console.error(`❌ Error fetching reports by workspace (${context}):`, error);
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
      
      const endpoint = `${ENV.CRM_API_BASE_URL}/api/reports/workspaces/${selectedWorkspace}/access?status=&search=&page=1&page_size=50`;
      console.log('📡 === DETALLES DE LA LLAMADA API ===');
      console.log('🌐 Endpoint: GET', endpoint);
      console.log('🔐 Authorization Header: Bearer ' + tokens.idToken.substring(0, 50) + '...');
      console.log('📊 Method: GET');
      console.log('📦 Body: N/A (GET request)');
      
      const accessResponse = await apiCall(endpoint, {
        headers: { 'Authorization': `Bearer ${tokens.idToken}` }
      });
      
      console.log('✅ Workspace access obtenido:', accessResponse);
      setWorkspaceAccess(accessResponse.items || accessResponse);
    } catch (error) {
      console.error('❌ Error fetching workspace access:', error);
      setWorkspaceAccess([]);
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
      
      const endpoint = `${ENV.CRM_API_BASE_URL}/api/reports/reports/${selectedReport}/access?status=&search=&page=1&page_size=50`;
      console.log('📡 === DETALLES DE LA LLAMADA API ===');
      console.log('🌐 Endpoint: GET', endpoint);
      console.log('🔐 Authorization Header: Bearer ' + tokens.idToken.substring(0, 50) + '...');
      console.log('📊 Method: GET');
      console.log('📦 Body: N/A (GET request)');
      
      const accessResponse = await apiCall(endpoint, {
        headers: { 'Authorization': `Bearer ${tokens.idToken}` }
      });
      
      console.log('✅ Report access obtenido:', accessResponse);
      setReportAccess(accessResponse.items || accessResponse);
    } catch (error) {
      console.error('❌ Error fetching report access:', error);
      setReportAccess([]);
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
      
      const endpoint = `${ENV.CRM_API_BASE_URL}/api/reports/effective/reports/${effectiveAccessReport}/users?only_active_users=true&search=&page=1&page_size=50`;
      console.log('📡 === DETALLES DE LA LLAMADA API ===');
      console.log('🌐 Endpoint: GET', endpoint);
      console.log('🔐 Authorization Header: Bearer ' + tokens.idToken.substring(0, 50) + '...');
      console.log('📊 Method: GET');
      console.log('📦 Body: N/A (GET request)');
      
      const accessResponse = await apiCall(endpoint, {
        headers: { 'Authorization': `Bearer ${tokens.idToken}` }
      });
      
      console.log('✅ Effective access obtenido:', accessResponse);
      setEffectiveAccess(accessResponse.items || accessResponse);
    } catch (error) {
      console.error('❌ Error fetching effective access:', error);
      setEffectiveAccess([]);
    }
  };

  // Fetch all users once and implement client-side filtering
  const [allUsers, setAllUsers] = useState<SearchUser[]>([]);
  const [usersLoaded, setUsersLoaded] = useState(false);

  const fetchAllUsers = useCallback(async () => {
    if (usersLoaded) return;
    
    try {
      setUserSearchLoading(true);
      setUserSearchError(null);

      console.log('🔐 === INICIANDO fetchAllUsers ===');
      
      const tokens = await getAccessToken();
      if (!tokens) {
        console.error('❌ No se pudo obtener token de autenticación');
        throw new Error('No se pudo obtener token de autenticación');
      }
      
      console.log('🔑 Token obtenido para fetch all users:', tokens.idToken.substring(0, 50) + '...');
      
      const endpoint = `${ENV.CRM_API_BASE_URL}/api/users/list`;
      console.log('📡 === DETALLES DE LA LLAMADA API ===');
      console.log('🌐 Endpoint: GET', endpoint);
      console.log('🔐 Authorization Header: Bearer ' + tokens.idToken.substring(0, 50) + '...');
      console.log('📊 Method: GET');
      console.log('📦 Body: N/A (GET request)');
      
      const usersResponse = await apiCall(endpoint, {
        headers: { 'Authorization': `Bearer ${tokens.idToken}` }
      });
      
      console.log('✅ Todos los usuarios obtenidos:', usersResponse);
      
      const users = Array.isArray(usersResponse) ? usersResponse : (usersResponse.items || []);
      setAllUsers(users);
      setUsersLoaded(true);
      
    } catch (error: any) {
      console.error('❌ Error fetching all users:', error);
      const errorMessage = error.message.includes('detail') ? 
        JSON.parse(error.message.split(': ')[1]).detail : 
        'Error al cargar usuarios';
      
      setUserSearchError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setUserSearchLoading(false);
    }
  }, [getAccessToken, usersLoaded]);

  // Client-side filtering of users
  const searchUsers = useCallback(() => {
    if (!userSearch || userSearch.length < 2) {
      setFoundUsers([]);
      return;
    }

    const searchTerm = userSearch.toLowerCase().trim();
    const isEmailSearch = searchTerm.includes('@');
    
    const filtered = allUsers.filter(user => {
      if (isEmailSearch) {
        return user.Email?.toLowerCase().includes(searchTerm);
      } else {
        const name = user.PreferredName || user.Name || '';
        return name.toLowerCase().includes(searchTerm);
      }
    });
    
    setFoundUsers(filtered);
    setHasMoreUsers(false); // No pagination needed for client-side filtering
  }, [userSearch, allUsers]);

  // Load all users on component mount
  useEffect(() => {
    fetchAllUsers();
  }, [fetchAllUsers]);

  // Debounced search effect for client-side filtering
  useEffect(() => {
    const timer = setTimeout(() => {
      searchUsers();
    }, 300);

    return () => clearTimeout(timer);
  }, [userSearch, searchUsers]);

  const loadMoreUsers = () => {
    // Not needed anymore since we're doing client-side filtering
    return;
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
      
      const endpoint = `${ENV.CRM_API_BASE_URL}/api/reports/workspaces/${selectedWorkspace}/access/grant`;
      const body = { 
        userId: selectedUser, 
        accessLevel: "view"
      };
      
      console.log('📡 === DETALLES DE LA LLAMADA API ===');
      console.log('🌐 Endpoint: POST', endpoint);
      console.log('🔐 Authorization Header: Bearer ' + tokens.idToken.substring(0, 50) + '...');
      console.log('📊 Method: POST');
      console.log('📦 Body:', body);
      
      await apiCall(endpoint, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${tokens.idToken}` },
        body: JSON.stringify(body)
      });
      
      console.log('✅ Acceso a workspace concedido correctamente');
      toast({
        title: "Éxito",
        description: "Acceso concedido correctamente"
      });
      await fetchWorkspaceAccess();
      setShowGrantWorkspaceDialog(false);
      setSelectedUser('');
      setUserSearch('');
      setFoundUsers([]);
    } catch (error: any) {
      console.error('❌ Error granting workspace access:', error);
      const errorMessage = error.message.includes('detail') ? 
        JSON.parse(error.message.split(': ')[1]).detail : 
        error.message || "No se pudo conceder el acceso";
      toast({
        title: "Error",
        description: errorMessage,
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
      
      const endpoint = `${ENV.CRM_API_BASE_URL}/api/reports/workspaces/${selectedWorkspace}/access/revoke`;
      const body = { userId };
      
      console.log('📡 === DETALLES DE LA LLAMADA API ===');
      console.log('🌐 Endpoint: POST', endpoint);
      console.log('🔐 Authorization Header: Bearer ' + tokens.idToken.substring(0, 50) + '...');
      console.log('📊 Method: POST');
      console.log('📦 Body:', body);
      
      await apiCall(endpoint, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${tokens.idToken}` },
        body: JSON.stringify(body)
      });
      
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
      
      const endpoint = `${ENV.CRM_API_BASE_URL}/api/reports/reports/${selectedReport}/access/grant`;
      const body = { 
        userId: selectedUser, 
        accessLevel: "view"
      };
      
      console.log('📡 === DETALLES DE LA LLAMADA API ===');
      console.log('🌐 Endpoint: POST', endpoint);
      console.log('🔐 Authorization Header: Bearer ' + tokens.idToken.substring(0, 50) + '...');
      console.log('📊 Method: POST');
      console.log('📦 Body:', body);
      
      await apiCall(endpoint, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${tokens.idToken}` },
        body: JSON.stringify(body)
      });
      
      console.log('✅ Acceso a reporte concedido correctamente');
      toast({
        title: "Éxito",
        description: "Acceso concedido correctamente"
      });
      await fetchReportAccess();
      setShowGrantReportDialog(false);
      setSelectedUser('');
      setUserSearch('');
      setFoundUsers([]);
    } catch (error: any) {
      console.error('❌ Error granting report access:', error);
      const errorMessage = error.message.includes('detail') ? 
        JSON.parse(error.message.split(': ')[1]).detail : 
        error.message || "No se pudo conceder el acceso";
      toast({
        title: "Error",
        description: errorMessage,
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
      
      const endpoint = `${ENV.CRM_API_BASE_URL}/api/reports/reports/${selectedReport}/access/revoke`;
      const body = { userId };
      
      console.log('📡 === DETALLES DE LA LLAMADA API ===');
      console.log('🌐 Endpoint: POST', endpoint);
      console.log('🔐 Authorization Header: Bearer ' + tokens.idToken.substring(0, 50) + '...');
      console.log('📊 Method: POST');
      console.log('📦 Body:', body);
      
      await apiCall(endpoint, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${tokens.idToken}` },
        body: JSON.stringify(body)
      });
      
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

          {selectedWorkspace && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="h-5 w-5 mr-2" />
                  Usuarios con Acceso: {getWorkspaceName(selectedWorkspace)}
                </CardTitle>
                <CardDescription>
                  Lista de usuarios que tienen acceso directo al workspace
                </CardDescription>
              </CardHeader>
              <CardContent>
                {workspaceAccess.length === 0 ? (
                  <p className="text-muted-foreground">No hay usuarios con acceso directo</p>
                ) : (
                  <div className="space-y-2">
                    {workspaceAccess.map((access) => (
                      <div key={access.userId} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div>
                            <p className="font-medium">{access.userName || access.userEmail}</p>
                            <p className="text-sm text-muted-foreground">{access.userEmail}</p>
                          </div>
                          <Badge variant="outline">{access.accessLevel}</Badge>
                          {access.expiresAt && (
                            <Badge variant="secondary">
                              Expira: {new Date(access.expiresAt).toLocaleDateString()}
                            </Badge>
                          )}
                        </div>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleRevokeWorkspaceAccess(access.userId, access.userName || access.userEmail || '')}
                        >
                          <UserMinus className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Report Access Tab */}
        <TabsContent value="report" className="space-y-4">
          <div className="grid grid-cols-4 gap-4">
            <Select value={selectedArea} onValueChange={setSelectedArea}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar área" />
              </SelectTrigger>
              <SelectContent>
                {areas.map((area) => (
                  <SelectItem key={area.id} value={area.id}>
                    {area.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedReportWorkspace} onValueChange={setSelectedReportWorkspace} disabled={!selectedArea}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar workspace" />
              </SelectTrigger>
              <SelectContent>
                {workspaces
                  .filter(w => w.areaId === selectedArea)
                  .map((workspace) => (
                    <SelectItem key={workspace.id} value={workspace.id}>
                      {workspace.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>

            <Select value={selectedReport} onValueChange={setSelectedReport} disabled={!selectedReportWorkspace}>
              <SelectTrigger>
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

            {selectedReport && (
              <Button onClick={() => setShowGrantReportDialog(true)}>
                <UserPlus className="h-4 w-4 mr-2" />
                Conceder Acceso
              </Button>
            )}
          </div>

          {selectedReport && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Eye className="h-5 w-5 mr-2" />
                  Usuarios con Acceso: {getReportName(selectedReport)}
                </CardTitle>
                <CardDescription>
                  Lista de usuarios que tienen acceso directo al reporte
                </CardDescription>
              </CardHeader>
              <CardContent>
                {reportAccess.length === 0 ? (
                  <p className="text-muted-foreground">No hay usuarios con acceso directo</p>
                ) : (
                  <div className="space-y-2">
                    {reportAccess.map((access) => (
                      <div key={access.userId} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div>
                            <p className="font-medium">{access.userName || access.userEmail}</p>
                            <p className="text-sm text-muted-foreground">{access.userEmail}</p>
                          </div>
                          <Badge variant="outline">{access.accessLevel}</Badge>
                          {access.expiresAt && (
                            <Badge variant="secondary">
                              Expira: {new Date(access.expiresAt).toLocaleDateString()}
                            </Badge>
                          )}
                        </div>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleRevokeReportAccess(access.userId, access.userName || access.userEmail || '')}
                        >
                          <UserMinus className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Effective Access Tab */}
        <TabsContent value="effective" className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <Select value={effectiveAccessArea} onValueChange={setEffectiveAccessArea}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar área" />
              </SelectTrigger>
              <SelectContent>
                {areas.map((area) => (
                  <SelectItem key={area.id} value={area.id}>
                    {area.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={effectiveAccessWorkspace} onValueChange={setEffectiveAccessWorkspace} disabled={!effectiveAccessArea}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar workspace" />
              </SelectTrigger>
              <SelectContent>
                {workspaces
                  .filter(w => w.areaId === effectiveAccessArea)
                  .map((workspace) => (
                    <SelectItem key={workspace.id} value={workspace.id}>
                      {workspace.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>

            <Select value={effectiveAccessReport} onValueChange={setEffectiveAccessReport} disabled={!effectiveAccessWorkspace}>
              <SelectTrigger>
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

          {effectiveAccessReport && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="h-5 w-5 mr-2" />
                  Acceso Efectivo: {getReportName(effectiveAccessReport)}
                </CardTitle>
                <CardDescription>
                  Todos los usuarios que pueden acceder al reporte (por workspace + acceso directo)
                </CardDescription>
              </CardHeader>
              <CardContent>
                {effectiveAccess.length === 0 ? (
                  <p className="text-muted-foreground">No hay usuarios con acceso</p>
                ) : (
                  <div className="space-y-2">
                    {effectiveAccess.map((access) => (
                      <div key={access.userId} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div>
                            <p className="font-medium">{access.userName || access.userEmail}</p>
                            <p className="text-sm text-muted-foreground">{access.userEmail}</p>
                          </div>
                          <Badge variant="outline">{access.accessLevel}</Badge>
                          <Badge variant={(access as any).source === 'workspace' ? 'default' : 'secondary'}>
                            {(access as any).source === 'workspace' ? 'Por Workspace' : 'Directo'}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
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
              Busca y selecciona un usuario para concederle acceso al workspace seleccionado.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="user-search">Buscar Usuario</Label>
              <div className="relative">
                <Input
                  id="user-search"
                  placeholder="Buscar por nombre o email..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                />
                {userSearchLoading && (
                  <Loader2 className="h-4 w-4 animate-spin absolute right-3 top-3" />
                )}
              </div>
              {userSearchError && (
                <p className="text-sm text-destructive mt-1">{userSearchError}</p>
              )}
            </div>

            {foundUsers.length > 0 && (
              <div>
                <Label>Usuarios Encontrados ({foundUsers.length})</Label>
                <Select value={selectedUser} onValueChange={setSelectedUser}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar usuario" />
                  </SelectTrigger>
                  <SelectContent>
                    {foundUsers.map((user) => (
                      <SelectItem key={user.Id} value={user.Id}>
                        {user.PreferredName || user.Name} · {user.Email}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {userSearch.length >= 2 && !userSearchLoading && foundUsers.length === 0 && !userSearchError && (
              <p className="text-sm text-muted-foreground">No se encontraron usuarios</p>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowGrantWorkspaceDialog(false);
              setSelectedUser('');
              setUserSearch('');
              setFoundUsers([]);
            }}>
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
              Busca y selecciona un usuario para concederle acceso al reporte seleccionado.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="user-search-report">Buscar Usuario</Label>
              <div className="relative">
                <Input
                  id="user-search-report"
                  placeholder="Buscar por nombre o email..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                />
                {userSearchLoading && (
                  <Loader2 className="h-4 w-4 animate-spin absolute right-3 top-3" />
                )}
              </div>
              {userSearchError && (
                <p className="text-sm text-destructive mt-1">{userSearchError}</p>
              )}
            </div>

            {foundUsers.length > 0 && (
              <div>
                <Label>Usuarios Encontrados ({foundUsers.length})</Label>
                <Select value={selectedUser} onValueChange={setSelectedUser}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar usuario" />
                  </SelectTrigger>
                  <SelectContent>
                    {foundUsers.map((user) => (
                      <SelectItem key={user.Id} value={user.Id}>
                        {user.PreferredName || user.Name} · {user.Email}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {userSearch.length >= 2 && !userSearchLoading && foundUsers.length === 0 && !userSearchError && (
              <p className="text-sm text-muted-foreground">No se encontraron usuarios</p>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowGrantReportDialog(false);
              setSelectedUser('');
              setUserSearch('');
              setFoundUsers([]);
            }}>
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