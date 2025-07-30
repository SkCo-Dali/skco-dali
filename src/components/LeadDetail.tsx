import React, { useState, useEffect } from 'react';
import { Lead, User, Interaction } from '@/types/crm';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Calendar, MessageSquare, Phone, Mail, UserCheck, Clock, Tag, Building2, Globe, CreditCard, AlertCircle, History, UserPlus, Users, X } from 'lucide-react';
import { useUsersApi } from '@/hooks/useUsersApi';
import { useInteractionsApi } from '@/hooks/useInteractionsApi';
import { useLeadAssignments } from '@/hooks/useLeadAssignments';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { LeadReassignDialog } from './LeadReassignDialog';
import { FaWhatsapp } from "react-icons/fa";
import { SkAccordion, SkAccordionItem, SkAccordionTrigger, SkAccordionContent } from '@/components/ui/sk-accordion';

interface LeadDetailProps {
  lead: Lead;
  isOpen: boolean;
  onClose: () => void;
  onSave: (lead: Lead) => void;
  onOpenMassEmail?: (lead: Lead) => void;
}

const priorityColors = {
  low: 'bg-gray-100 text-gray-800',
  medium: 'bg-blue-100 text-blue-800',
  high: 'bg-orange-100 text-orange-800',
  urgent: 'bg-red-100 text-red-800'
};

const priorityLabels = {
  low: 'Baja',
  medium: 'Media',
  high: 'Alta',
  urgent: 'Urgente'
};

const stageColors = {
  'new': 'bg-blue-100 text-blue-800',
  'Nuevo': 'bg-blue-100 text-blue-800',
  'contacted': 'bg-yellow-100 text-yellow-800',
  'qualified': 'bg-green-100 text-green-800',
  'proposal': 'bg-purple-100 text-purple-800',
  'negotiation': 'bg-orange-100 text-orange-800',
  'closed': 'bg-gray-100 text-gray-800',
  'won': 'bg-green-100 text-green-800',
  'lost': 'bg-red-100 text-red-800'
};

// Helper function to capitalize words
const capitalizeWords = (str: string): string => {
  return str.toLowerCase().replace(/\b\w/g, letter => letter.toUpperCase());
};

// Helper function to ensure tags is always an array
const ensureArray = (value: any): any[] => {
  if (Array.isArray(value)) return value;
  if (value === null || value === undefined) return [];
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
};

// Helper function to ensure product is always a string
const ensureString = (value: any): string => {
  if (typeof value === 'string') return value;
  if (Array.isArray(value)) return value.join(', ');
  if (value === null || value === undefined) return '';
  return String(value);
};

// Función para formatear la fecha al formato ISO requerido por el API
const formatDateForAPI = (dateTimeString: string): string => {
  if (!dateTimeString) return '';
  
  // Si ya está en formato datetime-local (yyyy-MM-ddThh:mm), convertir a ISO
  if (dateTimeString.includes('T') && dateTimeString.length === 16) {
    return dateTimeString + ':00'; // Agregar segundos
  }
  
  // Si es una fecha completa, formatear a datetime-local
  const date = new Date(dateTimeString);
  if (isNaN(date.getTime())) return '';
  
  // Formatear a yyyy-MM-ddThh:mm:ss
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  
  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
};

// Función para formatear la fecha para el input datetime-local
const formatDateForInput = (dateTimeString: string): string => {
  if (!dateTimeString) return '';
  
  const date = new Date(dateTimeString);
  if (isNaN(date.getTime())) return '';
  
  // Formatear a yyyy-MM-ddThh:mm para el input datetime-local
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

export function LeadDetail({ lead, isOpen, onClose, onSave, onOpenMassEmail }: LeadDetailProps) {
  // Add debugging to see what's happening
  console.log('LeadDetail rendered with:', { lead, isOpen });
  console.log('🔍 Lead AdditionalInfo debug:', {
    hasAdditionalInfo: !!lead.additionalInfo,
    additionalInfoType: typeof lead.additionalInfo,
    additionalInfoValue: lead.additionalInfo,
    additionalInfoKeys: lead.additionalInfo ? Object.keys(lead.additionalInfo) : 'No keys'
  });
  
  // Ensure tags and other array fields are properly initialized, but keep product as string
  const safeLeadData = {
    ...lead,
    tags: ensureArray(lead.tags),
    product: ensureString(lead.product),
    portfolios: ensureArray(lead.portfolios)
  };
  
  const [editedLead, setEditedLead] = useState<Lead>(safeLeadData);
  const [showReassignDialog, setShowReassignDialog] = useState(false);
  const [newTag, setNewTag] = useState('');
  const [newProduct, setNewProduct] = useState('');
  
  // Estados para tracking de cambios
  const [generalChanges, setGeneralChanges] = useState(false);
  const [managementChanges, setManagementChanges] = useState(false);
  
  // Estados para campos de gestión
  const [contactMethod, setContactMethod] = useState('');
  const [result, setResult] = useState('');
  const [managementNotes, setManagementNotes] = useState('');
  
  const { users } = useUsersApi();
  const { interactions, clientHistory, loading: interactionsLoading, loadLeadInteractions, loadClientHistory, createInteractionFromLead } = useInteractionsApi();
  const { getLeadHistory } = useLeadAssignments();
  const [assignmentHistory, setAssignmentHistory] = useState<any[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [showingClientHistory, setShowingClientHistory] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    console.log('LeadDetail useEffect triggered with lead:', lead);
    const safeLead = {
      ...lead,
      tags: ensureArray(lead.tags),
      product: ensureString(lead.product),
      portfolios: ensureArray(lead.portfolios)
    };
    setEditedLead(safeLead);
    setGeneralChanges(false);
    setManagementChanges(false);
    setContactMethod('');
    setResult('');
    setManagementNotes('');
  }, [lead]);

  useEffect(() => {
    if (isOpen && lead.id) {
      console.log('Loading interactions for lead:', lead.id);
      // Cargar interacciones del lead individual
      loadLeadInteractions(lead.id);
      
      // Cargar historial de asignaciones
      loadAssignmentHistory();
    }
  }, [isOpen, lead.id]);

  const loadAssignmentHistory = async () => {
    if (!lead.id) return;
    
    setHistoryLoading(true);
    try {
      const history = await getLeadHistory(lead.id);
      setAssignmentHistory(history);
    } catch (error) {
      console.error('Error loading assignment history:', error);
    } finally {
      setHistoryLoading(false);
    }
  };

  // Nueva función para cargar historial completo del cliente
  const handleLoadClientHistory = async () => {
    console.log('🔄 Loading complete client history for lead:', lead.name);
    setShowingClientHistory(true);
    await loadClientHistory(lead);
  };

  // Nueva función para volver a mostrar solo las interacciones del lead actual
  const handleShowCurrentLeadOnly = () => {
    console.log('🔄 Showing only current lead interactions');
    setShowingClientHistory(false);
    loadLeadInteractions(lead.id);
  };

  // Función para verificar si el lead tiene duplicados
  const hasLikelyDuplicates = () => {
    return lead.email || lead.phone || lead.documentNumber;
  };

  // Función para manejar cambios en campos generales
  const handleGeneralChange = (field: keyof Lead, value: any) => {
    setEditedLead(prev => ({ ...prev, [field]: value }));
    setGeneralChanges(true);
  };

  // Función para manejar cambios en campos de gestión
  const handleManagementChange = (field: keyof Lead, value: any) => {
    setEditedLead(prev => ({ ...prev, [field]: value }));
    setManagementChanges(true);
  };

  // Función para agregar nuevo tag
  const handleAddTag = () => {
    if (newTag.trim() && !ensureArray(editedLead.tags).includes(newTag.trim())) {
      const updatedTags = [...ensureArray(editedLead.tags), newTag.trim()];
      handleGeneralChange('tags', updatedTags);
      setNewTag('');
    }
  };

  // Función para remover tag
  const handleRemoveTag = (tagToRemove: string) => {
    const updatedTags = ensureArray(editedLead.tags).filter(tag => tag !== tagToRemove);
    handleGeneralChange('tags', updatedTags);
  };

  // Function to add new product - now handles string concatenation
  const handleAddProduct = () => {
    if (newProduct.trim()) {
      const currentProducts = editedLead.product ? editedLead.product.split(', ').filter(p => p.trim()) : [];
      if (!currentProducts.includes(newProduct.trim())) {
        const updatedProducts = [...currentProducts, newProduct.trim()].join(', ');
        handleGeneralChange('product', updatedProducts);
        setNewProduct('');
      }
    }
  };

  // Function to remove product - now handles string manipulation
  const handleRemoveProduct = (productToRemove: string) => {
    const currentProducts = editedLead.product ? editedLead.product.split(', ').filter(p => p.trim()) : [];
    const updatedProducts = currentProducts.filter(product => product !== productToRemove).join(', ');
    handleGeneralChange('product', updatedProducts);
  };

  // Function to get products as array for display
  const getProductsArray = (): string[] => {
    return editedLead.product ? editedLead.product.split(', ').filter(p => p.trim()) : [];
  };

  const handleSave = async () => {
    console.log('🔄 Saving lead changes...');
    console.log('📋 General changes:', generalChanges);
    console.log('📋 Management changes:', managementChanges);
    
    try {
      // Si hay cambios de gestión, crear interacción primero
      if (managementChanges && contactMethod && result && managementNotes) {
        console.log('🔄 Creating interaction from management data...');
        
        // Formatear la fecha del próximo seguimiento para el API
        const formattedNextFollowUp = editedLead.nextFollowUp ? formatDateForAPI(editedLead.nextFollowUp) : '';
        
        // Preparar el lead con datos de gestión para crear la interacción
        const leadWithInteractionData = {
          ...editedLead,
          type: contactMethod,
          outcome: result,
          notes: managementNotes,
          nextFollowUp: formattedNextFollowUp
        };
        
        const interactionCreated = await createInteractionFromLead(leadWithInteractionData);
        
        if (!interactionCreated) {
          toast({
            title: "Error",
            description: "No se pudo crear la interacción",
            variant: "destructive",
          });
          return;
        }
        
        // Recargar interacciones después de crear una nueva
        await loadLeadInteractions(lead.id);
      }
      
      // Si hay cambios generales O cambios de gestión que afecten el lead (stage, nextFollowUp)
      if (generalChanges || (managementChanges && (editedLead.stage !== lead.stage || editedLead.nextFollowUp !== lead.nextFollowUp))) {
        console.log('🔄 Updating lead...');
        
        // Formatear la fecha antes de guardar el lead
        const leadToSave = {
          ...editedLead,
          nextFollowUp: editedLead.nextFollowUp ? formatDateForAPI(editedLead.nextFollowUp) : editedLead.nextFollowUp
        };
        
        await onSave(leadToSave);
      }
      
      // Resetear estados de cambios
      setGeneralChanges(false);
      setManagementChanges(false);
      setContactMethod('');
      setResult('');
      setManagementNotes('');
      
      toast({
        title: "Éxito",
        description: "Cambios guardados exitosamente",
      });
      
    } catch (error) {
      console.error('❌ Error saving changes:', error);
      toast({
        title: "Error",
        description: "No se pudieron guardar los cambios",
        variant: "destructive",
      });
    }
  };

  const handleReassignSuccess = () => {
    setShowReassignDialog(false);
    loadAssignmentHistory(); // Recargar historial después de reasignación
    toast({
      title: "Éxito",
      description: "Lead reasignado exitosamente",
    });
  };

  // Encontrar el usuario asignado actual
  const assignedUser = users.find(user => user.id === editedLead.assignedTo);
  const assignedUserName = assignedUser ? assignedUser.name : 'Sin asignar';

  // Add error boundary check
  if (!lead || !lead.id) {
    console.error('LeadDetail: Invalid lead data', lead);
    return null;
  }

  if (!isOpen) return null;

  const handleScheduleOutlookMeeting = () => {
    const subject = `Reunión con ${lead.name || 'Lead'}`;
    const body = `Reunión programada con el lead:
    
Nombre: ${lead.name || 'No especificado'}
Email: ${lead.email || 'No especificado'}
Teléfono: ${lead.phone || 'No especificado'}
Empresa: ${lead.company || 'No especificado'}
Campaña: ${lead.campaign || 'No especificado'}
Estado: ${lead.stage || 'No especificado'}

Notas adicionales: ${lead.notes || 'Ninguna'}`;

    // Crear URL para Outlook Web
    const outlookUrl = new URL('https://outlook.office365.com/calendar/0/deeplink/compose');
    outlookUrl.searchParams.append('subject', subject);
    outlookUrl.searchParams.append('body', body);
    
    // Si hay email del lead, agregarlo como invitado
    if (lead.email) {
      outlookUrl.searchParams.append('to', lead.email);
    }
    
    // Abrir en nueva ventana
    window.open(outlookUrl.toString(), '_blank');
    
    toast({
      title: "Calendario abierto",
      description: "Se ha abierto Outlook para agendar la reunión",
    });
  };

  try {
    return (
      <>
        <Dialog open={isOpen} onOpenChange={onClose}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <UserCheck className="h-5 w-5" />
                {capitalizeWords(editedLead.name || 'No registra nombre')}
              </DialogTitle>
            </DialogHeader>

            <Tabs defaultValue="general" className="w-full px-6">
              <TabsList className="grid w-full grid-cols-3 bg-gray-100 rounded-full px-0 py-0 my-0">
                <TabsTrigger value="general" className="w-full h-full data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#00c83c] data-[state=active]:to-[#A3E40B] data-[state=active]:text-white rounded-full px-4 py-2 mt-0 text-sm font-medium transition-all duration-200">General</TabsTrigger>
                <TabsTrigger value="management"className="w-full h-full data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#00c83c] data-[state=active]:to-[#A3E40B] data-[state=active]:text-white rounded-full px-4 py-2 mt-0 text-sm font-medium transition-all duration-200" >Gestión</TabsTrigger>
                <TabsTrigger value="history"className="w-full h-full data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#00c83c] data-[state=active]:to-[#A3E40B] data-[state=active]:text-white rounded-full px-4 py-2 mt-0 text-sm font-medium transition-all duration-200" >Asignación</TabsTrigger>
              </TabsList>

              {/* Tab General */}
              <TabsContent value="general" className="space-y-6">
                
                    <CardContent className="space-y-6 py-2 px-0">
                    
                    <CardTitle className="flex items-center pt-2">
                      Información General
                    </CardTitle>
                 
                      <div className="space-y-0 border-2 border-[#3d4b5c26] shadow-md rounded-md p-2.5">
                        <Label className="p-0 text-sm text-gray-500 font-normal">Nombre completo</Label>
                        <Input
                          value={capitalizeWords(editedLead.name || '')}
                          onChange={(e) => handleGeneralChange('name', capitalizeWords(e.target.value))}
                          className="border-0 border-b border-gray-200 rounded-none px-0 py-0 m-0 text-base font-medium bg-transparent leading-none h-auto min-h-0 focus:border-gray-400 focus:shadow-none focus:ring-0"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-0 border-2 border-[#3d4b5c26] shadow-md rounded-md p-2.5">
                          <Label className="p-0 text-sm text-gray-500 font-normal">Email</Label>
                          <Input
                            type="email"
                            value={(editedLead.email || '').toLowerCase()}
                            onChange={(e) => handleGeneralChange('email', e.target.value.toLowerCase())}
                            className="border-0 border-b border-gray-200 rounded-none px-0 py-0 m-0 text-base font-medium bg-transparent leading-none h-auto min-h-0 focus:border-gray-400 focus:shadow-none focus:ring-0"
                          />
                        </div>
                        <div className="space-y-0 border-2 border-[#3d4b5c26] shadow-md rounded-md p-2.5">
                          <Label className="p-0 text-sm text-gray-500 font-normal">Teléfono</Label>
                          <Input
                            value={editedLead.phone || ''}
                            onChange={(e) => handleGeneralChange('phone', e.target.value)}
                            className="border-0 border-b border-gray-200 rounded-none px-0 py-0 m-0 text-base font-medium bg-transparent leading-none h-auto min-h-0 focus:border-gray-400 focus:shadow-none focus:ring-0"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-0 border-2 border-[#3d4b5c26] shadow-md rounded-md p-2.5">
                          <Label className="p-0 text-sm text-gray-500 font-normal">Tipo de Documento</Label>
                          <Select 
                            value={editedLead.documentType || 'CC'} 
                            onValueChange={(value) => handleGeneralChange('documentType', value)}
                          >
                            <SelectTrigger className="border-0 border-b border-gray-200 rounded-none px-0 py-0 m-0 text-sm font-medium bg-transparent leading-none h-auto min-h-0 focus:border-gray-400 focus:shadow-none focus:ring-0">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="CC">Cédula de Ciudadanía</SelectItem>
                              <SelectItem value="CE">Cédula de Extranjería</SelectItem>
                              <SelectItem value="TI">Tarjeta de Identidad</SelectItem>
                              <SelectItem value="PA">Pasaporte</SelectItem>
                              <SelectItem value="NIT">NIT</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div className="space-y-0 border-2 border-[#3d4b5c26] shadow-md rounded-md p-2.5">
                          <Label className="p-0 text-sm text-gray-500 font-normal">Número de Documento</Label>
                          <Input
                            type="number"
                            value={editedLead.documentNumber || ''}
                            onChange={(e) => handleGeneralChange('documentNumber', Number(e.target.value))}
                            className="border-0 border-b border-gray-200 rounded-none px-0 py-0 m-0 text-base font-medium bg-transparent leading-none h-auto min-h-0 focus:border-gray-400 focus:shadow-none focus:ring-0"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-0 border-2 border-[#3d4b5c26] shadow-md rounded-md p-2.5">
                          <Label className="p-0 text-sm text-gray-500 font-normal">Edad</Label>
                          <Input
                            type="number"
                            value={editedLead.age || ''}
                            onChange={(e) => handleGeneralChange('age', Number(e.target.value))}
                            className="border-0 border-b border-gray-200 rounded-none px-0 py-0 m-0 text-base font-medium bg-transparent leading-none h-auto min-h-0 focus:border-gray-400 focus:shadow-none focus:ring-0"
                          />
                        </div>
                        
                        <div className="space-y-0 border-2 border-[#3d4b5c26] shadow-md rounded-md p-2.5">
                          <Label className="p-0 text-sm text-gray-500 font-normal">Género</Label>
                          <Select 
                            value={editedLead.gender || 'Prefiero no decir'} 
                            onValueChange={(value) => handleGeneralChange('gender', value)}
                          >
                            <SelectTrigger className="border-0 border-b border-gray-200 rounded-none px-0 py-0 m-0 text-sm font-medium bg-transparent leading-none h-auto min-h-0 focus:border-gray-400 focus:shadow-none focus:ring-0">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Masculino">Masculino</SelectItem>
                              <SelectItem value="Femenino">Femenino</SelectItem>
                              <SelectItem value="Otro">Otro</SelectItem>
                              <SelectItem value="Prefiero no decir">Prefiero no decir</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-6"> 
                        <div className="space-y-0 border-2 border-[#3d4b5c26] shadow-md rounded-md p-2.5">
                          <Label className="p-0 text-sm text-gray-500 font-normal">Empresa</Label>
                          <Input
                            value={editedLead.company || ''}
                            onChange={(e) => handleGeneralChange('company', e.target.value)}
                            className="border-0 border-b border-gray-200 rounded-none px-0 py-0 m-0 text-base font-medium bg-transparent leading-none h-auto min-h-0 focus:border-gray-400 focus:shadow-none focus:ring-0"
                          />
                        </div>
                        <div className="space-y-0 border-2 border-[#3d4b5c26] shadow-md rounded-md p-2.5">
                          <Label className="p-0 text-sm text-gray-500 font-normal">Valor potencial</Label>
                          <Input
                            type="number"
                            value={editedLead.value || 0}
                            onChange={(e) => handleGeneralChange('value', Number(e.target.value))}
                            className="border-0 border-b border-gray-200 rounded-none px-0 py-0 m-0 text-base font-medium bg-transparent leading-none h-auto min-h-0 focus:border-gray-400 focus:shadow-none focus:ring-0"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-0 border-2 border-[#3d4b5c26] shadow-md rounded-md p-2.5">
                        <Label className="p-0 text-sm text-gray-500 font-normal">Fuente</Label>
                        <Input
                          value={editedLead.source}
                          onChange={(e) => handleGeneralChange('source', e.target.value as any)}
                          className="border-0 border-b border-gray-200 rounded-none px-0 py-0 m-0 text-base font-medium bg-transparent leading-none h-auto min-h-0 focus:border-gray-400 focus:shadow-none focus:ring-0"
                        />
                      </div>
                      
                      <div className="space-y-0 border-2 border-[#3d4b5c26] shadow-md rounded-md p-2.5">
                        <Label className="p-0 text-sm text-gray-500 font-normal">Campaña</Label>
                        <Input
                          value={editedLead.campaign || ''}
                          onChange={(e) => handleGeneralChange('campaign', e.target.value)}
                          className="border-0 border-b border-gray-200 rounded-none px-0 py-0 m-0 text-base font-medium bg-transparent leading-none h-auto min-h-0 focus:border-gray-400 focus:shadow-none focus:ring-0"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <Label>Productos de interés</Label>
                      <div className="space-y-0 border-2 border-[#3d4b5c26] shadow-md rounded-md p-2.5">
                        <div className="flex flex-wrap gap-1">
                          {getProductsArray().map((prod, index) => (
                            <Badge key={index} variant="outline" className="text-xs flex items-center gap-1">
                              {prod}
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-3 w-3 p-0 hover:bg-red-100"
                                onClick={() => handleRemoveProduct(prod)}
                              >
                                <X className="h-2 w-2" />
                              </Button>
                            </Badge>
                          ))}
                        </div>
                        <div className="flex gap-2">
                          <Input
                            placeholder="Agregar producto..."
                            value={newProduct}
                            onChange={(e) => setNewProduct(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleAddProduct()}
                          />
                          <Button size="sm" onClick={handleAddProduct}>
                            Agregar
                          </Button>
                        </div>
                      </div>
                    </div>
                    </CardContent>
                 

                {/* Información Adicional con acordeón de Skandia */}
                <CardContent className="space-y-6 py-2 px-0">
                  <CardTitle className="flex items-center pt-2">
                    Información Adicional
                  </CardTitle>
                  
                  <div className="mt-2 rounded-lg">
                    <SkAccordion type="single" collapsible className="w-full rounded-lg">
                      <SkAccordionItem value="additional-info" className="bg-white border border-gray-300 rounded-lg shadow-md overflow-hidden">
                        <SkAccordionTrigger className="px-4 py-4 hover:bg-gray-50 data-[state=open]:bg-gray-100 text-left font-semibold text-gray-700 flex items-center justify-between w-full [&>svg]:text-green-500 [&>svg]:h-5 [&>svg]:w-5 [&>svg]:ml-auto [&>svg]:shrink-0 [&[data-state=open]>svg]:rotate-180">
                          <span>Detalles de Información Adicional</span>
                        </SkAccordionTrigger>
                        <SkAccordionContent className="px-4 pb-4 pt-0 bg-white border-t border-gray-200">
                          {editedLead.additionalInfo && typeof editedLead.additionalInfo === 'object' && Object.keys(editedLead.additionalInfo).length > 0 ? (
                            <div className="border rounded-lg overflow-hidden bg-gray-50 mt-4">
                              <ScrollArea className="h-48">
                                <Table>
                                  <TableHeader className="sticky top-0 bg-gray-100">
                                    <TableRow>
                                      <TableHead className="font-medium text-gray-700">Campo</TableHead>
                                      <TableHead className="font-medium text-gray-700">Valor</TableHead>
                                    </TableRow>
                                  </TableHeader>
                                  <TableBody>
                                    {Object.entries(editedLead.additionalInfo).map(([key, value], index) => (
                                      <TableRow key={key} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                        <TableCell className="font-medium text-gray-600">{key}</TableCell>
                                        <TableCell className="text-gray-900">
                                          {typeof value === 'object' && value !== null 
                                            ? JSON.stringify(value) 
                                            : String(value || '')}
                                        </TableCell>
                                      </TableRow>
                                    ))}
                                  </TableBody>
                                </Table>
                              </ScrollArea>
                            </div>
                          ) : (
                            <div className="p-6 text-center text-gray-500 bg-gray-50 rounded-lg border border-gray-200">
                              <AlertCircle className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                              <p className="text-sm">No hay información adicional disponible</p>
                            </div>
                          )}
                        </SkAccordionContent>
                      </SkAccordionItem>
                    </SkAccordion>
                  </div>
                </CardContent>
              </TabsContent>

              {/* Tab Gestión */}
              <TabsContent value="management" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Resultado de la Gestión</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="stage">Estado Actual</Label>
                        <Select 
                          value={editedLead.stage} 
                          onValueChange={(value) => handleManagementChange('stage', value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Nuevo">Nuevo</SelectItem>
                            <SelectItem value="Asignado">Asignado</SelectItem>
                            <SelectItem value="Localizado: No interesado">Localizado: No interesado</SelectItem>
                            <SelectItem value="Localizado: Prospecto de venta FP">Localizado: Prospecto de venta FP</SelectItem>
                            <SelectItem value="Localizado: Prospecto de venta AD">Localizado: Prospecto de venta AD</SelectItem>
                            <SelectItem value="Localizado: Volver a llamar">Localizado: Volver a llamar</SelectItem>
                            <SelectItem value="Localizado: No vuelve a contestar">Localizado: No vuelve a contestar</SelectItem>
                            <SelectItem value="No localizado: No contesta">No localizado: No contesta</SelectItem>
                            <SelectItem value="No localizado: Número equivocado">No localizado: Número equivocado</SelectItem>
                            <SelectItem value="Contrato Creado">Contrato Creado</SelectItem>
                            <SelectItem value="Registro de Venta (fondeado)">Registro de Venta (fondeado)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                       <div>
                        <Label htmlFor="contactMethod">Medio de Contacto</Label>
                        <Select value={contactMethod} onValueChange={setContactMethod}>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar medio" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="phone">Teléfono</SelectItem>
                            <SelectItem value="email">Email</SelectItem>
                            <SelectItem value="whatsapp">WhatsApp</SelectItem>
                            <SelectItem value="meeting">Reunión</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <Label htmlFor="priority">Prioridad</Label>
                        <Select 
                          value={editedLead.priority} 
                          onValueChange={(value) => handleGeneralChange('priority', value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
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
                      <Label htmlFor="followUpDate">Próximo seguimiento</Label>
                      <Input
                        id="followUpDate"
                        type="datetime-local"
                        value={formatDateForInput(editedLead.nextFollowUp || '')}
                        onChange={(e) => handleManagementChange('nextFollowUp', e.target.value)}
                      />
                    </div>
                    </div>
                    
                    
                    <div>
                      <Label htmlFor="managementNotes">Notas de gestión</Label>
                      <Textarea
                        id="managementNotes"
                        value={managementNotes}
                        onChange={(e) => setManagementNotes(e.target.value)}
                        placeholder="Agregar notas sobre la gestión de este lead..."
                        rows={3}
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        size="icon" 
                        onClick={() => onOpenMassEmail?.(lead)}
                        className="gap-1 w-8 h-8"
                      >
                        <Mail className="h-3 w-3" />
                      </Button>
                      <Button 
                        size="icon" 
                        onClick={() => {
                          if (lead.phone) {
                            const cleanPhone = lead.phone.replace(/\D/g, '');
                            window.open(`https://wa.me/${cleanPhone}`, '_blank');
                          } else {
                            toast({
                              title: "Error",
                              description: "No hay número de teléfono disponible para este lead",
                              variant: "destructive",
                            });
                          }
                        }}
                        className="gap-1 w-8 h-8"
                      >
                        <FaWhatsapp className="h-3 w-3" />
                      </Button>
                      <Button 
                        size="icon" 
                        onClick={handleScheduleOutlookMeeting}
                        className="gap-1 w-8 h-8"
                        title="Agendar reunión en Outlook"
                      >
                        <Calendar className="h-3 w-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Historial de Interacciones mejorado */}
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    Historial de Interacciones
                    {showingClientHistory && (
                      <Badge variant="outline" className="text-xs">
                        <Users className="h-3 w-3 mr-1" />
                        Historial completo
                      </Badge>
                    )}
                  </h3>
                  <div className="flex gap-2">
                    
                    
                    {/* Botones para cambiar vista de historial */}
                    {hasLikelyDuplicates() && (
                      <>
                        {!showingClientHistory ? (
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={handleLoadClientHistory}
                            className="gap-1"
                          >
                            <Users className="h-3 w-3" />
                            Ver historial completo
                          </Button>
                        ) : (
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={handleShowCurrentLeadOnly}
                            className="gap-1"
                          >
                            <UserCheck className="h-3 w-3" />
                            Solo este lead
                          </Button>
                        )}
                      </>
                    )}
                  </div>
                </div>
                
                <Separator />
                
                {interactionsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    <span className="ml-2">Cargando interacciones...</span>
                  </div>
                ) : (
                  <>
                    {/* Mostrar historial completo del cliente cuando está disponible */}
                    {showingClientHistory && clientHistory.length > 0 ? (
                      <div className="space-y-6">
                        {clientHistory.map((clientLead) => (
                          <Card key={clientLead.LeadId} className={clientLead.LeadId === lead.id ? "border-primary" : ""}>
                            <CardHeader className="pb-3">
                              <div className="flex items-center justify-between">
                                <div>
                                  <CardTitle className="text-sm font-medium">
                                    {clientLead.Name}
                                    {clientLead.LeadId === lead.id && (
                                      <Badge className="ml-2 text-xs">Lead actual</Badge>
                                    )}
                                  </CardTitle>
                                  <p className="text-xs text-muted-foreground mt-1">
                                    {clientLead.Email} • {clientLead.Campaign || 'Sin campaña'}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    Creado: {formatDistanceToNow(new Date(clientLead.CreatedAt), { addSuffix: true, locale: es })}
                                  </p>
                                </div>
                                <Badge variant="outline" className="text-xs">
                                  {clientLead.Interactions.length} interacciones
                                </Badge>
                              </div>
                            </CardHeader>
                            <CardContent className="pt-0">
                              {clientLead.Interactions.length === 0 ? (
                                <p className="text-sm text-muted-foreground text-center py-4">
                                  No hay interacciones para este lead
                                </p>
                              ) : (
                                <div className="space-y-3">
                                  {clientLead.Interactions.map((interaction) => (
                                    <div key={interaction.Id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                                      <div className="p-2 rounded-full bg-blue-100 text-blue-600">
                                        {interaction.Type === 'email' && <Mail className="h-3 w-3" />}
                                        {interaction.Type === 'phone' && <Phone className="h-3 w-3" />}
                                        {interaction.Type === 'whatsapp' && <MessageSquare className="h-3 w-3" />}
                                        {interaction.Type === 'meeting' && <Calendar className="h-3 w-3" />}
                                      </div>
                                      <div className="flex-1">
                                        <h5 className="text-sm font-medium">{interaction.Description || 'Sin título'}</h5>
                                        <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                                          <span>Tipo: {interaction.Type}</span>
                                          <span>•</span>
                                          <span>Etapa: {interaction.Stage}</span>
                                          <span>•</span>
                                          <span>{formatDistanceToNow(new Date(interaction.CreatedAt), { addSuffix: true, locale: es })}</span>
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      /* Mostrar solo interacciones del lead actual */
                      <>
                        {interactions.length === 0 ? (
                          <div className="text-center py-8 text-muted-foreground">
                            No hay interacciones registradas para este lead
                          </div>
                        ) : (
                          <div className="space-y-4">
                            {interactions.map((interaction) => (
                              <Card key={interaction.Id}>
                                <CardContent className="pt-4">
                                  <div className="flex items-start justify-between">
                                    <div className="flex items-start gap-3">
                                      <div className="p-2 rounded-full bg-blue-100 text-blue-600">
                                        {interaction.Type === 'email' && <Mail className="h-4 w-4" />}
                                        {interaction.Type === 'phone' && <Phone className="h-4 w-4" />}
                                        {interaction.Type === 'whatsapp' && <MessageSquare className="h-4 w-4" />}
                                        {interaction.Type === 'meeting' && <Calendar className="h-4 w-4" />}
                                      </div>
                                      <div>
                                        <h4 className="font-medium">{interaction.Description || 'Sin título'}</h4>
                                        <p className="text-sm text-muted-foreground mt-1">
                                          {interaction.Description}
                                        </p>
                                        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                                          <span>Tipo: {interaction.Type}</span>
                                          <span>•</span>
                                          <span>{formatDistanceToNow(new Date(interaction.CreatedAt), { addSuffix: true, locale: es })}</span>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        )}
                      </>
                    )}
                  </>
                )}
              </TabsContent>

              {/* Tab Historial */}
              <TabsContent value="history" className="space-y-4">
                <div className="flex items-center justify-between my-2">
  <div className="flex items-center gap-2 my-4">
    <Label>Usuario Actual Asignado:</Label>
    <span className="text-sm font-medium">{assignedUserName}</span>
  </div>
  <Button
    size="sm"
    variant="outline"
    onClick={() => setShowReassignDialog(true)}
    className="gap-1"
  >
    <UserPlus className="h-3 w-3" />
    Reasignar
  </Button>
</div>
                <div className="flex items-center gap-2 mb-4">
                  <History className="h-5 w-5" />
                  <h3 className="text-lg font-semibold">Historial de Asignaciones</h3>

                  
                </div>
                
                {historyLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mr-2"></div>
                    <span>Cargando historial...</span>
                  </div>
                ) : assignmentHistory.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <History className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No hay historial de asignaciones disponible</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {assignmentHistory.map((entry, index) => (
                      <Card key={index}>
                        <CardContent className="pt-4">
                          <div className="flex items-start justify-between">
                            <div>
                              <h4 className="font-medium">Reasignación</h4>
                              <p className="text-sm text-muted-foreground mt-1">
                                De: {entry.from_user_name || 'Usuario desconocido'} → 
                                A: {entry.to_user_name || 'Usuario desconocido'}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                Motivo: {entry.reason || 'No especificado'}
                              </p>
                              {entry.notes && (
                                <p className="text-sm text-muted-foreground">
                                  Notas: {entry.notes}
                                </p>
                              )}
                            </div>
                            <div className="text-right">
                              <p className="text-xs text-muted-foreground">
                                {formatDistanceToNow(new Date(entry.assigned_at), { 
                                  addSuffix: true, 
                                  locale: es 
                                })}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                Por: {entry.assigned_by_name || 'Sistema'}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>

            {/* Botones de acción */}
            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button 
                onClick={handleSave}
                disabled={!generalChanges && !managementChanges}
              >
                Guardar Cambios
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Dialog de reasignación */}
        <LeadReassignDialog
          isOpen={showReassignDialog}
          onClose={() => setShowReassignDialog(false)}
          lead={editedLead}
          onSuccess={handleReassignSuccess}
        />
      </>
    );
  } catch (error) {
    console.error('Error rendering LeadDetail:', error);
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Error</DialogTitle>
          </DialogHeader>
          <div className="p-4">
            <p>Ha ocurrido un error al cargar los detalles del lead.</p>
            <Button onClick={onClose} className="mt-4">Cerrar</Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }
}
