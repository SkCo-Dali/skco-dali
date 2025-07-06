
import { DashboardHeader } from "@/components/DashboardHeader";

export default function Dashboard() {
  return (
    <div className="min-h-screen pt-16">
      <div className="p-4">
        <DashboardHeader />
        
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <h2 className="text-2xl font-semibold text-muted-foreground mb-4">Bienvenido al sistema CRM</h2>
            <p className="text-muted-foreground">Navega a la sección de Leads para ver el dashboard completo</p>
          </div>
        </div>
      </div>
    </div>
  );
}
