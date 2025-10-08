import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, Shield, ArrowRight } from "lucide-react";
import { MicrosoftAuth } from "@/components/MicrosoftAuth";

interface LoginProps {
  onLogin: (user: any) => void;
}

export function Login({ onLogin }: LoginProps) {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#ededed" }}>
      <div className="w-full max-w-2xl">
        {/* Logo y header */}
        <div className="text-center mb-4">
          {/* Video principal más grande y completo */}
          <div className="w-full max-w-2xl h-64 mx-auto mb-4 rounded-xl overflow-hidden shadow-lg bg-black">
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
        <Card className="shadow-xl border-0 py-4">
          <CardHeader className="space-y-1 text-center pb-4 pt-0">
            <CardDescription>
              <div>
                <h1 className="sk-h2" style={{ color: "#3f3f3f" }}>
                  Dali
                </h1>
                <p className="text-gray-600 mt-2"></p>
              </div>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex justify-center space-y-4">
              {/* Autenticación real con Microsoft */}
              <MicrosoftAuth />
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-sm text-gray-500 pt-4">
          <p>¿Necesitas ayuda? Contacta a tu administrador de sistema</p>
          <p className="mt-2">© 2025 Skandia Colombia. Todos los derechos reservados.</p>
        </div>
      </div>
    </div>
  );
}
