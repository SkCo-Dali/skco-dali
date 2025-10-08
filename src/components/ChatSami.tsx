import React, { useEffect, useRef, useState } from "react";

declare global {
  interface Window {
    WebChat: any;
  }
}

type ChatSamiProps = {
  /** Opcional: forzar oculto inicialmente */
  defaultOpen?: boolean;
};

export default function ChatSami({ defaultOpen = false }: ChatSamiProps) {
  const [open, setOpen] = useState(defaultOpen);
  const [webchatReady, setWebchatReady] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const scriptLoadedRef = useRef(false);

  // tiny CSS-in-JS para animaciones y layout (evita tocar CSS global)
  const styles: Record<string, React.CSSProperties> = {
    chatButton: {
      position: "fixed",
      bottom: 20,
      right: 20,
      left: "auto",
      transform: "none",
      background: "none",
      border: "none",
      width: 60,
      height: 60,
      cursor: "pointer",
      borderRadius: "50%",
      padding: 0,
      zIndex: 60,
    },
    chatContainerBase: {
      position: "fixed",
      bottom: 100,
      right: 20,
      transform: "scale(0.9)",
      width: 400,
      height: 500,
      background: "white",
      borderRadius: 10,
      boxShadow: "0px 4px 6px rgba(0,0,0,0.3)",
      display: "flex",
      flexDirection: "column",
      overflow: "hidden",
      opacity: 0,
      transition: "transform .3s ease-out, opacity .3s ease-out",
      zIndex: 70,
      border: "1px solid rgba(0,0,0,0.06)",
    },
    chatContainerShow: {
      transform: "scale(1)",
      opacity: 1,
    },
    chatHeader: {
      background:
        "#3f3f3f url('https://storage.googleapis.com/m-infra.appspot.com/public/res/skandia/20201216-9SaE0VZGz9ZNkjs6SO9fJnFVpRu1-RZY28-.png') no-repeat 10px center",
      backgroundSize: "100px",
      color: "white",
      border: "none",
      width: "100%",
      height: 70,
      minHeight: 70,
      padding: "10px 10px 10px 150px",
      textAlign: "left",
      cursor: "pointer",
    },
    webchatHost: {
      flexGrow: 1,
      width: "100%",
      height: "100%",
      overflowY: "auto",
    },
  };

  const openIcon =
    "data:image/svg+xml,%3Csvg id='Capa_1' xmlns='http://www.w3.org/2000/svg' viewBox='0 0 65 65'%3E%3Cstyle%3E.st1%7Bfill:%2300c83c;stroke:%2300c83c;stroke-width:2;stroke-linecap:round;stroke-miterlimit:10%7D%3C/style%3E%3Ccircle cx='32.5' cy='32.5' r='25' fill='%23ffffff'/%3E%3Cpath class='st1' d='M23.5 41.5l9-9 9-9M23.5 23.5l9 9 9 9'/%3E%3C/svg%3E";
  const closeIconGIF = "https://skcoblobresources.blob.core.windows.net/digital-assets/animations/sk-sami-contigo.gif";

  // Carga el script de WebChat solo una vez
  useEffect(() => {
    if (scriptLoadedRef.current) return;

    const script = document.createElement("script");
    script.src = "https://cdn.botframework.com/botframework-webchat/latest/webchat.js";
    script.async = true;
    script.crossOrigin = "anonymous";
    script.onload = () => {
      scriptLoadedRef.current = true;
      setWebchatReady(true);
    };
    script.onerror = () => {
      console.error("No se pudo cargar BotFramework WebChat.");
    };
    document.body.appendChild(script);
  }, []);

  // Inicializa WebChat cuando el panel se abre por primera vez
  useEffect(() => {
    if (!open || !webchatReady || !containerRef.current || !window.WebChat) return;

    let disposed = false;

    (async function start() {
      try {
        const styleOptions = {
          hideUploadButton: true,
          rootHeight: "100%",
          rootWidth: "100%",
          backgroundColor: "White",
          sendBoxButtonColor: "#00c83c",
          sendBoxBorderTop: "solid 2px #00c83c",
          bubbleBackground: "rgba(0, 200, 60, .3)",
          bubbleBorderRadius: 10,
          bubbleFromUserBackground: "#DADADA",
          bubbleFromUserBorderRadius: 10,
          bubbleNubOffset: "bottom",
          bubbleNubSize: 5,
          bubbleFromUserNubOffset: "top",
          bubbleFromUserNubSize: 5,
          suggestedActionBackground: "white",
          suggestedActionBorderWidth: 1,
          suggestedActionBorderColor: "#00c83c",
          suggestedActionDisabledBackground: "white",
          suggestedActionBorderRadius: 10,
          suggestedActionDisabledBorderColor: "#00c83c",
          suggestedActionLayout: "flow",
          suggestedActionTextColor: "#00c83c",
          botAvatarInitials: "SS",
          avatarBorderRadius: "50%",
          avatarSize: 30,
          botAvatarBackgroundColor: "white",
          botAvatarImage:
            "https://storage.googleapis.com/m-infra.appspot.com/public/res/skandia/20201218-9SaE0VZGz9ZNkjs6SO9fJnFVpRu1-U2SVE-.gif",
        };

        // === Token y Direct Line según tu HTML ===
        const tokenEndpointURL = new URL(
          "https://a1c50ad050aeef36bc04f8ed77c933.05.environment.api.powerplatform.com/powervirtualagents/botsbyschema/cr939_superSami/directline/token?api-version=2022-03-01-preview",
        );
        const locale = document.documentElement.lang || navigator.language || "es";
        const apiVersion = tokenEndpointURL.searchParams.get("api-version");

        const [directLineURL, token] = await Promise.all([
          fetch(new URL(`/powervirtualagents/regionalchannelsettings?api-version=${apiVersion}`, tokenEndpointURL))
            .then((r) => {
              if (!r.ok) throw new Error("No se pudo obtener regionalchannelsettings");
              return r.json();
            })
            .then(({ channelUrlsById: { directline } }) => directline),
          fetch(tokenEndpointURL)
            .then((r) => {
              if (!r.ok) throw new Error("No se pudo obtener el token de Direct Line");
              return r.json();
            })
            .then(({ token }) => token),
        ]);

        if (disposed) return;

        const directLine = window.WebChat.createDirectLine({
          domain: new URL("v3/directline", directLineURL).toString(),
          token,
        });

        const subscription = directLine.connectionStatus$.subscribe({
          next(value: number) {
            // 2 = Online
            if (value === 2) {
              directLine
                .postActivity({
                  localTimezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                  locale,
                  name: "startConversation",
                  type: "event",
                })
                .subscribe();
              subscription.unsubscribe();
            }
          },
        });

        window.WebChat.renderWebChat(
          {
            directLine,
            locale,
            styleOptions,
          },
          containerRef.current,
        );
      } catch (err) {
        console.error("Error iniciando WebChat:", err);
      }
    })();

    return () => {
      disposed = true;
    };
  }, [open, webchatReady]);

  return (
    <>
      {/* Botón flotante */}
      <button aria-label="Abrir chat" style={styles.chatButton} onClick={() => setOpen((o) => !o)}>
        <img
          alt="Chatbot"
          src={open ? openIcon : closeIconGIF}
          style={{ width: "100%", height: "100%", borderRadius: "50%" }}
        />
      </button>

      {/* Contenedor del chat */}
      <div
        style={{
          ...styles.chatContainerBase,
          ...(open ? styles.chatContainerShow : {}),
          display: open ? "flex" : "none",
        }}
        role="dialog"
        aria-modal="true"
      >
        <button style={styles.chatHeader} onClick={() => setOpen(false)} aria-label="Cerrar chat" />
        <div ref={containerRef} style={styles.webchatHost} />
      </div>
    </>
  );
}
