import { useState, useRef } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Leads from "./Leads";
import { LeadPacCreateDialog, LeadPacCreateDialogRef } from "@/components/LeadPacCreateDialog";
import { LeadCorporateCreateDialog, LeadCorporateCreateDialogRef } from "@/components/LeadCorporateCreateDialog";

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
  
  const pacDialogRef = useRef<LeadPacCreateDialogRef>(null);
  const corporateDialogRef = useRef<LeadCorporateCreateDialogRef>(null);

  // Callbacks para abrir los diálogos de creación desde la página Leads
  const handleOpenPacDialog = () => {
    pacDialogRef.current?.openDialog();
  };

  const handleOpenCorporateDialog = () => {
    corporateDialogRef.current?.openDialog();
  };

  return (
    <div className="flex flex-col h-full">
      <div className="border-b bg-background">
        <div className="px-6 pt-4">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-semibold">Gestión de Leads</h1>
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
              <Leads onCreateLead={handleOpenPacDialog} leadType="pac" />
            </TabsContent>

            <TabsContent value="corporate" className="mt-0">
              <Leads onCreateLead={handleOpenCorporateDialog} leadType="corporate" />
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Diálogos de creación con verificación de NIT */}
      <LeadPacCreateDialog ref={pacDialogRef} />
      <LeadCorporateCreateDialog ref={corporateDialogRef} />
    </div>
  );
}
