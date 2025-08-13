
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Upload, FileSpreadsheet } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { uploadLeadsFile } from "@/utils/leadsApiClient";
import { useAuth } from "@/contexts/AuthContext";

interface LeadsUploadProps {
  onLeadsUploaded: () => void;
}

export function LeadsUpload({ onLeadsUploaded }: LeadsUploadProps) {
  const [open, setOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    console.log('🚀 === LEADS UPLOAD: handleFileUpload triggered ===');
    const file = event.target.files?.[0];
    if (!file) {
      console.log('❌ No se seleccionó archivo');
      return;
    }
    console.log('📁 Archivo seleccionado para carga:', {
      name: file.name,
      size: file.size,
      type: file.type
    });

    if (!user?.id) {
      console.error('❌ Usuario no autenticado');
      toast({
        title: "Error",
        description: "Usuario no autenticado",
        variant: "destructive",
      });
      return;
    }

    // Validar tipo de archivo
    const allowedTypes = [
      'text/csv',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];
    
    const fileExtension = file.name.toLowerCase().split('.').pop();
    const allowedExtensions = ['csv', 'xls', 'xlsx'];
    
    if (!allowedTypes.includes(file.type) && !allowedExtensions.includes(fileExtension || '')) {
      console.error('❌ Tipo de archivo no válido:', file.type, 'Extensión:', fileExtension);
      toast({
        title: "Error",
        description: "Tipo de archivo no válido. Solo se permiten archivos CSV, XLS o XLSX",
        variant: "destructive",
      });
      return;
    }

    // Validar tamaño del archivo (máximo 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      console.error('❌ Archivo muy grande:', file.size, 'bytes');
      toast({
        title: "Error",
        description: "El archivo es muy grande. Máximo 10MB permitido",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    console.log('🔄 Iniciando carga masiva de leads...');
    console.log('📁 Archivo seleccionado:', {
      name: file.name,
      size: file.size,
      type: file.type,
      lastModified: new Date(file.lastModified).toLocaleString()
    });
    console.log('👤 Usuario actual:', {
      id: user.id,
      name: user.name,
      role: user.role
    });

    try {
      // Llamar a la API para cargar el archivo
      console.log('🔄 Llamando a uploadLeadsFile API...');
      await uploadLeadsFile(file, user.id);
      
      console.log('✅ Carga masiva completada exitosamente');
      
      toast({
        title: "Éxito",
        description: `Archivo "${file.name}" cargado exitosamente`,
      });
      
      // Notificar al componente padre para refrescar la lista
      onLeadsUploaded();
      
      // Cerrar el modal y limpiar el input
      setOpen(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
    } catch (error) {
      console.error('❌ Error en carga masiva:', error);
      
      let errorMessage = "Error al cargar el archivo";
      if (error instanceof Error) {
        errorMessage = error.message;
        console.error('❌ Mensaje de error:', error.message);
        console.error('❌ Stack trace:', error.stack);
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setUploading(false);
      console.log('🏁 Proceso de carga finalizado');
    }
  };

  const handleDialogOpenChange = (newOpen: boolean) => {
    if (!uploading) {
      setOpen(newOpen);
      // Limpiar el input cuando se cierra el modal
      if (!newOpen && fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleDialogOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon">
          <Upload className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Subir Leads Masivamente</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <FileSpreadsheet className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p className="text-sm text-gray-600 mb-4">
              Selecciona un archivo CSV o Excel con los leads
            </p>
            <p className="text-xs text-gray-500 mb-4">
              Formatos permitidos: .csv, .xls, .xlsx (máx. 10MB)
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.xlsx,.xls"
              onChange={(e) => {
                console.log('🎯 === FILE INPUT CHANGE EVENT TRIGGERED ===');
                console.log('📂 Event target files:', e.target.files);
                console.log('📂 Files length:', e.target.files?.length);
                if (e.target.files?.[0]) {
                  console.log('📁 Selected file details:', {
                    name: e.target.files[0].name,
                    size: e.target.files[0].size,
                    type: e.target.files[0].type
                  });
                }
                handleFileUpload(e);
              }}
              className="hidden"
              disabled={uploading}
            />
            <Button 
              onClick={() => {
                console.log('🔘 === CARGAR LEADS BUTTON CLICKED ===');
                console.log('📁 fileInputRef.current:', fileInputRef.current);
                console.log('⏳ uploading state:', uploading);
                fileInputRef.current?.click();
              }}
              disabled={uploading}
            >
              {uploading ? "Subiendo..." : "Seleccionar Archivo"}
            </Button>
          </div>
          
          <div className="text-xs text-gray-500 space-y-1">
            <p className="font-medium">Formato esperado del archivo:</p>
            <p>• Nombre, Email, Teléfono, Empresa, Fuente</p>
            <p>• La primera fila debe contener los encabezados</p>
            <p>• El email es obligatorio para cada lead</p>
          </div>
          
          {uploading && (
            <div className="flex items-center justify-center p-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mr-2"></div>
              <span className="text-sm text-muted-foreground">
                Procesando archivo, por favor espera...
              </span>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
