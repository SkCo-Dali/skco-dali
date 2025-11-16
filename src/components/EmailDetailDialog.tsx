import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CheckCircle, Eye, Calendar, User, Mail, FileText, Globe, Download, Paperclip, Send, FileImage } from 'lucide-react';
import { EmailLogDetail } from '@/types/email';
import { formatBogotaDateTime } from "@/utils/dateUtils";

interface EmailDetailDialogProps {
  email: EmailLogDetail | null;
  isOpen: boolean;
  onClose: () => void;
  isLoading?: boolean;
  onDownloadAttachment: (logId: string, fileName: string) => Promise<void>;
  onResendEmail?: (email: EmailLogDetail) => void;
}

export function EmailDetailDialog({ email, isOpen, onClose, isLoading, onDownloadAttachment, onResendEmail }: EmailDetailDialogProps) {
  if (!email && !isLoading) return null;

  const isImageAttachment = (fileName: string) => {
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp', '.svg'];
    return imageExtensions.some(ext => fileName.toLowerCase().endsWith(ext));
  };

  const getStatusColor = (status: EmailLogDetail['Status']) => {
    switch (status) {
      case 'SENT':
        return 'bg-green-100 text-green-800';
      case 'ERROR':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Detalles del Correo</span>
          </DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="h-[calc(90vh-120px)] pr-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : email ? (
          <div className="space-y-4">
            {/* Información general */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Destinatario:</span>
                <span className="text-sm">{email.ToEmail}</span>
              </div>
              
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Remitente:</span>
                <span className="text-sm">{email.FromEmail}</span>
              </div>
              
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Campaña:</span>
                <Badge variant="outline">{email.Campaign || 'Sin campaña'}</Badge>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Fecha de envío:</span>
                <span className="text-sm">
                  {formatBogotaDateTime(email.CreatedAt, "dd/MM/yyyy HH:mm")}
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                {email.OpenedAt ? (
                  <>
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium">Abierto:</span>
                    <span className="text-sm text-green-600">
                      {formatBogotaDateTime(email.OpenedAt, "dd/MM/yyyy HH:mm")}
                    </span>
                  </>
                ) : (
                  <>
                    <Eye className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium text-muted-foreground">No abierto</span>
                  </>
                )}
              </div>
              
              {email.OpenedFromIP && (
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">IP de apertura:</span>
                  <span className="text-sm">{email.OpenedFromIP}</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Estado:</span>
                <Badge className={getStatusColor(email.Status)} variant="secondary">
                  {email.Status === 'SENT' ? 'Exitoso' : 'Fallido'}
                </Badge>
              </div>
            </div>
          </div>

          <Separator />

          {/* Adjuntos */}
          {email.attachments && email.attachments.length > 0 && (
            <>
              <div>
                <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
                  <Paperclip className="h-4 w-4" />
                  Archivos Adjuntos ({email.attachments.length})
                </h3>
                <div className="space-y-2">
                  {email.attachments.map((attachment, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">{attachment.fileName}</span>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onDownloadAttachment(email.Id, attachment.fileName)}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Descargar
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
              <Separator />
            </>
          )}

          {/* Asunto */}
          <div>
            <h3 className="font-medium mb-2">Asunto del Correo</h3>
            <p className="text-sm bg-muted p-3 rounded-md">{email.Subject}</p>
          </div>

          {/* Error si existe */}
          {email.ErrorMessage && (
            <div>
              <h3 className="font-medium mb-2 text-red-600">Mensaje de Error</h3>
              <p className="text-sm bg-red-50 text-red-800 p-3 rounded-md border border-red-200">
                {email.ErrorMessage}
              </p>
            </div>
          )}

          {/* Contenido del correo */}
          <div className="flex-1">
            <Tabs defaultValue="html" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="html">Vista HTML</TabsTrigger>
                <TabsTrigger value="plain">Texto Plano</TabsTrigger>
              </TabsList>
              
              <TabsContent value="html" className="mt-4">
                <div className="border rounded-md">
                  <div className="bg-muted px-3 py-2 text-sm font-medium">
                    Contenido HTML
                  </div>
                  <ScrollArea className="h-[300px] p-4">
                    <div 
                      dangerouslySetInnerHTML={{ __html: email.HtmlContent }}
                      className="prose prose-sm max-w-none"
                    />
                  </ScrollArea>
                </div>
              </TabsContent>
              
              <TabsContent value="plain" className="mt-4">
                <div className="border rounded-md">
                  <div className="bg-muted px-3 py-2 text-sm font-medium">
                    Texto Plano
                  </div>
                  <ScrollArea className="h-[300px] p-4">
                    <pre className="whitespace-pre-wrap text-sm">
                      {email.PlainContent}
                    </pre>
                  </ScrollArea>
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Información adicional del User Agent */}
          {email.OpenedFromUserAgent && (
            <div>
              <h3 className="font-medium mb-2">Información del Navegador</h3>
              <p className="text-xs text-muted-foreground bg-muted p-2 rounded-md">
                {email.OpenedFromUserAgent}
              </p>
            </div>
          )}

          {/* Botón de reenviar */}
          {onResendEmail && (
            <div className="mt-6 flex justify-end">
              <Button
                onClick={() => onResendEmail(email)}
                variant="default"
                className="gap-2"
              >
                <Send className="h-4 w-4" />
                Reenviar este correo
              </Button>
            </div>
          )}
        </div>
        ) : null}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
