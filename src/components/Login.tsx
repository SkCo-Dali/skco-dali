
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, Shield, ArrowRight } from "lucide-react";
import { MicrosoftAuth } from "@/components/MicrosoftAuth";

interface LoginProps {
  onLogin: (user: any) => void;
}

export function Login({ onLogin }: LoginProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleMockLogin = async () => {
    setIsLoading(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const mockUser = {
        id: "user-1",
        name: "Carlos Rodríguez",
        email: "carlos.rodriguez@skandia.com",
        role: "advisor",
        avatar: null,
        zone: "Bogotá",
        team: "Equipo Norte"
      };
      
      onLogin(mockUser);
    } catch (error) {
      console.error("Error durante la autenticación:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#ededed" }}>
      <div className="w-full max-w-2xl">
        {/* Logo y header */}
        <div className="text-center mb-8">
          {/* Video principal más grande y completo */}
          <div className="w-full max-w-2xl h-64 mx-auto mb-6 rounded-lg overflow-hidden shadow-lg bg-black">
            <video 
              src="https://aistudiojarvis0534199251.blob.core.windows.net/skandia-icons/Dali_.mp4"
              autoPlay
              loop
              muted
              playsInline
              className="w-full h-full object-contain"
            />
          </div>
        </div>

        {/* Card de login */}
        <Card className="shadow-xl border-0">
          <CardHeader className="space-y-1 text-center pb-4">
            <CardDescription>
             <div>
            <h1 className="sk-h2" style={{ color: '#3f3f3f' }}>Dali</h1>
            <p className="text-gray-600 mt-2">Tu copiloto en Skandia</p>
          </div>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              {/* Autenticación real con Microsoft */}
              <MicrosoftAuth />
              
              {/* Separador 
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    O usa cuenta demo
                  </span>
                </div>
              </div>*/}
              
              {/* Login de prueba */} 
              
            </div>

            <div className="space-y-4 pt-4 border-t">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Shield className="h-4 w-4 text-[#00c83c]" />
                <span>Autenticación segura con Entra ID</span>
              </div>
              
              <div className="text-xs text-gray-500 leading-relaxed">
                Al iniciar sesión, aceptas nuestros términos de servicio y política de privacidad. 
                Tu información está protegida por los estándares de seguridad de Microsoft.
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-sm text-gray-500">
          <p>¿Necesitas ayuda? Contacta a tu administrador de sistema</p>
          <p className="mt-2">© 2025 Skandia Colombia. Todos los derechos reservados.</p>
        </div>
      </div>
    </div>
  );
}
