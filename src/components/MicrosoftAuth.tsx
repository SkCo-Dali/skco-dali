import { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { loginRequest } from "@/authConfig";
import { useLocation, useNavigate } from "react-router-dom";
import { AuthenticationResult, EventType } from "@azure/msal-browser";
import { useMsal, useIsAuthenticated } from "@azure/msal-react";

export function MicrosoftAuth() {
  const { instance: msalInstance, inProgress } = useMsal();
  const [isLoading, setIsLoading] = useState(false);
  const [showLoginButton, setShowLoginButton] = useState(false);
  const isAuthenticated = useIsAuthenticated();
  const location = useLocation();
  const navigate = useNavigate();
  const silentLoginAttempted = useRef(false);

  // Intento de login automático silencioso
  useEffect(() => {
    const attemptSilentLogin = async () => {
      // Evitar ciclo infinito: solo intentar una vez
      if (silentLoginAttempted.current) {
        return;
      }

      silentLoginAttempted.current = true;

      try {
        // Primero, manejar redirecciones de Azure (en caso de que ya estemos volviendo de un redirect)
        const result = await msalInstance.handleRedirectPromise();

        if (result) {
          // Ya hay un resultado de un redirect previo, no necesitar hacer login
          msalInstance.setActiveAccount(result.account);
          // Navegar a la ruta original si existe
          
          const state = result.state ? JSON.parse(result.state) : null;
          if (state && state.from && state.from.path) {
            navigate(state.from.path + (state.from.query || ""), { replace: true });
          } else {
            navigate("/", { replace: true });
          }
          setShowLoginButton(false);
          return;
        }

        // Si ya está autenticado, no hacer nada más
        if (isAuthenticated) {
          setShowLoginButton(false);
          return;
        }

        // Intentar obtener token silenciosamente sin popup/redirect
        const activeAccount = msalInstance.getActiveAccount();
        if (activeAccount) {
          await msalInstance.acquireTokenSilent({
            ...loginRequest,
            account: activeAccount,
          });
          setShowLoginButton(false);
          return;
        }

        // No hay cuenta activa ni token silencioso disponible
        // Hacer login automático con redirect (o popup si estamos en un iframe)
        console.log("Intentando login automático con redirect...");
        const { from } = location.state || {};

        const isInIframe = (() => {
          try {
            return window.self !== window.top;
          } catch {
            return true;
          }
        })();

        if (isInIframe) {
          // En iframes los redirects no están soportados: usar popup
          const result = await msalInstance.loginPopup({
            ...loginRequest,
          });
          msalInstance.setActiveAccount(result.account);
          setShowLoginButton(false);
          return;
        }

        await msalInstance.loginRedirect({
          ...loginRequest,
          state: from ? JSON.stringify({ from }) : undefined,
        });
      } catch (error) {
        console.error("Error en login automático:", error);
        // Si falla, mostrar botón de login para que el usuario inicie sesión manualmente
        setShowLoginButton(true);
      }
    };

    attemptSilentLogin();
  }, [msalInstance, isAuthenticated]);




  const handleMicrosoftLogin = async () => {
    setIsLoading(true);
    try {
      const { from } = location.state || {};

      const isInIframe = (() => {
        try {
          return window.self !== window.top;
        } catch {
          return true;
        }
      })();

      if (isInIframe) {
        // En iframes los redirects no están soportados: usar popup
        const result = await msalInstance.loginPopup({
          ...loginRequest,
        });
        msalInstance.setActiveAccount(result.account);
        setIsLoading(false);
        const target = from ? from.path + (from.query || "") : "/";
        navigate(target, { replace: true });
        return;
      }

      // Usar loginRedirect en lugar de acquireTokenPopup para evitar bloqueadores de popup
      await msalInstance.loginRedirect({
        ...loginRequest,
        state: from ? JSON.stringify({ from }) : undefined,
      });
    } catch (error) {
      let errorMessage = "Error durante la autenticación";

      if (error.errorCode === "user_cancelled") {
        errorMessage = "Autenticación cancelada por el usuario";
      } else if (error.errorCode === "popup_blocked") {
        errorMessage = "El popup fue bloqueado. Por favor, permite popups.";
      } else if (error.message) {
        errorMessage = error.message;
      }

      console.error("Error en login:", error);
      alert(errorMessage);
      setIsLoading(false);
    }
    // Nota: No reseteamos isLoading aquí porque se hará redirect
  };


  return (
    <>
      {showLoginButton && inProgress === "none" && (
        <Button
          onClick={handleMicrosoftLogin}
          disabled={isLoading}
          className="w-80 h-12 bg-[#3f3f3f] hover:bg-[#9f9f9f] text-white"
        >
          {isLoading ? (
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Autenticando...</span>
            </div>
          ) : (
            <div className="flex items-center space-x-3">
              <span>Ingresar</span>
            </div>
          )}
        </Button>
      )}
    </>
  );
}
