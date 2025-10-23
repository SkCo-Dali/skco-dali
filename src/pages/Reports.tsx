
import { AccessDenied } from "@/components/AccessDenied";
import { usePageAccess } from "@/hooks/usePageAccess";

export default function Reports() {
  const { hasAccess } = usePageAccess("reports");

  if (!hasAccess) {
    return <AccessDenied />;
  }
  return (
    <div className="min-h-screen pt-0">
      <div className="px-4 py-4">
        <h1 className="text-xl md:text-2xl lg:text-3xl font-bold mb-1 tracking-tight text-[#00c73d]">Reporte</h1>
        <p className="text-sm md:text-base text-muted-foreground">
          Análisis y reportes de tu actividad comercial
        </p>
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
