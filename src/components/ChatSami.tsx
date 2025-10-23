import React, { useEffect, useState, useRef } from "react";
import { ExternalLink, Minus, Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";
import { opportunitiesService } from "@/services/opportunitiesService";
import { IOpportunity } from "@/types/opportunities";
import { SimpleChatInterface } from "./SimpleChatInterface";

type ChatSamiProps = {
  /** Opcional: iniciar minimizado */
  defaultMinimized?: boolean;
};

type ViewMode = "hidden" | "minimized" | "maximized";

export default function ChatSami({ defaultMinimized = false }: ChatSamiProps) {
  const [viewMode, setViewMode] = useState<ViewMode>(defaultMinimized ? "minimized" : "hidden");
  const [topOpportunity, setTopOpportunity] = useState<IOpportunity | null>(null);
  const chatInterfaceRef = useRef<any>(null);

  // Cargar oportunidad top 1
  useEffect(() => {
    const loadTopOpportunity = async () => {
      try {
        const opportunities = await opportunitiesService.getOpportunities(undefined, 'relevance');
        if (opportunities.length > 0) {
          setTopOpportunity(opportunities[0]);
        }
      } catch (error) {
        console.error("Error cargando oportunidad:", error);
      }
    };
    loadTopOpportunity();
  }, []);

  const handleQuickAction = (action: string) => {
    if (chatInterfaceRef.current?.setInputMessage) {
      chatInterfaceRef.current.setInputMessage(action);
    }
  };

  return (
    <>
      {/* Burbuja flotante */}
      {viewMode === "hidden" && (
        <button
          onClick={() => setViewMode("minimized")}
          className="fixed bottom-6 right-6 z-50 h-16 w-16 rounded-full bg-transparent transition-all duration-200 flex items-center justify-center group"
          aria-label="Abrir SamiGPT"
        >
          <img
            src="https://skcoblobresources.blob.core.windows.net/digital-assets/animations/sk-sami-contigo.gif"
            alt="SamiGPT"
            className="w-14 h-14"
          />
        </button>
      )}

      {/* Panel minimizado */}
      {viewMode === "minimized" && (
        <div className="flex flex-col w-[280px] border bg-background shadow-md rounded-xl h-[90%]">
          {/* Header */}
          <div className="flex items-center justify-between p-2 bg-[#fafafa] shrink-0">
            <h2 className="text-md font-semibold text-foreground">SamiGPT</h2>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setViewMode("maximized")}
                className="h-8 w-8 hover:bg-muted"
                aria-label="Abrir en ventana"
              >
                <ExternalLink className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setViewMode("hidden")}
                className="h-8 w-8 hover:bg-muted"
                aria-label="Minimizar"
              >
                <Minus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Tip del día */}
          <div className="p-2 space-y-3 shrink-0">
            <div className="flex items-center gap-2 bg-[#e8f5e9] rounded-full p-2">
              <div className="shrink-0 bg-black rounded-full p-1.5">
                <Lightbulb className="h-4 w-4 text-[#00c83c]" />
              </div>
              <span className="text-sm font-medium text-foreground">Oportunidad de hoy✨</span>
            </div>

            {topOpportunity ? (
              <div className="space-y-2 border rounded-xl p-2">
                <p className="text-sm font-semibold text-foreground">
                  {topOpportunity.title}
                </p>
                <p className="text-xs text-muted-foreground">
                  Comisiones Potenciales{" "}
                  <span className="font-semibold">
                    ${topOpportunity.metrics?.estimatedSales?.toLocaleString() || "N/A"}
                  </span>
                </p>
                <button 
                  onClick={() => handleQuickAction(`Más información sobre: ${topOpportunity.title}`)}
                  className="w-full text-sm text-center text-secondary font-medium hover:underline"
                >
                  Ver Oportunidad
                </button>
              </div>
            ) : (
              <div className="space-y-2 border rounded-xl p-2">
                <p className="text-sm text-muted-foreground">Cargando oportunidad...</p>
              </div>
            )}
          </div>

          {/* Chat Dali */}
          <div className="flex-1 min-h-0 m-2">
            <SimpleChatInterface ref={chatInterfaceRef} />
          </div>

          {/* Acciones rápidas */}
          <div className="p-2 space-y-2 shrink-0">
            <button
              onClick={() => handleQuickAction("Consultar Informe 🚀")}
              className="w-full text-left px-3 py-2 text-sm text-muted-foreground bg-muted rounded-full border transition-colors hover:bg-muted/80"
            >
              Consultar Informe 🚀
            </button>
            <button
              onClick={() => handleQuickAction("Ver Leads ℹ️")}
              className="w-full text-left px-3 py-2 text-sm text-muted-foreground bg-muted rounded-full border transition-colors hover:bg-muted/80"
            >
              Ver Leads ℹ️
            </button>
            <button
              onClick={() => handleQuickAction("Ver Comisiones 📄")}
              className="w-full text-left px-3 py-2 text-sm text-muted-foreground bg-muted rounded-full border transition-colors hover:bg-muted/80"
            >
              Ver Comisiones 📄
            </button>
          </div>
        </div>
      )}

      {/* Diálogo flotante maximizado */}
      {viewMode === "maximized" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="flex flex-col h-[85vh] w-[90vw] max-w-4xl bg-background rounded-xl shadow-2xl overflow-hidden border">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-2 bg-[#fafafa] shrink-0">
              <h2 className="text-lg font-semibold text-foreground">SamiGPT</h2>
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setViewMode("minimized")}
                  className="h-8 w-8 hover:bg-muted"
                  aria-label="Minimizar"
                >
                  <Minus className="h-5 w-5" />
                </Button>
              </div>
            </div>
            {/* Tip del día */}
                   
            <div className="p-4 space-y-3 shrink-0">
                   
              <div className="flex items-center gap-2 bg-[#e8f5e9] rounded-full p-2">
                 
                <div className="shrink-0 bg-black rounded-full p-1.5">
                                 <Lightbulb className="h-4 w-4 text-[#00c83c]" />
                </div>
                             <span className="text-sm font-medium text-foreground">Oportunidad de hoy✨</span>
              </div>
            {topOpportunity ? (
              <div className="space-y-2 border rounded-xl p-4">
                <p className="text-sm font-semibold text-foreground">
                  {topOpportunity.title}
                </p>
                <p className="text-xs text-muted-foreground">
                  Comisiones Potenciales{" "}
                  <span className="font-semibold">
                    ${topOpportunity.metrics?.estimatedSales?.toLocaleString() || "N/A"}
                  </span>
                </p>
                <button 
                  onClick={() => handleQuickAction(`Más información sobre: ${topOpportunity.title}`)}
                  className="w-full text-sm text-center text-secondary font-medium hover:underline"
                >
                  Ver Oportunidad
                </button>
              </div>
            ) : (
              <div className="space-y-2 border rounded-xl p-4">
                <p className="text-sm text-muted-foreground">Cargando oportunidad...</p>
              </div>
            )}
            </div>
            {/* Chat Dali */}
            <div className="flex-1 min-h-0 mx-4">
              <SimpleChatInterface ref={chatInterfaceRef} />
            </div>

            {/* Acciones rápidas */}
            <div className="grid grid-cols-3 px-4 py-2 gap-2 shrink-0">
              <button
                onClick={() => handleQuickAction("Consultar Informe 🚀")}
                className="w-full text-left px-3 py-2 text-sm text-muted-foreground bg-muted rounded-full border transition-colors hover:bg-muted/80"
              >
                Consultar Informe 🚀
              </button>

              <button
                onClick={() => handleQuickAction("Ver Leads ℹ️")}
                className="w-full text-left px-3 py-2 text-sm text-muted-foreground bg-muted rounded-full border transition-colors hover:bg-muted/80"
              >
                Ver Leads ℹ️
              </button>

              <button
                onClick={() => handleQuickAction("Ver Comisiones 📄")}
                className="w-full text-left px-3 py-2 text-sm text-muted-foreground bg-muted rounded-full border transition-colors hover:bg-muted/80"
              >
                Ver Comisiones 📄
              </button>
            </div>
                  
          </div>
        </div>
      )}
    </>
  );
}
