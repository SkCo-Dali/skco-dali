import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LeadsTabContent } from "@/components/leads-tabbed/LeadsTabContent";
import { LeadType } from "@/types/leadTypes";

export default function LeadsTabbed() {
  const [activeTab, setActiveTab] = useState<LeadType>("generic");

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b">
        <h1 className="text-2xl font-semibold mb-4">Gestión de Leads</h1>
        
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as LeadType)}>
          <TabsList>
            <TabsTrigger value="generic">Leads Genéricos</TabsTrigger>
            <TabsTrigger value="pac">Leads PACs</TabsTrigger>
            <TabsTrigger value="corporate">Leads Corporativos</TabsTrigger>
          </TabsList>

          <TabsContent value="generic" className="mt-4">
            <LeadsTabContent leadType="generic" />
          </TabsContent>

          <TabsContent value="pac" className="mt-4">
            <LeadsTabContent leadType="pac" />
          </TabsContent>

          <TabsContent value="corporate" className="mt-4">
            <LeadsTabContent leadType="corporate" />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
