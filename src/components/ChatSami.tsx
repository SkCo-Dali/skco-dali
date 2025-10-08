import React, { useEffect, useState, useMemo } from "react";
import ReactWebChat, { createDirectLine } from "botframework-webchat";

type ChatSamiProps = {
  /** Opcional: forzar oculto inicialmente */
  defaultOpen?: boolean;
};

export default function ChatSami({ defaultOpen = false }: ChatSamiProps) {
  const [open, setOpen] = useState(defaultOpen);
  const [directLine, setDirectLine] = useState<any>(null);

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

  const styleOptions = useMemo(() => ({
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
    bubbleNubOffset: "bottom" as const,
    bubbleNubSize: 5,
    bubbleFromUserNubOffset: "top" as const,
    bubbleFromUserNubSize: 5,
    suggestedActionBackground: "white",
    suggestedActionBorderWidth: 1,
    suggestedActionBorderColor: "#00c83c",
    suggestedActionDisabledBackground: "white",
    suggestedActionBorderRadius: 10,
    suggestedActionDisabledBorderColor: "#00c83c",
    suggestedActionLayout: "flow" as const,
    suggestedActionTextColor: "#00c83c",
    botAvatarInitials: "SS",
    avatarBorderRadius: "50%",
    avatarSize: 30,
    botAvatarBackgroundColor: "white",
    botAvatarImage:
      "https://storage.googleapis.com/m-infra.appspot.com/public/res/skandia/20201218-9SaE0VZGz9ZNkjs6SO9fJnFVpRu1-U2SVE-.gif",
  }), []);

  const openIcon =
    "data:image/svg+xml,%3Csvg id='Capa_1' xmlns='http://www.w3.org/2000/svg' viewBox='0 0 65 65'%3E%3Cstyle%3E.st1%7Bfill:%2300c83c;stroke:%2300c83c;stroke-width:2;stroke-linecap:round;stroke-miterlimit:10%7D%3C/style%3E%3Ccircle cx='32.5' cy='32.5' r='25' fill='%23ffffff'/%3E%3Cpath class='st1' d='M23.5 41.5l9-9 9-9M23.5 23.5l9 9 9 9'/%3E%3C/svg%3E";
  const closeIconGIF = "https://skcoblobresources.blob.core.windows.net/digital-assets/animations/sk-sami-contigo.gif";

  // Inicializa DirectLine cuando el panel se abre por primera vez
  useEffect(() => {
    if (!open || directLine) return;

    (async function start() {
      try {
        const tokenEndpointURL = new URL(
          "https://6fec394b8c1befd4922c16d793ecb3.0c.environment.api.powerplatform.com/powervirtualagents/botsbyschema/cra2e_maestro/directline/token?api-version=2022-03-01-preview",
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

        const dl = createDirectLine({
          domain: new URL("v3/directline", directLineURL).toString(),
          token,
        });

        setDirectLine(dl);
      } catch (err) {
        console.error("Error iniciando WebChat:", err);
      }
    })();
  }, [open, directLine]);

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
        <div style={styles.webchatHost}>
          {directLine && (
            <ReactWebChat
              directLine={directLine}
              locale={document.documentElement.lang || navigator.language || "es"}
              styleOptions={styleOptions}
            />
          )}
        </div>
      </div>
    </>
  );
}
