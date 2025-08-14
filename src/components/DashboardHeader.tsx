
interface DashboardHeaderProps {}

export function DashboardHeader({}: DashboardHeaderProps) {
  return (
    
  
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 md:gap-4 mb-3 md:mb-4">
          <div>
            <h1 className="text-xl md:text-2xl lg:text-3xl font-bold mb-1 text-[#00c83c]">Inicio</h1>
            <p className="text-sm md:text-base text-muted-foreground">
              Resumen de tu actividad comercial
            </p>
          </div>
        </div>
      
  
  );
}

