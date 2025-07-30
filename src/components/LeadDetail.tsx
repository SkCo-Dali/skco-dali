
import { useState, useCallback } from "react";
import { toast } from "sonner";
import { Lead } from "@/types/crm";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { User, Mail, Phone, MessageSquare } from "lucide-react";
import { useLeadsApi } from "@/hooks/useLeadsApi";
import { useUsersApi } from "@/hooks/useUsersApi";
import { OutlookCalendarScheduler } from "@/components/OutlookCalendarScheduler";

interface LeadDetailProps {
  lead: Lead;
  isOpen: boolean;
  onClose: () => void;
  onSave?: () => void;
  onOpenMassEmail?: (lead: Lead) => void;
}

export function LeadDetail({ lead, isOpen, onClose, onSave, onOpenMassEmail }: LeadDetailProps) {
  const [activeTab, setActiveTab] = useState("details");
  const [name, setName] = useState(lead.name);
  const [email, setEmail] = useState(lead.email);
  const [phone, setPhone] = useState(lead.phone || "");
  const [company, setCompany] = useState(lead.company || "");
  const [product, setProduct] = useState(lead.product || "");
  const [stage, setStage] = useState(lead.stage);
  const [priority, setPriority] = useState(lead.priority);
  const [source, setSource] = useState(lead.source);
  const [value, setValue] = useState(lead.value.toString());
  const [assignedTo, setAssignedTo] = useState(lead.assignedTo);
  const [documentType, setDocumentType] = useState(lead.documentType || "");
  const [documentNumber, setDocumentNumber] = useState(lead.documentNumber || "");
  const [campaign, setCampaign] = useState(lead.campaign || "");
  const [gender, setGender] = useState(lead.gender || "");
  const [age, setAge] = useState(lead.age ? lead.age.toString() : "");
  const [preferredContactChannel, setPreferredContactChannel] = useState(lead.preferredContactChannel || "");
  const [isSaving, setIsSaving] = useState(false);

  const { updateExistingLead } = useLeadsApi();
  const { users } = useUsersApi();

  const handleSave = useCallback(async () => {
    setIsSaving(true);
    try {
      const updatedLeadData: Lead = {
        ...lead,
        name,
        email,
        phone,
        company,
        product,
        stage,
        priority,
        source,
        value: parseFloat(value),
        assignedTo,
        documentType,
        documentNumber,
        campaign,
        gender,
        age: age ? parseInt(age) : undefined,
        preferredContactChannel
      };
      
      await updateExistingLead(updatedLeadData);
      toast.success("Lead actualizado exitosamente");
      onSave?.();
      onClose();
    } catch (error) {
      toast.error("Error al actualizar el lead");
    } finally {
      setIsSaving(false);
    }
  }, [lead, name, email, phone, company, product, stage, priority, source, value, assignedTo, updateExistingLead, onClose, onSave, documentType, documentNumber, campaign, gender, age, preferredContactChannel]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Detalles del Lead: {lead.name}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
            <TabsList className="grid w-full grid-cols-4 flex-shrink-0">
              <TabsTrigger value="details">Información</TabsTrigger>
              <TabsTrigger value="management">Gestión</TabsTrigger>
              <TabsTrigger value="interactions">Interacciones</TabsTrigger>
              <TabsTrigger value="history">Historial</TabsTrigger>
            </TabsList>

            <TabsContent value="details" className="flex-1 overflow-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4">
                <div>
                  <Label htmlFor="name">Nombre</Label>
                  <Input type="text" id="name" value={name} onChange={(e) => setName(e.target.value)} />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
                <div>
                  <Label htmlFor="phone">Teléfono</Label>
                  <Input type="tel" id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
                </div>
                <div>
                  <Label htmlFor="company">Empresa</Label>
                  <Input type="text" id="company" value={company} onChange={(e) => setCompany(e.target.value)} />
                </div>
                <div>
                  <Label htmlFor="product">Producto</Label>
                  <Input type="text" id="product" value={product} onChange={(e) => setProduct(e.target.value)} />
                </div>
                <div>
                  <Label htmlFor="stage">Estado</Label>
                  <Select value={stage} onValueChange={setStage}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Selecciona un estado" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="new">Nuevo</SelectItem>
                      <SelectItem value="contacted">Contactado</SelectItem>
                      <SelectItem value="qualified">Calificado</SelectItem>
                      <SelectItem value="negotiation">Negociación</SelectItem>
                      <SelectItem value="won">Ganado</SelectItem>
                      <SelectItem value="lost">Perdido</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="priority">Prioridad</Label>
                  <Select value={priority} onValueChange={(value: string) => setPriority(value as any)}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Selecciona una prioridad" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Baja</SelectItem>
                      <SelectItem value="medium">Media</SelectItem>
                      <SelectItem value="high">Alta</SelectItem>
                      <SelectItem value="urgent">Urgente</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="source">Fuente</Label>
                  <Select value={source} onValueChange={(value: string) => setSource(value as any)}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Selecciona una fuente" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Hubspot">Hubspot</SelectItem>
                      <SelectItem value="DaliLM">DaliLM</SelectItem>
                      <SelectItem value="DaliAI">DaliAI</SelectItem>
                      <SelectItem value="web">Sitio web</SelectItem>
                      <SelectItem value="social">Redes sociales</SelectItem>
                      <SelectItem value="referral">Referido</SelectItem>
                      <SelectItem value="cold-call">Llamada fría</SelectItem>
                      <SelectItem value="event">Evento</SelectItem>
                      <SelectItem value="campaign">Campaña</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="value">Valor</Label>
                  <Input type="number" id="value" value={value} onChange={(e) => setValue(e.target.value)} />
                </div>
                <div>
                  <Label htmlFor="assignedTo">Asignado a</Label>
                  <Select value={assignedTo} onValueChange={setAssignedTo}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Selecciona un usuario" />
                    </SelectTrigger>
                    <SelectContent>
                      {users.map((user) => (
                        <SelectItem key={user.id} value={user.id}>
                          {user.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="documentType">Tipo de Documento</Label>
                  <Input type="text" id="documentType" value={documentType} onChange={(e) => setDocumentType(e.target.value)} />
                </div>
                <div>
                  <Label htmlFor="documentNumber">Número de Documento</Label>
                  <Input type="text" id="documentNumber" value={documentNumber} onChange={(e) => setDocumentNumber(e.target.value)} />
                </div>
                <div>
                  <Label htmlFor="campaign">Campaña</Label>
                  <Input type="text" id="campaign" value={campaign} onChange={(e) => setCampaign(e.target.value)} />
                </div>
                 <div>
                  <Label htmlFor="gender">Género</Label>
                  <Input type="text" id="gender" value={gender} onChange={(e) => setGender(e.target.value)} />
                </div>
                 <div>
                  <Label htmlFor="age">Edad</Label>
                  <Input type="number" id="age" value={age} onChange={(e) => setAge(e.target.value)} />
                </div>
                 <div>
                  <Label htmlFor="preferredContactChannel">Medio de Contacto Preferido</Label>
                  <Input type="text" id="preferredContactChannel" value={preferredContactChannel} onChange={(e) => setPreferredContactChannel(e.target.value)} />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="management" className="flex-1 overflow-auto space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Sección de acciones rápidas */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Acciones Rápidas</h3>
                  <div className="space-y-3">
                    <Button 
                      onClick={() => onOpenMassEmail && onOpenMassEmail(lead)}
                      className="w-full justify-start gap-2"
                      variant="outline"
                    >
                      <Mail className="h-4 w-4" />
                      Enviar Email
                    </Button>
                    
                    <Button
                      onClick={() => {
                        if (lead.phone) {
                          const cleanPhone = lead.phone.replace(/\D/g, '');
                          window.open(`https://wa.me/${cleanPhone}`, '_blank');
                        }
                      }}
                      className="w-full justify-start gap-2 bg-[#25D366] hover:bg-[#25D366]/90 text-white"
                      variant="outline"
                      disabled={!lead.phone}
                    >
                      <MessageSquare className="h-4 w-4" />
                      WhatsApp
                    </Button>

                    <OutlookCalendarScheduler lead={lead} />
                    
                    <Button
                      onClick={() => {
                        if (lead.phone) {
                          window.open(`tel:${lead.phone}`, '_self');
                        }
                      }}
                      className="w-full justify-start gap-2"
                      variant="outline"
                      disabled={!lead.phone}
                    >
                      <Phone className="h-4 w-4" />
                      Llamar
                    </Button>
                  </div>
                </div>

                {/* Sección de información adicional */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Información Adicional</h3>
                  <div className="space-y-3">
                    <div>
                      <Label>ID del Lead</Label>
                      <Input type="text" value={lead.id} readOnly disabled />
                    </div>
                    <div>
                      <Label>Fecha de Creación</Label>
                      <Input type="text" value={lead.createdAt} readOnly disabled />
                    </div>
                    <div>
                      <Label>Última Actualización</Label>
                      <Input type="text" value={lead.updatedAt || "N/A"} readOnly disabled />
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="interactions" className="flex-1 overflow-auto">
              <div className="p-4">
                <p>Aquí irían las interacciones del lead</p>
              </div>
            </TabsContent>

            <TabsContent value="history" className="flex-1 overflow-auto">
              <div className="p-4">
                <p>Aquí iría el historial del lead</p>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t flex-shrink-0">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? "Guardando..." : "Guardar Cambios"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
