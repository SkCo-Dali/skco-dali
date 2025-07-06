
interface DashboardHeaderProps {}

export function DashboardHeader({}: DashboardHeaderProps) {
  return (
    
  
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-4">
          <div>
            <h1 className="text-3xl font-bold mb-1 text-[#00c83c]">Inicio</h1>
            <p className="text-muted-foreground">
              Resumen de tu actividad comercial
            </p>
          </div>
        </div>
      
  
  );
}

