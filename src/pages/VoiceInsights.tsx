import { useState, useEffect, useRef } from "react";
import { Mic, MicOff, Brain, Info, Upload, X, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { toast } from "sonner";
import { useVoiceRecording } from "@/hooks/useVoiceRecording";
import { transcribeAudio } from "@/utils/transcriptionApi";
import { createLead } from "@/utils/leadsApiClient";
import { useMsal } from "@azure/msal-react";
import { useAuth } from "@/contexts/AuthContext";
import { Lead } from "@/types/crm";

const productOptions = [
  "ACCAI",
  "C.A.T", 
  "CREA",
  "ENGRAV",
  "FCES",
  "FCO",
  "FCPIMP",
  "ICRFLO",
  "MFUND",
  "OMINMA",
  "OMPEV"
];

const VoiceInsights = () => {
  const { user } = useAuth();
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [hasRecording, setHasRecording] = useState(false);
  const [showWarning, setShowWarning] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isProcessingFile, setIsProcessingFile] = useState(false);
  const [contextNote, setContextNote] = useState("");
  const [showMoreFields, setShowMoreFields] = useState(false);
  const [productSelectOpen, setProductSelectOpen] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  const MAX_RECORDING_TIME = 7200; // 2 horas en segundos
  const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25MB en bytes

  // Lead form data
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    notes: '',
    documentType: '',
    documentNumber: undefined as number | undefined,
    campaign: '',
    age: undefined as number | undefined,
    gender: '',
    preferredContactChannel: ''
  });

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
    // Validar campos requeridos
    if (!formData.name || !formData.email || !formData.phone || !formData.documentType || !formData.documentNumber || selectedProducts.length === 0) {
      toast.error('Por favor completa todos los campos obligatorios antes de analizar');
      return;
    }

    // Validar formato de email
    if (!isValidEmail(formData.email)) {
      toast.error('Por favor ingresa un correo electrónico válido');
      return;
    }

    setIsProcessingFile(true);

    try {
      // Crear el lead
      const leadData = {
        CreatedBy: user?.id || '',
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        documentNumber: formData.documentNumber || 0,
        company: formData.company || '',
        source: 'DaliLM',
        campaign: formData.campaign || '',
        product: selectedProducts,
        stage: 'Nuevo',
        priority: 'Media',
        value: 0,
        assignedTo: user?.id || '',
        notes: `${formData.notes ? formData.notes + '\n\n' : ''}Contexto adicional: ${contextNote}`.trim(),
        tags: ['Sami Voice Insights'],
        DocumentType: formData.documentType,
        SelectedPortfolios: [],
        CampaignOwnerName: user?.name || '',
        Age: formData.age || 0,
        Gender: formData.gender || '',
        PreferredContactChannel: formData.preferredContactChannel || ''
      };

      await createLead(leadData);
      
      if (uploadedFile) {
        // Procesar el archivo subido
        const transcribedText = await transcribeAudio(uploadedFile);
        
        if (transcribedText && transcribedText.trim()) {
          console.log('Transcripción del archivo:', transcribedText);
        }
      }
      
      toast.success(
        "✅ Lead creado exitosamente. En pocos minutos, recibirás en tu correo un resumen completo del análisis realizado por Sami, incluyendo sugerencias personalizadas de productos.",
        { duration: 6000 }
      );
      
      // Reset states
      setUploadedFile(null);
      setContextNote("");
      setHasRecording(false);
      setRecordingTime(0);
      setSelectedProducts([]);
      setShowMoreFields(false);
      setFormData({
        name: '',
        email: '',
        phone: '',
        company: '',
        notes: '',
        documentType: '',
        documentNumber: undefined,
        campaign: '',
        age: undefined,
        gender: '',
        preferredContactChannel: ''
      });
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Error procesando:', error);
      toast.error('Error al procesar. Inténtalo de nuevo.');
    } finally {
      setIsProcessingFile(false);
    }
  };

  const handleProductToggle = (product: string) => {
    const updatedProducts = selectedProducts.includes(product)
      ? selectedProducts.filter(p => p !== product)
      : [...selectedProducts, product];
    
    setSelectedProducts(updatedProducts);
  };

  const getProductDisplayText = () => {
    const selectedCount = selectedProducts.length;
    if (selectedCount === 0) return "Producto de interés*";
    if (selectedCount === 1) return selectedProducts[0];
    return `${selectedCount} productos seleccionados`;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const numericValue = value.replace(/[^0-9]/g, '');
    setFormData({...formData, phone: numericValue});
  };

  const handleDocumentNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const numericValue = value.replace(/[^0-9]/g, '');
    setFormData({...formData, documentNumber: numericValue ? Number(numericValue) : undefined});
  };

  const handleAgeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const numericValue = value.replace(/[^0-9]/g, '');
    setFormData({...formData, age: numericValue ? Number(numericValue) : undefined});
  };

  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
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

            {/* Lead Form */}
            {(isRecording || hasRecording || uploadedFile) && (
              <div className="space-y-4 animate-fade-in border-t pt-4">
                <h3 className="text-lg font-semibold text-foreground">Información del Lead</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="relative">
                    <Select value={formData.documentType} onValueChange={(value) => setFormData({...formData, documentType: value})}>
                      <SelectTrigger className="border-gray-300 rounded-xl h-12 bg-gray-50">
                        <SelectValue className="!text-muted-foreground" placeholder="Tipo de identificación*" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="C">Cédula de ciudadanía</SelectItem>
                        <SelectItem value="P">Pasaporte</SelectItem>
                        <SelectItem value="E">Cédula de Extranjería</SelectItem>
                        <SelectItem value="T">Tarjeta de Identidad</SelectItem>
                        <SelectItem value="N">NIT</SelectItem>
                      </SelectContent>
                    </Select>
                    {formData.documentType && (
                      <Label className="absolute -top-2 left-3 bg-gray-50 px-1 text-xs text-gray-600">
                        Tipo de identificación*
                      </Label>
                    )}
                  </div>
                  
                  <div className="relative">
                    <Input
                      type="text"
                      value={formData.documentNumber?.toString() || ''}
                      onChange={handleDocumentNumberChange}
                      className="border-gray-300 rounded-xl h-12 bg-gray-50"
                      placeholder="Número de identificación*"
                    />
                    {formData.documentNumber && (
                      <Label className="absolute -top-2 left-3 bg-gray-50 px-1 text-xs text-gray-600">
                        Número de identificación*
                      </Label>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="relative">
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="border-gray-300 rounded-xl h-12 bg-gray-50"
                      placeholder="Nombres y apellidos*"
                    />
                    {formData.name && (
                      <Label className="absolute -top-2 left-3 bg-gray-50 px-1 text-xs text-gray-600">
                        Nombres y apellidos*
                      </Label>
                    )}
                  </div>
                  <div className="relative">
                    <Input
                      value={formData.phone}
                      onChange={handlePhoneChange}
                      className="border-gray-300 rounded-xl h-12 bg-gray-50"
                      placeholder="Celular*"
                    />
                    {formData.phone && (
                      <Label className="absolute -top-2 left-3 bg-gray-50 px-1 text-xs text-gray-600">
                        Celular*
                      </Label>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="relative">
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className={`border-gray-300 rounded-xl h-12 bg-gray-50 ${formData.email && !isValidEmail(formData.email) ? 'border-red-500' : ''}`}
                      placeholder="Correo electrónico*"
                    />
                    {formData.email && (
                      <Label className="absolute -top-2 left-3 bg-gray-50 px-1 text-xs text-gray-600">
                        Correo electrónico*
                      </Label>
                    )}
                    {formData.email && !isValidEmail(formData.email) && (
                      <p className="text-red-500 text-xs mt-1">Formato de correo inválido</p>
                    )}
                  </div>
                  <div className="relative">
                    <Popover open={productSelectOpen} onOpenChange={setProductSelectOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full !px-4 justify-between border border-gray-300 rounded-xl h-12 bg-gray-50 font-normal hover:bg-gray-50"
                        >
                          <span className={selectedProducts.length === 0 ? "text-left text-muted-foreground" : ""}>
                            {getProductDisplayText()}
                          </span>
                          <ChevronDown className="h-4 w-4 text-[#00C73D]" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-full p-0" align="start">
                        <div className="max-h-60 overflow-y-auto">
                          {productOptions.map((product) => (
                            <div key={product} className="flex items-center space-x-2 p-3 hover:bg-gray-50">
                              <Checkbox
                                id={product}
                                checked={selectedProducts.includes(product)}
                                onCheckedChange={() => handleProductToggle(product)}
                              />
                              <label
                                htmlFor={product}
                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex-1"
                              >
                                {product}
                              </label>
                            </div>
                          ))}
                        </div>
                      </PopoverContent>
                    </Popover>
                    {selectedProducts.length > 0 && (
                      <Label className="absolute -top-2 left-3 bg-gray-50 px-1 text-xs text-gray-600">
                        Producto de interés*
                      </Label>
                    )}
                  </div>
                </div>
                
                <div className="relative">
                  <Input
                    value={formData.campaign}
                    onChange={(e) => setFormData({...formData, campaign: e.target.value})}
                    className="border-gray-300 rounded-xl h-12 bg-gray-50"
                    placeholder="Campaña"
                  />
                  {formData.campaign && (
                    <Label className="absolute -top-2 left-3 bg-gray-50 px-1 text-xs text-gray-600">
                      Campaña
                    </Label>
                  )}
                </div>
                
                <div className="relative">
                  <Textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({...formData, notes: e.target.value})}
                    className="border-gray-300 rounded-xl resize-none bg-gray-50 min-h-[80px]"
                    placeholder="Comentarios:"
                    rows={3}
                  />
                  {formData.notes && (
                    <Label className="absolute -top-2 left-3 bg-gray-50 px-1 text-xs text-gray-600">
                      Comentarios:
                    </Label>
                  )}
                </div>

                {showMoreFields && (
                  <div className="space-y-4 border-t pt-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="relative">
                        <Input
                          type="text"
                          value={formData.age?.toString() || ''}
                          onChange={handleAgeChange}
                          className="border-gray-300 rounded-xl h-12 bg-gray-50"
                          placeholder="Edad"
                        />
                        {formData.age && (
                          <Label className="absolute -top-2 left-3 bg-gray-50 px-1 text-xs text-gray-600">
                            Edad
                          </Label>
                        )}
                      </div>
                      
                      <div className="relative">
                        <Select value={formData.gender} onValueChange={(value) => setFormData({...formData, gender: value})}>
                          <SelectTrigger className="border-gray-300 rounded-xl h-12 bg-gray-50">
                            <SelectValue placeholder="Género" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="M">Masculino</SelectItem>
                            <SelectItem value="F">Femenino</SelectItem>
                            <SelectItem value="O">Otro</SelectItem>
                          </SelectContent>
                        </Select>
                        {formData.gender && (
                          <Label className="absolute -top-2 left-3 bg-gray-50 px-1 text-xs text-gray-600">
                            Género
                          </Label>
                        )}
                      </div>
                    </div>

                    <div className="relative">
                      <Input
                        value={formData.company}
                        onChange={(e) => setFormData({...formData, company: e.target.value})}
                        className="border-gray-300 rounded-xl h-12 bg-gray-50"
                        placeholder="Empresa"
                      />
                      {formData.company && (
                        <Label className="absolute -top-2 left-3 bg-gray-50 px-1 text-xs text-gray-600">
                          Empresa
                        </Label>
                      )}
                    </div>

                    <div className="relative">
                      <Select value={formData.preferredContactChannel} onValueChange={(value) => setFormData({...formData, preferredContactChannel: value})}>
                        <SelectTrigger className="border-gray-300 rounded-xl h-12 bg-gray-50">
                          <SelectValue placeholder="Canal de contacto preferido" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Phone">Teléfono</SelectItem>
                          <SelectItem value="Email">Correo electrónico</SelectItem>
                          <SelectItem value="WhatsApp">WhatsApp</SelectItem>
                          <SelectItem value="SMS">SMS</SelectItem>
                        </SelectContent>
                      </Select>
                      {formData.preferredContactChannel && (
                        <Label className="absolute -top-2 left-3 bg-gray-50 px-1 text-xs text-gray-600">
                          Canal de contacto preferido
                        </Label>
                      )}
                    </div>
                  </div>
                )}

                <Button
                  type="button"
                  variant="link"
                  onClick={() => setShowMoreFields(!showMoreFields)}
                  className="text-[#00C73D] hover:text-[#00C73D]/80 p-0 h-auto font-medium text-sm"
                >
                  {showMoreFields ? "- Ocultar más datos" : "+ Mostrar más datos"}
                </Button>

                <div className="flex flex-col space-y-2 mt-4">
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
