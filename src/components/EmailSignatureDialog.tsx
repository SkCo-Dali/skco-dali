import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { RichTextEditor } from "@/components/RichTextEditor";
import { useToast } from "@/hooks/use-toast";
import { FileSignature, Save } from "lucide-react";

interface EmailSignature {
  id: string;
  name: string;
  content: string;
  isDefault: boolean;
}

interface EmailSignatureDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onInsertSignature: (content: string) => void;
}

export function EmailSignatureDialog({
  isOpen,
  onClose,
  onInsertSignature,
}: EmailSignatureDialogProps) {
  const [signatures, setSignatures] = useState<EmailSignature[]>([]);
  const [editingSignature, setEditingSignature] = useState<EmailSignature | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [signatureName, setSignatureName] = useState("");
  const [signatureContent, setSignatureContent] = useState("");
  const { toast } = useToast();

  // Cargar firmas desde localStorage al abrir
  useEffect(() => {
    if (isOpen) {
      loadSignatures();
    }
  }, [isOpen]);

  const loadSignatures = () => {
    try {
      const stored = localStorage.getItem("email_signatures");
      if (stored) {
        setSignatures(JSON.parse(stored));
      }
    } catch (error) {
      console.error("Error loading signatures:", error);
    }
  };

  const saveSignatures = (newSignatures: EmailSignature[]) => {
    try {
      localStorage.setItem("email_signatures", JSON.stringify(newSignatures));
      setSignatures(newSignatures);
    } catch (error) {
      console.error("Error saving signatures:", error);
      toast({
        title: "Error",
        description: "No se pudo guardar la firma",
        variant: "destructive",
      });
    }
  };

  const handleCreateNew = () => {
    setIsCreating(true);
    setEditingSignature(null);
    setSignatureName("");
    setSignatureContent("");
  };

  const handleEdit = (signature: EmailSignature) => {
    setIsCreating(false);
    setEditingSignature(signature);
    setSignatureName(signature.name);
    setSignatureContent(signature.content);
  };

  const handleSave = () => {
    if (!signatureName.trim()) {
      toast({
        title: "Error",
        description: "Por favor ingresa un nombre para la firma",
        variant: "destructive",
      });
      return;
    }

    if (!signatureContent.trim()) {
      toast({
        title: "Error",
        description: "Por favor ingresa el contenido de la firma",
        variant: "destructive",
      });
      return;
    }

    let newSignatures: EmailSignature[];

    if (editingSignature) {
      // Actualizar firma existente
      newSignatures = signatures.map((sig) =>
        sig.id === editingSignature.id
          ? { ...sig, name: signatureName, content: signatureContent }
          : sig
      );
    } else {
      // Crear nueva firma
      const newSignature: EmailSignature = {
        id: Date.now().toString(),
        name: signatureName,
        content: signatureContent,
        isDefault: signatures.length === 0,
      };
      newSignatures = [...signatures, newSignature];
    }

    saveSignatures(newSignatures);
    setIsCreating(false);
    setEditingSignature(null);
    setSignatureName("");
    setSignatureContent("");

    toast({
      title: "Éxito",
      description: "Firma guardada correctamente",
    });
  };

  const handleDelete = (id: string) => {
    const newSignatures = signatures.filter((sig) => sig.id !== id);
    saveSignatures(newSignatures);
    toast({
      title: "Firma eliminada",
      description: "La firma se eliminó correctamente",
    });
  };

  const handleInsert = (signature: EmailSignature) => {
    onInsertSignature(signature.content);
    onClose();
    toast({
      title: "Firma insertada",
      description: "La firma se agregó al correo",
    });
  };

  const handleCancel = () => {
    setIsCreating(false);
    setEditingSignature(null);
    setSignatureName("");
    setSignatureContent("");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileSignature className="w-5 h-5" />
            Mis Firmas de Correo
          </DialogTitle>
          <DialogDescription>
            Crea y administra tus firmas de correo electrónico. Puedes copiar tu firma desde Outlook y pegarla aquí.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {!isCreating && !editingSignature ? (
            <>
              {/* Lista de firmas */}
              <div className="space-y-2">
                {signatures.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <FileSignature className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>No tienes firmas guardadas</p>
                    <p className="text-sm">Crea tu primera firma para comenzar</p>
                  </div>
                ) : (
                  signatures.map((signature) => (
                    <div
                      key={signature.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                    >
                      <div className="font-medium">{signature.name}</div>
                      <div className="flex gap-2 ml-4">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleInsert(signature)}
                        >
                          Insertar
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(signature)}
                        >
                          Editar
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDelete(signature.id)}
                        >
                          Eliminar
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <DialogFooter>
                <Button onClick={handleCreateNew}>
                  <FileSignature className="w-4 h-4 mr-2" />
                  Crear Nueva Firma
                </Button>
              </DialogFooter>
            </>
          ) : (
            <>
              {/* Formulario de creación/edición */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signature-name">Nombre de la firma</Label>
                  <Input
                    id="signature-name"
                    placeholder="Ej: Firma profesional, Firma casual..."
                    value={signatureName}
                    onChange={(e) => setSignatureName(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Contenido de la firma</Label>
                  <p className="text-sm text-muted-foreground">
                    Diseña tu firma o copia y pega tu firma desde Outlook
                  </p>
                  <div className="border rounded-lg overflow-hidden">
                    <RichTextEditor
                      value={signatureContent}
                      onChange={setSignatureContent}
                      placeholder="Escribe tu firma aquí o pégala desde Outlook..."
                    />
                  </div>
                </div>
              </div>

              <DialogFooter className="gap-2">
                <Button variant="outline" onClick={handleCancel}>
                  Cancelar
                </Button>
                <Button onClick={handleSave}>
                  <Save className="w-4 h-4 mr-2" />
                  Guardar Firma
                </Button>
              </DialogFooter>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
