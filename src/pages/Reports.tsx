
export default function Reports() {
  return (
    <div className="min-h-screen pt-16">
      <div className="p-4">
        <h1 className="text-3xl font-bold mb-1 tracking-tight text-[#00c83c]">Reportes</h1>
        <p className="text-muted-foreground">
          Análisis y reportes de tu actividad comercial
        </p>
      </div>

      {/* Embed Power BI Report */}
      <div className="mt-4">
        <iframe
          title="Reporte Power BI"
          width="100%"
          height="800"
          src="https://app.powerbi.com/reportEmbed?reportId=363d09bb-acfb-4067-9d4b-de17ed0c7e3c&autoAuth=true&ctid=08271f42-81ef-45d6-81ac-49776c4be615"
          frameBorder="0"
          allowFullScreen={true}
          allow="fullscreen"
        />
      </div>
    </div>
  );
}
