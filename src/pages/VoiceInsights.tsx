import { useState, useEffect, useRef } from "react";
import { Mic, MicOff, Brain, Info, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import { useVoiceRecording } from "@/hooks/useVoiceRecording";
import { transcribeAudio } from "@/utils/transcriptionApi";

const VoiceInsights = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [hasRecording, setHasRecording] = useState(false);
  const [showWarning, setShowWarning] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isProcessingFile, setIsProcessingFile] = useState(false);
  const [contextNote, setContextNote] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  const MAX_RECORDING_TIME = 7200; // 2 horas en segundos
  const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25MB en bytes

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
    setContextNote("");
    await toggleRecording();
  };

  const handleStopRecording = async () => {
    setIsRecording(false);
    setHasRecording(true);
    await toggleRecording();
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    
    if (!file) return;

    // Validar tipo de archivo
    const validTypes = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/webm', 'audio/ogg', 'audio/m4a', 'audio/mp4'];
    if (!validTypes.includes(file.type) && !file.name.match(/\.(mp3|wav|webm|ogg|m4a|mp4)$/i)) {
      toast.error('Formato de archivo no válido. Por favor sube un archivo de audio (MP3, WAV, WEBM, OGG, M4A).');
      return;
    }

    // Validar tamaño del archivo
    if (file.size > MAX_FILE_SIZE) {
      toast.error('El archivo es demasiado grande. El tamaño máximo es 25MB.');
      return;
    }

    setUploadedFile(file);
    setHasRecording(false); // Si hay una grabación, la reemplazamos con el archivo
    setContextNote("");
    toast.success(`Archivo "${file.name}" cargado correctamente`);
  };

  const handleRemoveFile = () => {
    setUploadedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleAnalyze = async () => {
    if (uploadedFile) {
      setIsProcessingFile(true);
      try {
        // Procesar el archivo subido
        const transcribedText = await transcribeAudio(uploadedFile);
        
        if (transcribedText && transcribedText.trim()) {
          console.log('Transcripción del archivo:', transcribedText);
          if (contextNote.trim()) {
            console.log('Contexto proporcionado:', contextNote);
          }
        }
        
        toast.success(
          "✅ Archivo enviado. En pocos minutos, recibirás en tu correo un resumen completo del análisis realizado por Sami, incluyendo sugerencias personalizadas de productos.",
          { duration: 6000 }
        );
        
        // Reset states
        setUploadedFile(null);
        setContextNote("");
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      } catch (error) {
        console.error('Error procesando el archivo:', error);
        toast.error('Error al procesar el archivo de audio. Inténtalo de nuevo.');
      } finally {
        setIsProcessingFile(false);
      }
    } else {
      if (contextNote.trim()) {
        console.log('Contexto proporcionado:', contextNote);
      }
      toast.success(
        "✅ Grabación enviada. En pocos minutos, recibirás en tu correo un resumen completo del análisis realizado por Sami, incluyendo sugerencias personalizadas de productos.",
        { duration: 6000 }
      );
      // Reset states
      setHasRecording(false);
      setRecordingTime(0);
      setContextNote("");
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 py-4 px-4 flex items-center">
      <div className="max-w-4xl mx-auto w-full space-y-4">
        {/* Header */}
        <div className="text-center space-y-1">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground">
            Sami Voice Insights
          </h1>
          <p className="text-sm text-muted-foreground max-w-2xl mx-auto">
            Graba, analiza y recibe recomendaciones personalizadas en minutos.
          </p>
        </div>

        {/* Main Card */}
        <Card className="p-4 md:p-6 shadow-xl border-2">
          <div className="space-y-4">
            {/* Recording Button */}
            <div className="flex flex-col items-center space-y-3">
              <Button
                size="lg"
                onClick={isRecording ? handleStopRecording : handleStartRecording}
                disabled={isProcessing || !!uploadedFile}
                className={`h-24 w-24 rounded-full text-lg font-semibold shadow-2xl transform transition-all duration-300 hover:scale-105 ${
                  isRecording
                    ? "bg-destructive hover:bg-destructive/90"
                    : "gradient-skandia hover:opacity-90"
                }`}
              >
                {isRecording ? (
                  <MicOff className="h-10 w-10" />
                ) : (
                  <Mic className="h-10 w-10" />
                )}
              </Button>

              <div className="text-center space-y-1">
                <p className="text-lg font-bold text-foreground">
                  {isRecording ? "Detener grabación" : "Iniciar grabación"}
                </p>
                {!isRecording && !hasRecording && !uploadedFile && (
                  <p className="text-xs text-muted-foreground">
                    Presiona el botón para comenzar
                  </p>
                )}
              </div>
            </div>

            {/* Divider */}
            {!isRecording && !hasRecording && !uploadedFile && (
              <div className="flex items-center space-x-4 my-3">
                <div className="flex-1 h-px bg-border" />
                <span className="text-xs text-muted-foreground font-medium">o</span>
                <div className="flex-1 h-px bg-border" />
              </div>
            )}

            {/* Upload Button */}
            {!isRecording && !hasRecording && !uploadedFile && (
              <div className="flex flex-col items-center space-y-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="audio/*,.mp3,.wav,.webm,.ogg,.m4a,.mp4"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <Button
                  size="lg"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isProcessing || isRecording}
                  variant="outline"
                  className="h-12 px-6 text-base font-semibold border-2 hover:bg-muted/50 shadow-lg transform transition-all duration-300 hover:scale-105"
                >
                  <Upload className="h-5 w-5 mr-2" />
                  Subir archivo de audio
                </Button>
                <p className="text-xs text-muted-foreground text-center max-w-md">
                  Formatos soportados: MP3, WAV, WEBM, OGG, M4A • Máximo 25MB
                </p>
              </div>
            )}

            {/* Uploaded File Info */}
            {uploadedFile && !isRecording && (
              <div className="flex flex-col items-center space-y-2 animate-fade-in">
                <Card className="p-3 w-full max-w-md bg-muted/30 border-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3 flex-1 min-w-0">
                      <div className="bg-primary/10 p-2 rounded-lg">
                        <Upload className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-foreground truncate">
                          {uploadedFile.name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {formatFileSize(uploadedFile.size)}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handleRemoveFile}
                      className="ml-2 hover:bg-destructive/10 hover:text-destructive"
                    >
                      <X className="h-5 w-5" />
                    </Button>
                  </div>
                </Card>
              </div>
            )}

            {/* Timer */}
            {isRecording && (
              <div className="flex flex-col items-center space-y-2 animate-fade-in">
                <div className="flex items-center space-x-2 bg-muted/50 px-6 py-3 rounded-2xl">
                  <div className="h-2 w-2 rounded-full bg-destructive animate-pulse" />
                  <span className="text-2xl font-mono font-bold text-foreground">
                    {formatTime(recordingTime)}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
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

            {/* Context Note */}
            {(hasRecording || uploadedFile) && !isRecording && (
              <div className="flex flex-col space-y-2 animate-fade-in">
                <label htmlFor="context-note" className="text-sm font-medium text-foreground">
                  Contexto adicional (opcional)
                </label>
                <textarea
                  id="context-note"
                  value={contextNote}
                  onChange={(e) => setContextNote(e.target.value)}
                  placeholder="Ej: Esta es una conversación con un cliente interesado en seguros de vida..."
                  className="w-full min-h-[80px] p-3 rounded-lg border-2 border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none text-sm"
                  maxLength={500}
                />
                <p className="text-xs text-muted-foreground text-right">
                  {contextNote.length}/500 caracteres
                </p>
              </div>
            )}

            {/* Analyze Button */}
            {(hasRecording || uploadedFile) && !isRecording && (
              <div className="flex flex-col items-center space-y-2 animate-fade-in">
                <Button
                  size="lg"
                  onClick={handleAnalyze}
                  disabled={isProcessingFile}
                  className="h-12 px-6 text-base font-semibold gradient-skandia hover:opacity-90 shadow-xl transform transition-all duration-300 hover:scale-105"
                >
                  <Brain className="h-5 w-5 mr-2" />
                  {isProcessingFile ? "Procesando..." : "Analizar con Sami Voice Insights"}
                </Button>
                <p className="text-xs text-muted-foreground text-center max-w-md">
                  Envía tu {uploadedFile ? "archivo" : "grabación"} para recibir un análisis detallado con
                  recomendaciones personalizadas
                </p>
              </div>
            )}
          </div>
        </Card>

        {/* Info Section */}
        <Card className="p-4 bg-muted/30 border">
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Info className="h-4 w-4 text-primary" />
              <h3 className="text-base font-semibold text-foreground">
                ¿Qué es Sami Voice Insights?
              </h3>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
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
