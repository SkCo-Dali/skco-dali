import React, { useEffect, useMemo, useState } from "react";
import ReactWebChat, { createDirectLine, createStore } from "botframework-webchat";
import { ChevronRight, ChevronLeft, Maximize2, Minimize2 } from "lucide-react";
import { Button } from "@/components/ui/button";

type ChatSamiProps = {
  /** Opcional: iniciar minimizado */
  defaultMinimized?: boolean;
};

export default function ChatSami({ defaultMinimized = false }: ChatSamiProps) {
  const [minimized, setMinimized] = useState(defaultMinimized);
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
      botAvatarImage:
        "https://storage.googleapis.com/m-infra.appspot.com/public/res/skandia/20201218-9SaE0VZGz9ZNkjs6SO9fJnFVpRu1-U2SVE-.gif",
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
              payload: { text: "hola" },
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
    <div
      className={`flex flex-col h-full border-l bg-background transition-all duration-300 ${
        minimized ? "w-14" : "w-80"
      }`}
    >
      {/* Header con logo y botones */}
      <div className="flex items-center justify-between p-3 border-b bg-[#3f3f3f] min-h-[70px]">
        {!minimized && (
          <div className="flex items-center gap-2">
            <img
              src="https://storage.googleapis.com/m-infra.appspot.com/public/res/skandia/20201218-9SaE0VZGz9ZNkjs6SO9fJnFVpRu1-U2SVE-.gif"
              alt="SamiGPT"
              className="w-10 h-10 rounded-full"
            />
            <span className="text-white font-semibold text-sm">SamiGPT</span>
          </div>
        )}
        <div className="flex items-center gap-1">
          {!minimized && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMinimized(true)}
              className="h-8 w-8 text-white hover:bg-white/10"
              aria-label="Minimizar chat"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          )}
          {minimized && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMinimized(false)}
              className="h-8 w-8 text-white hover:bg-white/10"
              aria-label="Maximizar chat"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Contenido del chat */}
      {!minimized && (
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
            <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
              Cargando chat...
            </div>
          )}
        </div>
      )}

      {/* Cuando está minimizado, mostrar solo íconos */}
      {minimized && (
        <div className="flex-1 flex flex-col items-center gap-4 py-4">
          <img
            src="https://storage.googleapis.com/m-infra.appspot.com/public/res/skandia/20201218-9SaE0VZGz9ZNkjs6SO9fJnFVpRu1-U2SVE-.gif"
            alt="SamiGPT"
            className="w-8 h-8 rounded-full"
          />
        </div>
      )}
    </div>
  );
}
