
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CheckCircle, Eye, Calendar, User, Mail, FileText, Globe } from 'lucide-react';
import { EmailLog } from '@/types/email';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { formatBogotaDateTime } from "@/utils/dateUtils";

interface EmailDetailDialogProps {
  email: EmailLog | null;
  isOpen: boolean;
  onClose: () => void;
}

export function EmailDetailDialog({ email, isOpen, onClose }: EmailDetailDialogProps) {
  if (!email) return null;

  const getStatusColor = (status: EmailLog['Status']) => {
    switch (status) {
      case 'Success':
        return 'bg-green-100 text-green-800';
      case 'Failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Detalles del Correo</span>
            <Badge className={getStatusColor(email.Status)} variant="secondary">
              {email.Status === 'Success' ? 'Exitoso' : 'Fallido'}
            </Badge>
          </DialogTitle>
        </DialogHeader>
        
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
                  {formatBogotaDateTime(new Date(email.CreatedAt), "dd/MM/yyyy HH:mm", { locale: es })}
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                {email.OpenedAt ? (
                  <>
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium">Abierto:</span>
                    <span className="text-sm text-green-600">
                      {format(new Date(email.OpenedAt), "dd/MM/yyyy HH:mm", { locale: es })}
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
            </div>
          </div>

          <Separator />

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
        </div>
      </DialogContent>
    </Dialog>
  );
}
