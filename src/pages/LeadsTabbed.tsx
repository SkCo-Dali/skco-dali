import { useState, useRef } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Leads from "./Leads";
import { LeadPacCreateDialog, LeadPacCreateDialogRef } from "@/components/LeadPacCreateDialog";
import { LeadCreateDialogRef } from "@/components/LeadCreateDialog";
import { useAuth } from "@/contexts/AuthContext";
import { getRolePermissions } from "@/types/crm";

type LeadTabType = 'generic' | 'pac' | 'corporate';

/**
 * LeadsTabbed - Página de leads con pestañas
 * 
 * Esta página mantiene la funcionalidad completa de la página de Leads original,
 * pero organizada en tres pestañas:
 * - Leads Genéricos
 * - Leads PACs  
 * - Leads Corporativos
 * 
 * Cada pestaña reutiliza completamente la lógica de la página Leads existente.
 * En el futuro, cuando el API soporte filtrado por tipo de lead, se puede 
 * pasar el tipo como prop para filtrar automáticamente.
 */
export default function LeadsTabbed() {
  const [activeTab, setActiveTab] = useState<LeadTabType>("generic");
  const { user } = useAuth();
  const userPermissions = user ? getRolePermissions(user.role) : null;
  
  const pacDialogRef = useRef<LeadPacCreateDialogRef>(null);
  const genericDialogRef = useRef<LeadCreateDialogRef>(null);
  const corporateDialogRef = useRef<LeadCreateDialogRef>(null);

  const handleCreateLead = () => {
    if (activeTab === "pac") {
      pacDialogRef.current?.openDialog();
    } else if (activeTab === "generic") {
      genericDialogRef.current?.openDialog();
    } else if (activeTab === "corporate") {
      corporateDialogRef.current?.openDialog();
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="border-b bg-background">
        <div className="px-6 pt-4">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-semibold">Gestión de Leads</h1>
            
            {userPermissions?.canCreate && (
              <Button onClick={handleCreateLead} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Nuevo Lead {activeTab === "pac" ? "PAC" : activeTab === "corporate" ? "Corporativo" : "Genérico"}
              </Button>
            )}
          </div>
          
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as LeadTabType)}>
            <TabsList>
              <TabsTrigger value="generic">Leads Genéricos</TabsTrigger>
              <TabsTrigger value="pac">Leads PACs</TabsTrigger>
              <TabsTrigger value="corporate">Leads Corporativos</TabsTrigger>
            </TabsList>

            <TabsContent value="generic" className="mt-0">
              <Leads />
            </TabsContent>

            <TabsContent value="pac" className="mt-0">
              <Leads />
            </TabsContent>

            <TabsContent value="corporate" className="mt-0">
              <Leads />
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Diálogos de creación */}
      <LeadPacCreateDialog ref={pacDialogRef} />
    </div>
  );
}
