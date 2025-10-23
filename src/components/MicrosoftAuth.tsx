import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { loginRequest } from "@/authConfig";
import { useLocation, useNavigate } from "react-router-dom";
import { AuthenticationResult, EventType } from "@azure/msal-browser";
import { useMsal, useIsAuthenticated } from "@azure/msal-react";

export function MicrosoftAuth() {
  const { instance: msalInstance, inProgress } = useMsal();
  const [isLoading, setIsLoading] = useState(false);
  const isAuthenticated = useIsAuthenticated();
  const location = useLocation();
  const navigate = useNavigate();

  // Intento de login automático silencioso
  useEffect(() => {
    const attemptSilentLogin = async () => {
      if (!isAuthenticated) {
        try {
          const { from } = location.state || {};
          // try to login automatically without prompting the user
          await msalInstance.loginPopup(
            { ...loginRequest, prompt: 'none', state: from ? JSON.stringify({ from }) : undefined }
          );
        } catch (error) {
          console.error("Error en login automático:", error);
        }
      }


    };
    attemptSilentLogin();
  }, [msalInstance, isAuthenticated]);

  // Escuchar eventos de autenticación
  useEffect(() => {
    const callbackId = msalInstance.addEventCallback((event) => {
      if (event.eventType === EventType.LOGIN_SUCCESS && event.payload) {
        const payload = event.payload as AuthenticationResult;
        msalInstance.setActiveAccount(payload.account);
        const state = payload.state;
        if (state) {
          const { from } = JSON.parse(state);
          if (from?.path) {
            navigate(from.path + (from.query || ""), { replace: true });
          }
        }
      } else if (event.eventType === EventType.LOGIN_FAILURE) {
        console.error("Login fallido:", event.error);
      }
    });

    return () => {
      msalInstance.removeEventCallback(callbackId);
    };
  }, [msalInstance, navigate]);


  const handleMicrosoftLogin = async () => {
    setIsLoading(true);
    try {
      const { from } = location.state || {};

      await msalInstance.acquireTokenPopup({
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

      alert(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <>
    {isLoading && <div>Cargando...</div> }
    {!isLoading && (
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
