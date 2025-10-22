import React, { useEffect, useMemo, useState } from "react";
import ReactWebChat, { createDirectLine, createStore } from "botframework-webchat";
import { ExternalLink, Minus, Lightbulb, ArrowRight, Plus, ArrowUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { opportunitiesService } from "@/services/opportunitiesService";
import { IOpportunity } from "@/types/opportunities";
import { useToast } from "@/hooks/use-toast";

type ChatSamiProps = {
  /** Opcional: iniciar minimizado */
  defaultMinimized?: boolean;
};

type ViewMode = "hidden" | "minimized" | "maximized";

export default function ChatSami({ defaultMinimized = false }: ChatSamiProps) {
  const [viewMode, setViewMode] = useState<ViewMode>(defaultMinimized ? "minimized" : "hidden");
  const [directLine, setDirectLine] = useState<ReturnType<typeof createDirectLine> | null>(null);
  const [topOpportunity, setTopOpportunity] = useState<IOpportunity | null>(null);
  const [inputText, setInputText] = useState("");
  const [storeRef, setStoreRef] = useState<any>(null);
  const { toast } = useToast();

  // Store con referencia para enviar mensajes
  const store = useMemo(() => {
    const storeInstance = createStore({}, ({ dispatch }) => (next) => (action) => {
      if (action.type === "DIRECT_LINE/CONNECT_FULFILLED") {
        dispatch({
          type: "WEB_CHAT/SEND_EVENT",
          payload: {
            name: "startConversation",
            value: { locale, source: "Informes.tsx" },
          },
        });

        setTimeout(() => {
          dispatch({
            type: "WEB_CHAT/SEND_MESSAGE",
            payload: { text: "" },
          });
        }, 800);
      }
      return next(action);
    });
    setStoreRef(storeInstance);
    return storeInstance;
  }, []);

  const styleOptions = useMemo(
    () => ({
      hideUploadButton: true,
      hideSendBox: true, // Ocultar el campo de texto del webchat
      rootHeight: "100%",
      rootWidth: "100%",
      backgroundColor: "hsl(var(--background))",
      bubbleBackground: "rgba(0, 200, 60, .3)",
      bubbleBorderRadius: 10,
      bubbleFromUserBackground: "hsl(var(--muted))",
      bubbleFromUserBorderRadius: 10,
      bubbleNubOffset: "bottom" as const,
      bubbleNubSize: 5,
      bubbleFromUserNubOffset: "top" as const,
      bubbleFromUserNubSize: 5,
      suggestedActionBackground: "hsl(var(--background))",
      suggestedActionBorderWidth: 1,
      suggestedActionBorderColor: "#00c83c",
      suggestedActionDisabledBackground: "hsl(var(--background))",
      suggestedActionBorderRadius: 10,
      suggestedActionDisabledBorderColor: "#00c83c",
      suggestedActionLayout: "flow" as const,
      suggestedActionTextColor: "#00c83c",
      botAvatarInitials: "SS",
      avatarBorderRadius: "50%",
      avatarSize: 30,
      botAvatarBackgroundColor: "hsl(var(--background))",
      botAvatarImage: "https://skcoblobresources.blob.core.windows.net/digital-assets/animations/sk-sami-contigo.gif",
    }),
    [],
  );

  const locale = useMemo(
    () => (typeof document !== "undefined" ? document.documentElement.lang || navigator.language || "es" : "es"),
    [],
  );

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

  // Inicializar Direct Line al montar
  useEffect(() => {
    if (directLine) return;

    let disposed = false;

    (async () => {
      try {
        const tokenEndpointURL = new URL(
          "https://6fec394b8c1befd4922c16d793ecb3.0c.environment.api.powerplatform.com/powervirtualagents/botsbyschema/cra2e_maestro/directline/token?api-version=2022-03-01-preview",
        );
        const apiVersion = tokenEndpointURL.searchParams.get("api-version") || "2022-03-01-preview";

        const [directLineURL, token] = await Promise.all([
          fetch(
            new URL(
              `/powervirtualagents/regionalchannelsettings?api-version=${apiVersion}`,
              tokenEndpointURL,
            ).toString(),
          )
            .then((r) => {
              if (!r.ok) throw new Error(`regionalchannelsettings ${r.status}`);
              return r.json();
            })
            .then(({ channelUrlsById: { directline } }) => directline),
          fetch(tokenEndpointURL.toString())
            .then((r) => {
              if (!r.ok) throw new Error(`token ${r.status}`);
              return r.json();
            })
            .then(({ token }) => token),
        ]);

        if (disposed) return;

        const dl = createDirectLine({
          domain: new URL("v3/directline", directLineURL).toString(),
          token,
        });

        setDirectLine(dl);
      } catch (err) {
        console.error("Error iniciando WebChat:", err);
        toast({
          title: "Error",
          description: "No se pudo conectar con el chat",
          variant: "destructive",
        });
      }
    })();

    return () => {
      disposed = true;
    };
  }, [directLine, toast]);

  const sendMessage = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;

    if (!directLine) {
      toast({
        title: "Chat no disponible",
        description: "El chat aún no está conectado",
        variant: "destructive",
      });
      return;
    }

    try {
      // Enviar directamente por Direct Line para inputs personalizados
      let sub: any;
      sub = directLine
        .postActivity({
          type: "message",
          text: trimmed,
          locale,
          from: { id: "user", name: "Usuario" },
        })
        .subscribe({
          next: () => {
            setInputText("");
            sub?.unsubscribe();
          },
          error: (err: any) => {
            console.error("Error enviando mensaje:", err);
            toast({
              title: "Error",
              description: "No se pudo enviar el mensaje",
              variant: "destructive",
            });
            sub?.unsubscribe();
          },
        });
    } catch (error) {
      console.error("Error enviando mensaje:", error);
      toast({
        title: "Error",
        description: "No se pudo enviar el mensaje",
        variant: "destructive",
      });
    }
  };

  const handleQuickAction = (action: string) => {
    sendMessage(action);
  };

  const handleSendInput = () => {
    if (inputText.trim()) {
      sendMessage(inputText);
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

          {/* Chat WebChat */}
          <div className="flex-1 min-h-0 m-2">
            {directLine ? (
              <ReactWebChat directLine={directLine} store={store} styleOptions={styleOptions} locale={locale} userID="user" username="Usuario" />
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-sm text-muted-foreground">Conectando con el chat...</p>
              </div>
            )}
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

          {/* Input de búsqueda */}
          <div className="m-2 pt-0 space-y-3 shrink-0 border rounded-xl">
            <Input
              placeholder="Pregunta o busca lo que deseas..."
              className="w-full text-sm border-0"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSendInput();
                }
              }}
            />
            <div className="flex items-center gap-2 p-2">
              <Button variant="outline" size="icon" className="h-9 w-9 rounded-full" aria-label="Agregar archivo">
                <Plus className="h-4 w-4" />
              </Button>
              <Button
                onClick={handleSendInput}
                className="h-9 w-9 rounded-full bg-[#00c83c] hover:bg-[#00b036] text-white ml-auto"
                size="icon"
                aria-label="Enviar mensaje"
              >
                <ArrowUp className="h-4 w-4" />
              </Button>
            </div>
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
            {/* Chat WebChat */}
            <div className="flex-1 min-h-0 mx-4">
              {directLine ? (
                <ReactWebChat directLine={directLine} store={store} styleOptions={styleOptions} locale={locale} userID="user" username="Usuario" />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className="text-sm text-muted-foreground">Conectando con el chat...</p>
                </div>
              )}
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
            {/* Input de búsqueda */}
            <div className="mx-4 mt-2 mb-4 pt-0 space-y-3 shrink-0 border rounded-xl">
              <Input
                placeholder="Pregunta o busca lo que deseas..."
                className="w-full text-sm border-0"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendInput();
                  }
                }}
              />
              <div className="flex items-center gap-2 p-2">
                <Button variant="outline" size="icon" className="h-9 w-9 rounded-full" aria-label="Agregar archivo">
                  <Plus className="h-4 w-4" />
                </Button>
                <Button
                  onClick={handleSendInput}
                  className="h-9 w-9 rounded-full bg-[#00c83c] hover:bg-[#00b036] text-white ml-auto"
                  size="icon"
                  aria-label="Enviar mensaje"
                >
                  <ArrowUp className="h-4 w-4" />
                </Button>
              </div>
            </div>
                  
          </div>
        </div>
      )}
    </>
  );
}
