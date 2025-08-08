
export default function Reports() {
  return (
    <div className="min-h-screen pt-0">
      <div className="p-3 md:p-4">
        <h1 className="text-xl md:text-2xl lg:text-3xl font-bold mb-1 tracking-tight text-[#00c83c]">Reportes</h1>
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
          src="https://app.powerbi.com/reportEmbed?reportId=363d09bb-acfb-4067-9d4b-de17ed0c7e3c&autoAuth=true&ctid=08271f42-81ef-45d6-81ac-49776c4be615"
          frameBorder="0"
          allowFullScreen={true}
          allow="fullscreen"
        />
      </div>
    </div>
  );
}
