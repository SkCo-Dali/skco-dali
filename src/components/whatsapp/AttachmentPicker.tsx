import { useState, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Upload, 
  FileText, 
  Image, 
  X,
  AlertCircle
} from 'lucide-react';
import { FileRef } from '@/types/whatsapp-propio';
import { useToast } from '@/hooks/use-toast';

interface AttachmentPickerProps {
  attachments: FileRef[];
  onAttachmentsChange: (attachments: FileRef[]) => void;
  maxFiles?: number;
}

export function AttachmentPicker({ 
  attachments, 
  onAttachmentsChange,
  maxFiles = 2
}: AttachmentPickerProps) {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const allowedTypes = [
    'image/jpeg',
    'image/png', 
    'image/gif',
    'image/webp',
    'application/pdf'
  ];

  const maxFileSize = 16 * 1024 * 1024; // 16MB

  const handleFileSelect = (files: FileList | null) => {
    if (!files) return;

    const newFiles: FileRef[] = [];
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      // Verificar tipo
      if (!allowedTypes.includes(file.type)) {
        toast({
          title: "Tipo de archivo no soportado",
          description: `${file.name} - Solo se permiten imágenes y PDFs`,
          variant: "destructive"
        });
        continue;
      }

      // Verificar tamaño
      if (file.size > maxFileSize) {
        toast({
          title: "Archivo muy grande",
          description: `${file.name} - Máximo 16MB`,
          variant: "destructive"
        });
        continue;
      }

      // Verificar límite
      if (attachments.length + newFiles.length >= maxFiles) {
        toast({
          title: "Límite de archivos",
          description: `Máximo ${maxFiles} archivos permitidos`,
          variant: "destructive"
        });
        break;
      }

      // Crear FileRef
      const fileRef: FileRef = {
        name: file.name,
        url: URL.createObjectURL(file),
        type: file.type,
        size: file.size
      };

      newFiles.push(fileRef);
    }

    if (newFiles.length > 0) {
      onAttachmentsChange([...attachments, ...newFiles]);
    }
  };

  const removeAttachment = (index: number) => {
    const newAttachments = [...attachments];
    // Liberar URL del objeto
    URL.revokeObjectURL(newAttachments[index].url);
    newAttachments.splice(index, 1);
    onAttachmentsChange(newAttachments);
  };

  const formatFileSize = (bytes: number) => {
    const mb = bytes / (1024 * 1024);
    return mb > 1 ? `${mb.toFixed(1)} MB` : `${(bytes / 1024).toFixed(0)} KB`;
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return Image;
    if (type === 'application/pdf') return FileText;
    return FileText;
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileSelect(e.dataTransfer.files);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">Adjuntos (opcional)</span>
        <Badge variant="outline" className="text-xs">
          Máximo {maxFiles} archivos
        </Badge>
      </div>

      {/* Área de upload */}
      <Card 
        className={`relative cursor-pointer transition-colors ${
          isDragging ? 'border-primary bg-primary/5' : 'hover:bg-gray-50'
        }`}
        onClick={() => fileInputRef.current?.click()}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <CardContent className="flex flex-col items-center justify-center py-8 text-center">
          <Upload className={`h-8 w-8 mb-2 ${isDragging ? 'text-primary' : 'text-gray-400'}`} />
          <p className="text-sm text-muted-foreground mb-1">
            Arrastra archivos aquí o haz clic para seleccionar
          </p>
          <p className="text-xs text-muted-foreground">
            Imágenes (JPG, PNG, GIF, WebP) y PDF • Máx. 16MB
          </p>
        </CardContent>
      </Card>

      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept={allowedTypes.join(',')}
        onChange={(e) => handleFileSelect(e.target.files)}
        className="hidden"
      />

      {/* Lista de archivos adjuntos */}
      {attachments.length > 0 && (
        <div className="space-y-2">
          {attachments.map((file, index) => {
            const Icon = getFileIcon(file.type);
            return (
              <Card key={index} className="p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Icon className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium truncate max-w-[200px]">
                        {file.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatFileSize(file.size)}
                      </p>
                    </div>
                  </div>
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeAttachment(index);
                    }}
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Advertencia sobre límites */}
      {attachments.length >= maxFiles && (
        <div className="flex items-center gap-2 p-2 bg-yellow-50 text-yellow-800 rounded text-sm">
          <AlertCircle className="h-4 w-4" />
          Has alcanzado el límite de {maxFiles} archivos adjuntos
        </div>
      )}
    </div>
  );
}