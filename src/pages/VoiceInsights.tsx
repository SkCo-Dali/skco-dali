import { useState, useEffect, useRef } from "react";
import { Mic, MicOff, Brain, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import { useVoiceRecording } from "@/hooks/useVoiceRecording";

const VoiceInsights = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [hasRecording, setHasRecording] = useState(false);
  const [showWarning, setShowWarning] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  const MAX_RECORDING_TIME = 7200; // 2 horas en segundos

  const { toggleRecording, isProcessing } = useVoiceRecording({
    onTranscription: (text) => {
      console.log("Transcripción:", text);
    },
    onError: (error) => {
      toast.error(error);
    }
  });

  useEffect(() => {
    if (isRecording) {
      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => {
          const newTime = prev + 1;
          if (newTime >= MAX_RECORDING_TIME) {
            handleStopRecording();
            setShowWarning(true);
          }
          return newTime;
        });
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isRecording]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleStartRecording = async () => {
    setIsRecording(true);
    setRecordingTime(0);
    setHasRecording(false);
    setShowWarning(false);
    await toggleRecording();
  };

  const handleStopRecording = async () => {
    setIsRecording(false);
    setHasRecording(true);
    await toggleRecording();
  };

  const handleAnalyze = () => {
    toast.success(
      "✅ Grabación enviada. En pocos minutos, recibirás en tu correo un resumen completo del análisis realizado por Sami, incluyendo sugerencias personalizadas de productos.",
      { duration: 6000 }
    );
    // Reset states
    setHasRecording(false);
    setRecordingTime(0);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-3">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground">
            Sami Voice Insights
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Graba, analiza y recibe recomendaciones personalizadas en minutos.
          </p>
        </div>

        {/* Main Card */}
        <Card className="p-8 md:p-12 shadow-xl border-2">
          <div className="space-y-8">
            {/* Recording Button */}
            <div className="flex flex-col items-center space-y-6">
              <Button
                size="lg"
                onClick={isRecording ? handleStopRecording : handleStartRecording}
                disabled={isProcessing}
                className={`h-32 w-32 rounded-full text-lg font-semibold shadow-2xl transform transition-all duration-300 hover:scale-105 ${
                  isRecording
                    ? "bg-destructive hover:bg-destructive/90"
                    : "gradient-skandia hover:opacity-90"
                }`}
              >
                {isRecording ? (
                  <MicOff className="h-12 w-12" />
                ) : (
                  <Mic className="h-12 w-12" />
                )}
              </Button>

              <div className="text-center space-y-2">
                <p className="text-2xl font-bold text-foreground">
                  {isRecording ? "Detener grabación" : "Iniciar grabación"}
                </p>
                {!isRecording && !hasRecording && (
                  <p className="text-sm text-muted-foreground">
                    Presiona el botón para comenzar
                  </p>
                )}
              </div>
            </div>

            {/* Timer */}
            {isRecording && (
              <div className="flex flex-col items-center space-y-4 animate-fade-in">
                <div className="flex items-center space-x-3 bg-muted/50 px-8 py-4 rounded-2xl">
                  <div className="h-3 w-3 rounded-full bg-destructive animate-pulse" />
                  <span className="text-4xl font-mono font-bold text-foreground">
                    {formatTime(recordingTime)}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Tiempo máximo: {formatTime(MAX_RECORDING_TIME)}
                </p>
              </div>
            )}

            {/* Warning */}
            {showWarning && (
              <Alert className="animate-fade-in border-destructive">
                <Info className="h-4 w-4" />
                <AlertDescription>
                  Se ha alcanzado el tiempo máximo de grabación (2 horas).
                </AlertDescription>
              </Alert>
            )}

            {/* Analyze Button */}
            {hasRecording && !isRecording && (
              <div className="flex flex-col items-center space-y-4 animate-fade-in">
                <Button
                  size="lg"
                  onClick={handleAnalyze}
                  className="h-16 px-8 text-lg font-semibold gradient-skandia hover:opacity-90 shadow-xl transform transition-all duration-300 hover:scale-105"
                >
                  <Brain className="h-6 w-6 mr-3" />
                  Analizar con Sami Voice Insights
                </Button>
                <p className="text-sm text-muted-foreground text-center max-w-md">
                  Envía tu grabación para recibir un análisis detallado con
                  recomendaciones personalizadas
                </p>
              </div>
            )}
          </div>
        </Card>

        {/* Info Section */}
        <Card className="p-6 bg-muted/30 border">
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Info className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold text-foreground">
                ¿Qué es Sami Voice Insights?
              </h3>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              Es una herramienta que transforma tus conversaciones con clientes
              en diagnósticos inteligentes con recomendaciones de productos
              Skandia, todo en cuestión de minutos.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default VoiceInsights;
