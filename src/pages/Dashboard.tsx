
import { DashboardHeader } from "@/components/DashboardHeader";

export default function Dashboard() {
  return (
    <div className="min-h-screen pt-14 md:pt-16">
      <div className="p-3 md:p-4">
        <DashboardHeader />
        
        <div className="flex items-center justify-center h-48 md:h-64">
          <div className="text-center px-4">
            <h2 className="text-lg md:text-xl lg:text-2xl font-semibold text-muted-foreground mb-3 md:mb-4">Bienvenido al sistema CRM</h2>
            <p className="text-sm md:text-base text-muted-foreground">Navega a la sección de Leads para ver el dashboard completo</p>
          </div>
        </div>
      </div>
    </div>
  );
}
