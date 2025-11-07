import { AccessDenied } from "@/components/AccessDenied";
import { PageLoading } from "@/components/PageLoading";
import { usePageAccess } from "@/hooks/usePageAccess";

export default function Reports() {
  const { hasAccess, isLoading } = usePageAccess("reports");

  if (isLoading) {
    return <PageLoading />;
  }

  if (!hasAccess) {
    return <AccessDenied />;
  }
  return (
    <div className="min-h-screen p-4">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 md:gap-4 mb-3 md:mb-4">
        <div>
          <h1 className="text-xl md:text-2xl lg:text-3xl font-bold mb-1 text-[#00C73D]">Reporte</h1>
          <p className="text-sm md:text-base text-muted-foreground">Análisis y reportes de tu actividad comercial</p>
        </div>
      </div>

      {/* Embed Power BI Report */}
      <div className="mt-3 md:mt-4 px-2 md:px-0">
        <iframe
          title="Reporte Power BI"
          width="100%"
          height="600"
          className="md:h-[800px]"
          src="https://app.powerbi.com/reportEmbed?reportId=d5017ea9-1327-4357-9cbd-d75321c990b2&autoAuth=true&ctid=08271f42-81ef-45d6-81ac-49776c4be615"
          frameBorder="0"
          allowFullScreen={true}
          allow="fullscreen"
        />
      </div>
    </div>
  );
}
