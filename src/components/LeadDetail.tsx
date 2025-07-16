import React, { useState, useCallback } from "react";
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { toast } from "sonner";
import { Lead } from "@/types/crm";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { 
  User, 
  Mail, 
  Phone, 
  FileText, 
  Building, 
  Package, 
  TrendingUp, 
  Flag, 
  MapPin, 
  Calendar,
  Clock,
  Brain
} from "lucide-react";
import { updateLead } from "@/utils/leadsApiClient";

interface LeadDetailProps {
  lead: Lead;
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  onOpenMassEmail: (lead: Lead) => void;
  onStartProfiling?: (lead: Lead) => void;
}

export function LeadDetail({
  lead,
  isOpen,
  onClose,
  onSave,
  onOpenMassEmail,
  onStartProfiling,
}: LeadDetailProps) {
  const [name, setName] = useState(lead.name || "");
  const [email, setEmail] = useState(lead.email || "");
  const [phone, setPhone] = useState(lead.phone || "");
  const [documentType, setDocumentType] = useState(lead.documentType || "");
  const [documentNumber, setDocumentNumber] = useState(lead.documentNumber || "");
  const [company, setCompany] = useState(lead.company || "");
  const [product, setProduct] = useState(lead.product || "");
  const [stage, setStage] = useState(lead.stage || "");
  const [priority, setPriority] = useState(lead.priority || "");
  const [source, setSource] = useState(lead.source || "");
  const [campaign, setCampaign] = useState(lead.campaign || "");
  const [assignedTo, setAssignedTo] = useState(lead.assignedTo || "");
  const [value, setValue] = useState<number>(lead.value || 0);
  const [createdAt, setCreatedAt] = useState<Date | null>(lead.createdAt ? new Date(lead.createdAt) : null);
  const [age, setAge] = useState<number>(lead.age || 0);
  const [gender, setGender] = useState(lead.gender || "");
  const [preferredContactChannel, setPreferredContactChannel] = useState(lead.preferredContactChannel || "");

  const handleSave = useCallback(async () => {
    try {
      const leadData = {
        name,
        email,
        phone,
        documentType,
        documentNumber: typeof documentNumber === 'string' ? parseInt(documentNumber) || 0 : documentNumber,
        company,
        product: product ? [product] : [], // Convert string to array for API
        stage,
        priority,
        source,
        campaign,
        assignedTo,
        value,
        createdAt: createdAt ? createdAt.toISOString() : null,
        age,
        gender,
        preferredContactChannel,
        // Add CreatedBy field required by the API
        CreatedBy: lead.createdBy || '1',
        // Add other required fields
        notes: lead.notes || '',
        tags: lead.tags || [],
        DocumentType: documentType,
        SelectedPortfolios: lead.portfolios || [],
        CampaignOwnerName: lead.campaignOwnerName || '',
        Age: age,
        Gender: gender,
        PreferredContactChannel: preferredContactChannel
      };
      
      await updateLead(lead.id, leadData);
      toast.success("Lead actualizado exitosamente");
      onSave();
      onClose();
    } catch (error: any) {
      toast.error(`Error al actualizar el lead: ${error.message}`);
    }
  }, [
    lead.id,
    lead.createdBy,
    lead.notes,
    lead.tags,
    lead.portfolios,
    lead.campaignOwnerName,
    name,
    email,
    phone,
    documentType,
    documentNumber,
    company,
    product,
    stage,
    priority,
    source,
    campaign,
    assignedTo,
    value,
    createdAt,
    age,
    gender,
    preferredContactChannel,
    onSave,
    onClose
  ]);

  const formatDate = (date: Date | null): string => {
    if (!date) return '';
    return format(date, 'dd/MM/yyyy', { locale: es });
  };

  const renderManagementActions = () => (
    <div className="space-y-4">
      <Button
        onClick={() => onOpenMassEmail(lead)}
        className="w-full gap-2"
        variant="outline"
      >
        <Mail className="h-4 w-4" />
        Enviar Correo Electrónico
      </Button>
      
      {onStartProfiling && (
        <Button
          onClick={() => onStartProfiling(lead)}
          className="w-full gap-2"
          variant="outline"
        >
          <Brain className="h-4 w-4" />
          Iniciar Asesoría
        </Button>
      )}
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
        <DialogHeader>
          <DialogTitle>Detalle del Lead</DialogTitle>
          <DialogDescription>
            Información detallada del lead seleccionado.
          </DialogDescription>
        </DialogHeader>
        <Tabs defaultValue="datos" className="space-y-4">
          <TabsList>
            <TabsTrigger value="datos"><User className="h-4 w-4 mr-2" />Datos</TabsTrigger>
            <TabsTrigger value="contacto"><Mail className="h-4 w-4 mr-2" />Contacto</TabsTrigger>
            <TabsTrigger value="empresa"><Building className="h-4 w-4 mr-2" />Empresa</TabsTrigger>
            <TabsTrigger value="producto"><Package className="h-4 w-4 mr-2" />Producto</TabsTrigger>
            <TabsTrigger value="gestion"><TrendingUp className="h-4 w-4 mr-2" />Gestión</TabsTrigger>
          </TabsList>
          <TabsContent value="datos" className="space-y-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Nombre</Label>
                <Input type="text" id="name" value={name} onChange={(e) => setName(e.target.value)} />
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
                <Label htmlFor="age">Edad</Label>
                <Input type="number" id="age" value={age} onChange={(e) => setAge(Number(e.target.value))} />
              </div>
              <div>
                <Label htmlFor="gender">Género</Label>
                <Input type="text" id="gender" value={gender} onChange={(e) => setGender(e.target.value)} />
              </div>
            </div>
          </TabsContent>
          <TabsContent value="contacto" className="space-y-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <div>
                <Label htmlFor="phone">Teléfono</Label>
                <Input type="tel" id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
              </div>
              <div>
                <Label htmlFor="preferredContactChannel">Medio de Contacto Preferido</Label>
                <Input
                  type="text"
                  id="preferredContactChannel"
                  value={preferredContactChannel}
                  onChange={(e) => setPreferredContactChannel(e.target.value)}
                />
              </div>
            </div>
          </TabsContent>
          <TabsContent value="empresa" className="space-y-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="company">Empresa</Label>
                <Input type="text" id="company" value={company} onChange={(e) => setCompany(e.target.value)} />
              </div>
              <div>
                <Label htmlFor="assignedTo">Asignado a</Label>
                <Input type="text" id="assignedTo" value={assignedTo} onChange={(e) => setAssignedTo(e.target.value)} />
              </div>
            </div>
          </TabsContent>
          <TabsContent value="producto" className="space-y-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="product">Producto</Label>
                <Input type="text" id="product" value={product} onChange={(e) => setProduct(e.target.value)} />
              </div>
              <div>
                <Label htmlFor="value">Valor</Label>
                <Input
                  type="number"
                  id="value"
                  value={value}
                  onChange={(e) => setValue(Number(e.target.value))}
                />
              </div>
              <div>
                <Label htmlFor="stage">Estado</Label>
                <Select value={stage} onValueChange={setStage}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Selecciona un estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="nuevo">Nuevo</SelectItem>
                    <SelectItem value="contactado">Contactado</SelectItem>
                    <SelectItem value="calificado">Calificado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="priority">Prioridad</Label>
                <Select value={priority} onValueChange={setPriority}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Selecciona una prioridad" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="alta">Alta</SelectItem>
                    <SelectItem value="media">Media</SelectItem>
                    <SelectItem value="baja">Baja</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="source">Fuente</Label>
                <Input type="text" id="source" value={source} onChange={(e) => setSource(e.target.value)} />
              </div>
              <div>
                <Label htmlFor="campaign">Campaña</Label>
                <Input type="text" id="campaign" value={campaign} onChange={(e) => setCampaign(e.target.value)} />
              </div>
            </div>
          </TabsContent>
          <TabsContent value="gestion" className="space-y-2">
            {renderManagementActions()}
          </TabsContent>
        </Tabs>
        <div className="flex justify-end">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="button" className="ml-2" onClick={handleSave}>
            Guardar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
