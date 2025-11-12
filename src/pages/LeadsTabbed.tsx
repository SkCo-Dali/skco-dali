import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Leads from "./Leads";

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

  return (
    <div className="flex flex-col h-full">
      <div className="border-b bg-background">
        <div className="px-6 pt-4">
          <h1 className="text-2xl font-semibold mb-4">Gestión de Leads</h1>
          
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
    </div>
  );
}
