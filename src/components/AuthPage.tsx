
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageSquare } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export const AuthPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { signInWithAzure, user, loading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Redirigir si ya está autenticado
  useEffect(() => {
    if (!loading && user) {
      console.log('User authenticated, redirecting to home:', user);
      navigate('/', { replace: true });
    }
  }, [user, loading, navigate]);

  const handleAzureSignIn = async () => {
    setIsLoading(true);
    console.log('Starting Azure sign in...');

    try {
      const { error } = await signInWithAzure();

      if (error) {
        console.error('Sign in error:', error);
        
        // Mostrar mensaje más específico para usuarios inactivos
        let errorMessage = error.message || "Error de autenticación con Microsoft";
        if (error.message && error.message.includes('inactiva')) {
          errorMessage = error.message;
        }
        
        toast({
          title: "Error al iniciar sesión",
          description: errorMessage,
          variant: "destructive",
        });
        setIsLoading(false);
      } else {
        console.log('Sign in successful');
        toast({
          title: "Inicio de sesión exitoso",
          description: "Te damos la bienvenida a Dali AI",
        });
        // La redirección se manejará automáticamente por el useEffect
        // pero agregamos un timeout como respaldo
        setTimeout(() => {
          if (user) {
            navigate('/', { replace: true });
          }
          setIsLoading(false);
        }, 1000);
      }
    } catch (error) {
      console.error('Unexpected error during sign in:', error);
      setIsLoading(false);
      toast({
        title: "Error inesperado",
        description: "Ocurrió un error inesperado durante el inicio de sesión",
        variant: "destructive",
      });
    }
  };

  // Mostrar loading si se está verificando la autenticación
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-80 h-48 mx-auto mb-4 rounded-lg overflow-hidden">
            <video 
              src="https://aistudiojarvis0534199251.blob.core.windows.net/skandia-icons/Dali_.mp4"
              autoPlay
              loop
              muted
              className="w-full h-full object-contain"
            />
          </div>
          <p className="text-gray-600 dark:text-gray-400">Verificando autenticación...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Dali AI - Data Literacy + Artificial Intelligence
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
           Más que un asistente, tu copiloto en Skandia.
          </p>
        </div>

        <div className="max-w-md mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Ingresa acá a Dali AI</CardTitle>
              <CardDescription>
                Autenticación Corporativa
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                onClick={handleAzureSignIn} 
                className="w-full bg-[#C8C8C8] hover:bg-[#9F9F9F] text-white"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Iniciando sesión...
                  </>
                ) : (
                  <>
                    <img
                      src="https://aistudiojarvis0534199251.blob.core.windows.net/skandia-icons/logo%20secundario.png"
                      alt="Skandia Logo"
                      className="w-11 h-11 mr-1"
                      />
                    Inicia sesión con tu correo de Skandia
                  </>
                )}
              </Button>
              
              <div className="text-[10px] text-center text-gray-500 mt-4">
                Al iniciar sesión, aceptas nuestra{" "}
                <a
                  href="https://www.skandia.co/autorizacion-de-tratamiento-de-datos-personales"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline"
                  style={{ color: "#00C73D" }}
                  >
                  política
                </a>{" "}
                de tratamiento de datos, así como nuestros{" "}
                <a
                  href="https://www.skandia.co/terminos-y-condiciones-canales-de-servicio/terminos-y-condiciones-del-chat"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline"
                  style={{ color: "#00C73D" }}
                  >
                  términos y condiciones
                </a>.
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
