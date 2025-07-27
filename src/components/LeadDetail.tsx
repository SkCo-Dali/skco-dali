import React, { useState, useCallback } from 'react';
import { Lead } from "@/types/crm";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Mail } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useInteractionsApi } from "@/hooks/useInteractionsApi";
import { InteractionsList } from "@/components/InteractionsList";
import { ClientHistory } from "@/components/ClientHistory";
import { WhatsAppActionsMenu } from "./WhatsAppActionsMenu";

interface LeadDetailProps {
  lead: Lead;
  onClose: () => void;
  onUpdate: () => void;
}

export function LeadDetail({ lead, onClose, onUpdate }: LeadDetailProps) {
  const { toast } = useToast();
  const { createInteractionFromLead, loadLeadInteractions, loadClientHistory, interactions, clientHistory, loading } = useInteractionsApi();
  const [isEmailComposerOpen, setIsEmailComposerOpen] = useState(false);

  const [name, setName] = useState(lead.name || '');
  const [email, setEmail] = useState(lead.email || '');
  const [phone, setPhone] = useState(lead.phone || '');
  const [company, setCompany] = useState(lead.company || '');
  const [product, setProduct] = useState(lead.product || '');
  const [campaign, setCampaign] = useState(lead.campaign || '');
  const [portfolio, setPortfolio] = useState(lead.portfolio || '');
  const [status, setStatus] = useState(lead.status || '');
  const [source, setSource] = useState(lead.source || '');
  const [priority, setPriority] = useState(lead.priority || '');
  const [stage, setStage] = useState(lead.stage || '');
  const [type, setType] = useState(lead.type || '');
  const [outcome, setOutcome] = useState(lead.outcome || '');
  const [notes, setNotes] = useState(lead.notes || '');
  const [assignedTo, setAssignedTo] = useState(lead.assignedTo || '');
  const [nextFollowUp, setNextFollowUp] = useState(lead.nextFollowUp || '');

  const handleSave = async () => {
    const updatedLead = {
      ...lead,
      name,
      email,
      phone,
      company,
      product,
      campaign,
      portfolio,
      status,
      source,
      priority,
      stage,
      type,
      outcome,
      notes,
      assignedTo,
      nextFollowUp
    };

    // Mostrar mensaje de éxito
    toast({
      title: "Lead actualizado",
      description: "La información del lead se ha actualizado correctamente.",
    });

    // Cerrar el diálogo
    onClose();
  };

  const handleSendEmail = () => {
    setIsEmailComposerOpen(true);
  };

  const handleCloseEmailComposer = () => {
    setIsEmailComposerOpen(false);
  };

  const handleCreateInteraction = async () => {
    const updatedLead = {
      ...lead,
      type,
      outcome,
      stage,
      notes
    };

    const success = await createInteractionFromLead(updatedLead);
    if (success) {
      // Recargar las interacciones del lead
      loadLeadInteractions(lead.id);
      // Limpiar los campos del formulario
      setType('');
      setOutcome('');
      setStage('');
      setNotes('');
    }
  };

  const handleLoadInteractions = useCallback(() => {
    loadLeadInteractions(lead.id);
  }, [loadLeadInteractions, lead.id]);

  const handleLoadClientHistory = useCallback(() => {
    loadClientHistory(lead);
  }, [loadClientHistory, lead]);

  const handleSendWithSami = () => {
    console.log('Opening WhatsApp with Sami for lead:', lead.name);
    // Here you would trigger the mass WhatsApp sender with just this lead
    // For now, we'll just show a toast
    toast({
      title: "WhatsApp con Sami",
      description: `Preparando mensaje para ${lead.name}`,
    });
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-semibold">{lead.name}</h2>
          <p className="text-muted-foreground">
            Información detallada y gestión del lead.
          </p>
        </div>
        <Button variant="outline" onClick={onClose}>
          Cerrar
        </Button>
      </div>

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="management">Gestión</TabsTrigger>
          <TabsTrigger value="assignment">Asignación</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl font-semibold">Información General</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  <Label htmlFor="campaign">Campaña</Label>
                  <Input type="text" id="campaign" value={campaign} onChange={(e) => setCampaign(e.target.value)} />
                </div>
                <div>
                  <Label htmlFor="portfolio">Portafolio</Label>
                  <Input type="text" id="portfolio" value={portfolio} onChange={(e) => setPortfolio(e.target.value)} />
                </div>
                <div>
                  <Label htmlFor="status">Estado</Label>
                  <Input type="text" id="status" value={status} onChange={(e) => setStatus(e.target.value)} />
                </div>
                <div>
                  <Label htmlFor="source">Fuente</Label>
                  <Input type="text" id="source" value={source} onChange={(e) => setSource(e.target.value)} />
                </div>
                <div>
                  <Label htmlFor="priority">Prioridad</Label>
                  <Input type="text" id="priority" value={priority} onChange={(e) => setPriority(e.target.value)} />
                </div>
                <div>
                  <Label htmlFor="assignedTo">Asignado a</Label>
                  <Input type="text" id="assignedTo" value={assignedTo} onChange={(e) => setAssignedTo(e.target.value)} />
                </div>
                <div>
                  <Label htmlFor="nextFollowUp">Próximo seguimiento</Label>
                  <Input type="date" id="nextFollowUp" value={nextFollowUp} onChange={(e) => setNextFollowUp(e.target.value)} />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="management" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl font-semibold">Resultado de la Gestión</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="type">Medio de Contacto</Label>
                  <Input type="text" id="type" value={type} onChange={(e) => setType(e.target.value)} />
                </div>
                <div>
                  <Label htmlFor="outcome">Resultado</Label>
                  <Input type="text" id="outcome" value={outcome} onChange={(e) => setOutcome(e.target.value)} />
                </div>
                <div>
                  <Label htmlFor="stage">Etapa</Label>
                  <Input type="text" id="stage" value={stage} onChange={(e) => setStage(e.target.value)} />
                </div>
              </div>
              <div>
                <Label htmlFor="notes">Notas</Label>
                <Textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} />
              </div>
              <Button onClick={handleCreateInteraction}>
                Crear Interacción
              </Button>

              <div className="pt-4 border-t">
                <div className="flex items-center gap-2 mb-4">
                  <Button
                    onClick={handleSendEmail}
                    variant="outline"
                    className="bg-blue-500 text-white border-blue-500 hover:bg-blue-600 hover:border-blue-600"
                  >
                    <Mail className="h-4 w-4 mr-2" />
                    Enviar Email
                  </Button>
                  
                  <WhatsAppActionsMenu 
                    lead={lead} 
                    onSendWithSami={handleSendWithSami}
                    variant="full"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-xl font-semibold">Historial de Interacciones</CardTitle>
            </CardHeader>
            <CardContent>
              <InteractionsList leadId={lead.id} interactions={interactions} loading={loading} onRefresh={handleLoadInteractions} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="assignment" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl font-semibold">Historial del Cliente</CardTitle>
            </CardHeader>
            <CardContent>
              <ClientHistory lead={lead} clientHistory={clientHistory} loading={loading} onRefresh={handleLoadClientHistory} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Button onClick={handleSave}>Guardar Cambios</Button>

      {isEmailComposerOpen && (
        <div>
          <h2>Componer Email</h2>
          <p>Aquí iría el editor de email...</p>
          <Button onClick={handleCloseEmailComposer}>Cerrar</Button>
        </div>
      )}
    </div>
  );
}
