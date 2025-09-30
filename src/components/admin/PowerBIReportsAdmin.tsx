import React, { useState } from 'react';
import { Shield } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useRequireRole } from '@/hooks/useRequireRole';
import { AreasTab } from './tabs/AreasTab';
import { WorkspacesTab } from './tabs/WorkspacesTab';
import { ReportsTab } from './tabs/ReportsTab';
import { AccessTab } from './tabs/AccessTab';
import { AuditTab } from './tabs/AuditTab';

export default function PowerBIReportsAdmin() {
  const { hasRole, isLoading } = useRequireRole('admin', 'seguridad');
  const [activeTab, setActiveTab] = useState('areas');

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Access denied
  if (!hasRole) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-8 text-center max-w-md">
          <Shield className="h-12 w-12 mx-auto mb-4 text-destructive" />
          <h3 className="text-lg font-medium mb-2">Acceso Denegado</h3>
          <p className="text-muted-foreground">
            No tienes permisos para acceder a esta sección.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-0">
      <div className="px-4 py-4">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-xl md:text-2xl lg:text-3xl font-bold mb-1 tracking-tight text-primary">
            Administrar Reportes Power BI
          </h1>
          <p className="text-sm md:text-base text-muted-foreground">
            Gestiona áreas, workspaces, reportes, accesos y auditoría del sistema
          </p>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="areas">Áreas</TabsTrigger>
            <TabsTrigger value="workspaces">Workspaces</TabsTrigger>
            <TabsTrigger value="reports">Reportes</TabsTrigger>
            <TabsTrigger value="access">Accesos</TabsTrigger>
            <TabsTrigger value="audit">Auditoría</TabsTrigger>
          </TabsList>

          <TabsContent value="areas" className="space-y-4">
            <AreasTab />
          </TabsContent>

          <TabsContent value="workspaces" className="space-y-4">
            <WorkspacesTab />
          </TabsContent>

          <TabsContent value="reports" className="space-y-4">
            <ReportsTab />
          </TabsContent>

          <TabsContent value="access" className="space-y-4">
            <AccessTab />
          </TabsContent>

          <TabsContent value="audit" className="space-y-4">
            <AuditTab />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}