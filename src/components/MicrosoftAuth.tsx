import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { loginRequest } from "@/authConfig";
import { useLocation, useNavigate, Location } from "react-router-dom";
import { AuthenticationResult, EventType } from "@azure/msal-browser";

export function MicrosoftAuth() {
  const { msalInstance, login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  useEffect(() => {
    // Listen for sign-in event and set active account
    msalInstance.addEventCallback((event) => {
      if (event.eventType === EventType.LOGIN_SUCCESS && event.payload) {
        const payload = event.payload as AuthenticationResult;
        const account = payload.account;
        const state = payload.state;
        msalInstance.setActiveAccount(account);
        if (state) {
          const { from } = JSON.parse(state);
          if (from.path) {
            navigate(from.path + (from.query || ''), { replace: true });
          }
        }
      }
    });

  }, [msalInstance]);





  const handleMicrosoftLogin = async () => {
    setIsLoading(true);
    try {
      const { from } = location.state || {};

      // Paso 1: Obtener token de MSAL
      await msalInstance.acquireTokenPopup({
        ...loginRequest,
        state: from ? JSON.stringify({ from }) : undefined,
      });

    } catch (error) {
      // Manejo específico de errores sin fallbacks inseguros
      let errorMessage = "Error durante la autenticación";

      if (error.errorCode === "user_cancelled") {
        errorMessage = "Autenticación cancelada por el usuario";
      } else if (error.errorCode === "popup_blocked") {
        errorMessage = "El popup fue bloqueado. Por favor, permite popups para este sitio.";
      } else if (error.message) {
        errorMessage = error.message;
      }

      // Mostrar error al usuario sin comprometer la seguridad
      alert(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
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
  );
}
