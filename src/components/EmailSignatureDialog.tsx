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
import { FileSignature, Save, Loader2 } from "lucide-react";
import {
  fetchAllSignatures,
  saveSignature,
  deleteSignature,
  EmailSignature as ApiEmailSignature,
} from "@/utils/emailSignaturesApiClient";

interface EmailSignature {
  name: string;
  content: string;
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
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  // Cargar firmas desde el backend al abrir
  useEffect(() => {
    if (isOpen) {
      loadSignatures();
    }
  }, [isOpen]);

  const loadSignatures = async () => {
    setLoading(true);
    try {
      const apiSignatures = await fetchAllSignatures();
      const mappedSignatures: EmailSignature[] = apiSignatures.map((sig) => ({
        name: sig.signature_name,
        content: sig.html_signature,
      }));
      setSignatures(mappedSignatures);
    } catch (error) {
      console.error("Error loading signatures:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "No se pudieron cargar las firmas",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
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

  const handleSave = async () => {
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

    setSaving(true);
    try {
      await saveSignature(signatureName.trim(), signatureContent);
      
      toast({
        title: "Éxito",
        description: `Firma '${signatureName}' guardada correctamente`,
      });

      // Recargar la lista de firmas
      await loadSignatures();
      
      setIsCreating(false);
      setEditingSignature(null);
      setSignatureName("");
      setSignatureContent("");
    } catch (error) {
      console.error("Error saving signature:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "No se pudo guardar la firma",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (signatureName: string) => {
    try {
      const message = await deleteSignature(signatureName);
      
      toast({
        title: "Firma eliminada",
        description: message,
      });

      // Recargar la lista de firmas
      await loadSignatures();
    } catch (error) {
      console.error("Error deleting signature:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "No se pudo eliminar la firma",
        variant: "destructive",
      });
    }
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
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
          ) : !isCreating && !editingSignature ? (
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
                      key={signature.name}
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
                          onClick={() => handleDelete(signature.name)}
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
                <Button variant="outline" onClick={handleCancel} disabled={saving}>
                  Cancelar
                </Button>
                <Button onClick={handleSave} disabled={saving}>
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Guardando...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Guardar Firma
                    </>
                  )}
                </Button>
              </DialogFooter>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
