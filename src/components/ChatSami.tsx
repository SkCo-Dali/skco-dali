import React, { useEffect, useMemo, useState } from "react";
import ReactWebChat, { createDirectLine, createStore } from "botframework-webchat";
import { ExternalLink, Minus, Lightbulb, ArrowRight, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type ChatSamiProps = {
  /** Opcional: iniciar minimizado */
  defaultMinimized?: boolean;
};

type ViewMode = "hidden" | "minimized" | "maximized";

export default function ChatSami({ defaultMinimized = false }: ChatSamiProps) {
  const [viewMode, setViewMode] = useState<ViewMode>(defaultMinimized ? "minimized" : "hidden");
  const [directLine, setDirectLine] = useState<ReturnType<typeof createDirectLine> | null>(null);

  const styleOptions = useMemo(
    () => ({
      hideUploadButton: true,
      rootHeight: "100%",
      rootWidth: "100%",
      backgroundColor: "hsl(var(--background))",
      sendBoxButtonColor: "#00c83c",
      sendBoxBorderTop: "solid 2px #00c83c",
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

  // ======== Store: auto-saludo al conectar ========
  const store = useMemo(
    () =>
      createStore({}, ({ dispatch }) => (next) => (action) => {
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
      }),
    [locale],
  );

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
      }
    })();

    return () => {
      disposed = true;
    };
  }, [directLine]);

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
          <div className="p-4 space-y-3 shrink-0">
            <div className="flex items-center gap-2 bg-[#e8f5e9] rounded-lg p-3">
              <div className="shrink-0 bg-black rounded-full p-1.5">
                <Lightbulb className="h-4 w-4 text-[#00c83c]" />
              </div>
              <span className="text-sm font-medium text-foreground">Sami Tip de hoy✨</span>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-semibold text-foreground">¡Diversifica portafolios!</p>
              <p className="text-xs text-muted-foreground">
                Y podrías aumentar tu rentabilidad hasta un <span className="font-semibold">12% E.A.</span>
              </p>
              <button className="text-sm text-[#00c83c] font-medium hover:underline">Quiero conocer más</button>
            </div>
          </div>

          {/* Espacio flex para empujar contenido hacia abajo */}
          <div className="flex-1 min-h-0" />

          {/* Acciones rápidas */}
          <div className="p-4 space-y-2 shrink-0">
            <button className="w-full text-left px-3 py-2 text-sm text-muted-foreground hover:bg-muted rounded-lg transition-colors">
              Abrir un nuevo producto 🚀
            </button>
            <button className="w-full text-left px-3 py-2 text-sm text-muted-foreground hover:bg-muted rounded-lg transition-colors">
              Gestionar portafolios ℹ️
            </button>
            <button className="w-full text-left px-3 py-2 text-sm text-muted-foreground hover:bg-muted rounded-lg transition-colors">
              Solicitar un certificado 📄
            </button>
          </div>

          {/* Input de búsqueda */}
          <div className="m-4 pt-0 space-y-3 shrink-0 border rounded-xl">
            <Input placeholder="Pregunta o busca lo que deseas..." className="w-full text-sm border-0" />
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" className="h-9 w-9 rounded-full" aria-label="Agregar archivo">
                <Plus className="h-4 w-4" />
              </Button>
              <Button
                className="h-9 w-9 rounded-full bg-[#00c83c] hover:bg-[#00b036] text-white ml-auto"
                size="icon"
                aria-label="Enviar mensaje"
              >
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Diálogo flotante maximizado */}
      {viewMode === "maximized" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="flex flex-col h-[85vh] w-[90vw] max-w-4xl bg-background rounded-lg shadow-2xl overflow-hidden border">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b bg-[#3f3f3f]">
              <div className="flex items-center gap-3">
                <img
                  src="https://skcoblobresources.blob.core.windows.net/digital-assets/animations/sk-sami-contigo.gif"
                  alt="SamiGPT"
                  className="w-10 h-10 rounded-full"
                />
                <span className="text-white font-semibold text-lg">SamiGPT</span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setViewMode("minimized")}
                className="h-9 w-9 text-white hover:bg-white/10"
                aria-label="Minimizar chat"
              >
                <Minus className="h-5 w-5" />
              </Button>
            </div>

            {/* Contenido del chat */}
            <div className="flex-1 overflow-hidden">
              {directLine ? (
                <ReactWebChat
                  directLine={directLine}
                  store={store}
                  locale={locale}
                  userID="web-user"
                  username="Invitado"
                  styleOptions={styleOptions}
                />
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">Cargando chat...</div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
