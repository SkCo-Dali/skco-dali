import React, { useState, useEffect, useCallback } from "react";
import { Lead, User, Interaction, getRolePermissions } from "@/types/crm";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import {
  Calendar,
  MessageSquare,
  Phone,
  Mail,
  UserCheck,
  Clock,
  Tag,
  Building2,
  Globe,
  CreditCard,
  AlertCircle,
  History,
  UserPlus,
  Users,
  X,
  ChevronDown,
  Brain,
} from "lucide-react";
import { CustomFieldSelect } from "@/components/ui/custom-field-select";
import { useAssignableUsers } from "@/contexts/AssignableUsersContext";
import { useInteractionsApi } from "@/hooks/useInteractionsApi";
import { useLeadAssignments } from "@/hooks/useLeadAssignments";
import { useLeadsApi } from "@/hooks/useLeadsApi";
import { useProfilingApi } from "@/hooks/useProfilingApi";
import { useToast } from "@/hooks/use-toast";
import { formatBogotaDistanceToNow, formatBogotaDateTime } from "@/utils/dateUtils";
import { LeadReassignDialog } from "./LeadReassignDialog";
import { LeadProfiler } from "./LeadProfiler";
import ProfileResults from "./ProfileResults";
import { FaWhatsapp } from "react-icons/fa";
import { SkAccordion, SkAccordionItem, SkAccordionTrigger, SkAccordionContent } from "@/components/ui/sk-accordion";
import { InputSanitizer } from "@/utils/inputSanitizer";
import { useFormPersistence } from "@/hooks/useFormPersistence";
import { EditInteractionDialog } from "./EditInteractionDialog";
import { InteractionResponse } from "@/utils/interactionsApiClient";
import { Pencil, Trash2 } from "lucide-react";

interface LeadDetailProps {
  lead: Lead;
  isOpen: boolean;
  onClose: () => void;
  onSave: (lead?: Lead) => void;
  onOpenMassEmail?: (lead: Lead) => void;
}

const priorityColors = {
  low: "bg-gray-100 text-gray-800",
  medium: "bg-blue-100 text-blue-800",
  high: "bg-orange-100 text-orange-800",
  urgent: "bg-red-100 text-red-800",
};

const priorityLabels = {
  low: "Baja",
  medium: "Media",
  high: "Alta",
  urgent: "Urgente",
};

const stageColors = {
  new: "bg-blue-100 text-blue-800",
  Nuevo: "bg-blue-100 text-blue-800",
  contacted: "bg-yellow-100 text-yellow-800",
  qualified: "bg-green-100 text-green-800",
  proposal: "bg-purple-100 text-purple-800",
  negotiation: "bg-orange-100 text-orange-800",
  closed: "bg-gray-100 text-gray-800",
  won: "bg-green-100 text-green-800",
  lost: "bg-red-100 text-red-800",
};

// Helper function to capitalize words
const capitalizeWords = (str: string): string => {
  return str.toLowerCase().replace(/\b\w/g, (letter) => letter.toUpperCase());
};

// Helper function to ensure tags is always an array
const ensureArray = (value: any): any[] => {
  if (Array.isArray(value)) return value;
  if (value === null || value === undefined) return [];
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
};

// Helper function to ensure product is always a clean string
const ensureString = (value: any): string => {
  if (typeof value === "string") {
    // Clean all JSON-like characters and escape sequences
    let cleaned = value
      .replace(/\\"/g, '"') // Remove escape sequences
      .replace(/[\[\]"'\\]/g, "") // Remove all brackets and quotes
      .replace(/,+/g, ",") // Replace multiple commas with single comma
      .replace(/^,|,$/g, "") // Remove leading/trailing commas
      .trim();

    // Split by comma and rejoin with hyphens
    if (cleaned.includes(",")) {
      return cleaned
        .split(",")
        .map((item) => item.trim())
        .filter((item) => item && item !== "")
        .join(" - ");
    }

    return cleaned;
  }
  if (Array.isArray(value)) return value.filter((item) => item && item.trim()).join(" - ");
  if (value === null || value === undefined) return "";
  return String(value);
};

// Función para formatear la fecha al formato ISO requerido por el API
const formatDateForAPI = (dateTimeString: string): string => {
  if (!dateTimeString) return "";

  // Si ya está en formato datetime-local (yyyy-MM-ddThh:mm), convertir a ISO
  if (dateTimeString.includes("T") && dateTimeString.length === 16) {
    return dateTimeString + ":00"; // Agregar segundos
  }

  // Si es una fecha completa, formatear a datetime-local
  const date = new Date(dateTimeString);
  if (isNaN(date.getTime())) return "";

  // Formatear a yyyy-MM-ddThh:mm:ss
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");

  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
};

// Función para formatear la fecha para el input datetime-local
const formatDateForInput = (dateTimeString: string): string => {
  if (!dateTimeString) return "";

  const date = new Date(dateTimeString);
  if (isNaN(date.getTime())) return "";

  // Formatear a yyyy-MM-ddThh:mm para el input datetime-local
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

export function LeadDetail({ lead, isOpen, onClose, onSave, onOpenMassEmail }: LeadDetailProps) {
  // Add debugging to see what's happening
  console.log("LeadDetail rendered with:", { lead, isOpen });
  console.log("🔍 Lead AdditionalInfo debug:", {
    hasAdditionalInfo: !!lead.additionalInfo,
    additionalInfoType: typeof lead.additionalInfo,
    additionalInfoValue: lead.additionalInfo,
    additionalInfoKeys: lead.additionalInfo ? Object.keys(lead.additionalInfo) : "No keys",
  });

  const { user } = useAuth();
  const permissions = user ? getRolePermissions(user.role) : null;

  // Ensure tags and other array fields are properly initialized, but keep product as string
  const safeLeadData = {
    ...lead,
    tags: ensureArray(lead.tags),
    product: ensureString(lead.product),
    portfolios: ensureArray(lead.portfolios),
  };

  const [editedLead, setEditedLead] = useState<Lead>(safeLeadData);
  const [showReassignDialog, setShowReassignDialog] = useState(false);
  const [newTag, setNewTag] = useState("");
  const [newProduct, setNewProduct] = useState("");

  // Estados para el perfilador
  const [showProfiler, setShowProfiler] = useState(false);
  const [showProfileResults, setShowProfileResults] = useState(false);
  const [profileData, setProfileData] = useState<any>(null);
  const [hasExistingProfile, setHasExistingProfile] = useState(false);

  // Estados para tracking de cambios
  const [generalChanges, setGeneralChanges] = useState(false);
  const [managementChanges, setManagementChanges] = useState(false);

  // Estados para campos de gestión
  const [contactMethod, setContactMethod] = useState("");
  const [result, setResult] = useState("");
  const [managementNotes, setManagementNotes] = useState("");

  // Estados para el diálogo de edición de interacciones
  const [editingInteraction, setEditingInteraction] = useState<InteractionResponse | null>(null);
  const [showEditInteractionDialog, setShowEditInteractionDialog] = useState(false);

  // Form persistence para preservar datos entre cambios de pestañas SOLO durante la sesión actual
  const formPersistenceKey = `lead_detail_${lead.id}`;

  const { saveToStorage, clearBackup } = useFormPersistence({
    key: formPersistenceKey,
    data: editedLead,
    enabled: isOpen,
    autoSaveInterval: 5000, // Auto-guardar cada 5 segundos
    onRestore: undefined, // Desactivar restauración automática
  });

  const { users } = useAssignableUsers();
  const {
    interactions,
    clientHistory,
    loading: interactionsLoading,
    loadLeadInteractions,
    loadClientHistory,
    createInteractionFromLead,
    updateExistingInteraction,
    deleteExistingInteraction,
  } = useInteractionsApi();
  const { updateExistingLead } = useLeadsApi();
  const { getLeadHistory } = useLeadAssignments();
  const { checkClient, getResults, loading: profilingLoading } = useProfilingApi();
  const [assignmentHistory, setAssignmentHistory] = useState<any[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [showingClientHistory, setShowingClientHistory] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    console.log("LeadDetail useEffect triggered with lead:", lead);

    // Limpiar cualquier backup previo para asegurar datos frescos
    clearBackup();

    // Siempre iniciar con los datos actuales del lead
    const safeLead = {
      ...lead,
      tags: ensureArray(lead.tags),
      product: ensureString(lead.product),
      portfolios: ensureArray(lead.portfolios),
    };
    setEditedLead(safeLead);

    setGeneralChanges(false);
    setManagementChanges(false);
    setContactMethod("");
    setResult("");
    setManagementNotes("");
  }, [lead, clearBackup]);

  useEffect(() => {
    if (isOpen && lead.id) {
      console.log("Loading interactions for lead:", lead.id);
      // Cargar interacciones del lead individual
      loadLeadInteractions(lead.id);

      // Cargar historial de asignaciones
      loadAssignmentHistory();

      // Verificar si el lead tiene un perfil existente
      checkExistingProfile();
    }

    // Limpiar backup cuando se cierra el editor
    if (!isOpen) {
      clearBackup();
    }
  }, [isOpen, lead.id, clearBackup]);

  const loadAssignmentHistory = async () => {
    if (!lead.id) return;

    setHistoryLoading(true);
    try {
      const history = await getLeadHistory(lead.id);
      setAssignmentHistory(history);
    } catch (error) {
      console.error("Error loading assignment history:", error);
    } finally {
      setHistoryLoading(false);
    }
  };

  // Verificar si el lead tiene un perfil existente
  const checkExistingProfile = async () => {
    try {
      // Pasar silent=true para no mostrar error si falla la verificación
      const result = await checkClient(lead.email, lead.documentNumber?.toString(), true);
      if (result?.hasProfile && result?.profileId) {
        setHasExistingProfile(true);
        // Si tiene perfil y está completado, cargar los resultados
        if (result.isCompleted) {
          const profileResults = await getResults(result.profileId);
          if (profileResults) {
            setProfileData(profileResults);
          }
        }
      } else {
        setHasExistingProfile(false);
      }
    } catch (error) {
      console.error("Error checking existing profile:", error);
      setHasExistingProfile(false);
    }
  };

  // Manejar clic en botón de perfilador
  const handleProfilerClick = () => {
    console.log("ProfilerClick triggered:", { hasExistingProfile, profileData, profilingLoading });
    if (hasExistingProfile && profileData) {
      // Si ya tiene perfil completado, mostrar resultados
      setShowProfiler(true);
    } else {
      // Si no tiene perfil, iniciar proceso de perfilamiento
      setShowProfiler(true);
    }
  };

  // Manejar cuando se completa un nuevo perfil
  const handleProfileCompleted = async (completedProfileData: any) => {
    setProfileData(completedProfileData);
    setHasExistingProfile(true);
    setShowProfiler(false);
    setShowProfileResults(true);
  };

  // Nueva función para cargar historial completo del cliente
  const handleLoadClientHistory = async () => {
    console.log("🔄 Loading complete client history for lead:", lead.name);
    setShowingClientHistory(true);
    await loadClientHistory(lead);
  };

  // Nueva función para volver a mostrar solo las interacciones del lead actual
  const handleShowCurrentLeadOnly = () => {
    console.log("🔄 Showing only current lead interactions");
    setShowingClientHistory(false);
    loadLeadInteractions(lead.id);
  };

  // Función para verificar si el lead tiene duplicados
  const hasLikelyDuplicates = () => {
    return lead.email || lead.phone || lead.documentNumber;
  };

  // Funciones para manejar edición de interacciones
  const handleEditInteraction = (interaction: InteractionResponse) => {
    setEditingInteraction(interaction);
    setShowEditInteractionDialog(true);
  };

  const handleSaveInteraction = async (interactionId: string, data: any) => {
    const success = await updateExistingInteraction(interactionId, data);
    if (success) {
      // Recargar las interacciones después de actualizar
      if (showingClientHistory) {
        await loadClientHistory(lead);
      } else {
        await loadLeadInteractions(lead.id);
      }
    }
    return success;
  };

  const handleDeleteInteraction = async (interaction: InteractionResponse) => {
    const success = await deleteExistingInteraction(interaction.Id);
    if (success) {
      // Recargar las interacciones después de eliminar
      if (showingClientHistory) {
        await loadClientHistory(lead);
      } else {
        await loadLeadInteractions(lead.id);
      }
    }
  };

  // Función para manejar cambios en campos generales con persistencia
  const handleGeneralChange = useCallback(
    (field: keyof Lead, value: any) => {
      setEditedLead((prev) => {
        const updated = { ...prev, [field]: value };
        saveToStorage(updated); // Auto-guardar en sessionStorage
        return updated;
      });
      setGeneralChanges(true);
    },
    [saveToStorage],
  );

  // Función para manejar cambios en campos de gestión con persistencia
  const handleManagementChange = useCallback(
    (field: keyof Lead, value: any) => {
      setEditedLead((prev) => {
        const updated = { ...prev, [field]: value };
        saveToStorage(updated); // Auto-guardar en sessionStorage
        return updated;
      });
      setManagementChanges(true);
    },
    [saveToStorage],
  );

  // Funciones de validación para campos numéricos y email
  const handlePhoneChange = (value: string) => {
    const numericValue = value.replace(/[^0-9]/g, "");
    handleGeneralChange("phone", numericValue);
  };

  const handleEmailChange = (value: string) => {
    handleGeneralChange("email", value.toLowerCase());
  };

  const handleDocumentNumberChange = (value: string) => {
    const numericValue = value.replace(/[^0-9]/g, "");
    handleGeneralChange("documentNumber", numericValue ? Number(numericValue) : "");
  };

  const handleAgeChange = (value: string) => {
    const numericValue = value.replace(/[^0-9]/g, "");
    handleGeneralChange("age", numericValue ? Number(numericValue) : "");
  };

  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Función para agregar nuevo tag
  const handleAddTag = () => {
    if (newTag.trim() && !ensureArray(editedLead.tags).includes(newTag.trim())) {
      const updatedTags = [...ensureArray(editedLead.tags), newTag.trim()];
      handleGeneralChange("tags", updatedTags);
      setNewTag("");
    }
  };

  // Función para remover tag
  const handleRemoveTag = (tagToRemove: string) => {
    const updatedTags = ensureArray(editedLead.tags).filter((tag) => tag !== tagToRemove);
    handleGeneralChange("tags", updatedTags);
  };

  // Function to add new product - now handles string concatenation
  const handleAddProduct = () => {
    if (newProduct.trim()) {
      const currentProducts = getProductsArray();
      if (!currentProducts.includes(newProduct.trim())) {
        const updatedProducts = [...currentProducts, newProduct.trim()].join(" - ");
        handleGeneralChange("product", updatedProducts);
        setNewProduct("");
      }
    }
  };

  // Function to remove product - now handles string manipulation
  const handleRemoveProduct = (productToRemove: string) => {
    const currentProducts = getProductsArray();
    const updatedProducts = currentProducts.filter((product) => product !== productToRemove).join(" - ");
    handleGeneralChange("product", updatedProducts);
  };

  // Function to get products as array for display
  const getProductsArray = (): string[] => {
    if (!editedLead.product) return [];

    // Handle different separators and clean the products
    const cleanProduct = editedLead.product.replace(/[\[\]"']/g, "").trim();
    if (!cleanProduct) return [];

    // Split by different possible separators and clean each item
    return cleanProduct
      .split(/[,-]/)
      .map((p) => p.trim())
      .filter((p) => p && p !== "");
  };

  // Función para guardar solo cambios generales
  const handleSaveGeneral = async () => {
    console.log("🔄 Saving general changes...");

    try {
      // Formatear la fecha antes de guardar el lead
      const leadToSave = {
        ...editedLead,
        nextFollowUp: editedLead.nextFollowUp ? formatDateForAPI(editedLead.nextFollowUp) : editedLead.nextFollowUp,
      };

      // Llamar directamente al API de actualización de lead (PUT /api/leads/{id})
      console.log("🔄 Calling updateExistingLead API...");
      await updateExistingLead(leadToSave);

      // Limpiar backup después de guardar exitosamente
      clearBackup();

      // Notificar al componente padre para refrescar datos
      onSave(leadToSave);

      // Resetear estado de cambios generales
      setGeneralChanges(false);

      toast({
        title: "Éxito",
        description: "Información general guardada exitosamente",
      });
    } catch (error) {
      console.error("❌ Error saving general changes:", error);
      toast({
        title: "Error",
        description: "No se pudieron guardar los cambios generales",
        variant: "destructive",
      });
    }
  };

  // Función para guardar solo cambios de gestión
  const handleSaveManagement = async () => {
    console.log("🔄 Saving management changes...");
    console.log("📊 Current editedLead state:", {
      stage: editedLead.stage,
      nextFollowUp: editedLead.nextFollowUp,
      priority: editedLead.priority,
    });

    if (!contactMethod || !result || !managementNotes) {
      toast({
        title: "Error",
        description: "Todos los campos de gestión son obligatorios",
        variant: "destructive",
      });
      return;
    }

    try {
      // Formatear la fecha del próximo seguimiento para el API
      const formattedNextFollowUp = editedLead.nextFollowUp ? formatDateForAPI(editedLead.nextFollowUp) : null;

      // Preparar el lead actualizado con TODOS los cambios de gestión
      const leadToSave = {
        ...editedLead,
        nextFollowUp: formattedNextFollowUp,
      };

      console.log("📝 Lead data to save:", {
        id: leadToSave.id,
        stage: leadToSave.stage,
        nextFollowUp: leadToSave.nextFollowUp,
        priority: leadToSave.priority,
      });

      // 1. Actualizar el lead primero (PUT /api/leads/{id})
      console.log("🔄 Updating lead with management changes...");
      await updateExistingLead(leadToSave);

      // 2. Crear interacción con datos de gestión (POST /api/interactions)
      console.log("🔄 Creating interaction from management data...");
      const leadWithInteractionData = {
        ...leadToSave,
        type: contactMethod,
        outcome: result,
        notes: managementNotes,
      };

      const interactionCreated = await createInteractionFromLead(leadWithInteractionData);

      if (!interactionCreated) {
        console.warn("⚠️ Interaction creation failed, but lead was updated");
      }

      // Limpiar backup después de guardar exitosamente
      clearBackup();

      // Notificar al componente padre para refrescar datos
      onSave(leadToSave);

      // Recargar interacciones después de crear una nueva
      await loadLeadInteractions(lead.id);

      // Resetear estados de cambios de gestión
      setManagementChanges(false);
      setContactMethod("");
      setResult("");
      setManagementNotes("");

      toast({
        title: "Éxito",
        description: "Gestión registrada e información del lead actualizada exitosamente",
      });
    } catch (error) {
      console.error("❌ Error saving management changes:", error);
      toast({
        title: "Error",
        description: "No se pudieron guardar los cambios de gestión",
        variant: "destructive",
      });
    }
  };

  const handleReassignSuccess = (newUserId: string) => {
    // Buscar el nombre del nuevo usuario asignado
    const newAssignedUser = users.find((user) => user.Id === newUserId);
    const newAssignedUserName = newAssignedUser?.Name || "Sin asignar";

    // Actualizar el lead local con el nuevo usuario asignado y su nombre
    setEditedLead((prev) => ({
      ...prev,
      assignedTo: newUserId,
      assignedToName: newAssignedUserName,
    }));

    setShowReassignDialog(false);
    loadAssignmentHistory(); // Recargar historial después de reasignación

    // Refrescar la lista de leads en el componente padre
    onSave();
  };

  // Use assignedToName directly from API or fallback to user lookup
  const assignedUser = users.find((user) => user.Id === editedLead.assignedTo);
  const assignedUserName = editedLead.assignedToName || assignedUser?.Name || "Sin asignar";

  // Add error boundary check
  if (!lead || !lead.id) {
    console.error("LeadDetail: Invalid lead data", lead);
    return null;
  }

  if (!isOpen) return null;

  const handleScheduleOutlookMeeting = () => {
    const subject = `Reunión con ${lead.name || "Lead"}`;
    const body = `Reunión programada con el lead:
    
Nombre: ${lead.name || "No especificado"}
Email: ${lead.email || "No especificado"}
Teléfono: ${lead.phone || "No especificado"}
Empresa: ${lead.company || "No especificado"}
Campaña: ${lead.campaign || "No especificado"}
Estado: ${lead.stage || "No especificado"}

Notas adicionales: ${lead.notes || "Ninguna"}`;

    // Crear URL para Outlook Web
    const outlookUrl = new URL("https://outlook.office365.com/calendar/0/deeplink/compose");
    outlookUrl.searchParams.append("subject", subject);
    outlookUrl.searchParams.append("body", body);

    // Si hay email del lead, agregarlo como invitado
    if (lead.email) {
      outlookUrl.searchParams.append("to", lead.email);
    }

    // Abrir en nueva ventana
    window.open(outlookUrl.toString(), "_blank");

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
                {capitalizeWords(editedLead.name || "No registra nombre")}
              </DialogTitle>
            </DialogHeader>

            <Tabs defaultValue="general" className="w-full px-2 lg:px-4">
              <TabsList className="grid w-full grid-cols-3 bg-gray-100 rounded-full px-0 py-0 my-0">
                <TabsTrigger
                  value="general"
                  className="w-full h-full data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#00C73D] data-[state=active]:to-[#A3E40B] data-[state=active]:text-white rounded-full px-4 py-2 mt-0 text-sm font-medium transition-all duration-200"
                >
                  General
                </TabsTrigger>
                <TabsTrigger
                  value="management"
                  className="w-full h-full data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#00C73D] data-[state=active]:to-[#A3E40B] data-[state=active]:text-white rounded-full px-4 py-2 mt-0 text-sm font-medium transition-all duration-200"
                >
                  Gestión
                </TabsTrigger>
                <TabsTrigger
                  value="history"
                  className="w-full h-full data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#00C73D] data-[state=active]:to-[#A3E40B] data-[state=active]:text-white rounded-full px-4 py-2 mt-0 text-sm font-medium transition-all duration-200"
                >
                  Asignación
                </TabsTrigger>
              </TabsList>

              {/* Tab General */}
              <TabsContent value="general" className="space-y-6">
                <CardContent className="space-y-2 py-2 px-0">
                  <CardTitle className="flex items-center pt-2">
                    Información General{editedLead.campaign && ` - Campaña: ${editedLead.campaign}`}
                  </CardTitle>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div className="space-y-0 border-2 border-[#3d4b5c26] shadow-md rounded-md p-2.5">
                      <Label className="p-0 text-sm text-gray-500 font-normal">Nombre completo</Label>
                      <Input
                        value={capitalizeWords(editedLead.name || "")}
                        onChange={(e) => handleGeneralChange("name", capitalizeWords(e.target.value))}
                        className="border-0 border-b border-gray-200 rounded-none px-0 py-0 m-0 text-base font-medium bg-transparent leading-none h-auto min-h-0 focus:border-gray-400 focus:shadow-none focus:ring-0"
                      />
                    </div>
                    <div className="space-y-0 border-2 border-[#3d4b5c26] shadow-md rounded-md p-2.5">
                      <Label className="p-0 text-sm text-gray-500 font-normal">Primer Nombre</Label>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Input
                            value={capitalizeWords(editedLead.firstName || "")}
                            disabled
                            className="border-0 border-b border-gray-200 rounded-none px-0 py-0 m-0 text-base font-medium bg-transparent leading-none h-auto min-h-0 focus:border-gray-400 focus:shadow-none focus:ring-0 cursor-not-allowed opacity-70"
                          />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Este campo se actualiza automáticamente al modificar el nombre completo</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <CustomFieldSelect
                      label="Tipo de Documento"
                      value={editedLead.documentType || ""}
                      onValueChange={(value) => handleGeneralChange("documentType", value)}
                      options={[
                        { value: "CC", label: "Cédula de Ciudadanía" },
                        { value: "CE", label: "Cédula de Extranjería" },
                        { value: "TI", label: "Tarjeta de Identidad" },
                        { value: "PA", label: "Pasaporte" },
                        { value: "NIT", label: "NIT" },
                      ]}
                    />

                    <div className="space-y-0 border-2 border-[#3d4b5c26] shadow-md rounded-md p-2.5">
                      <Label className="p-0 text-sm text-gray-500 font-normal">Número de Documento</Label>
                      <Input
                        type="text"
                        value={editedLead.documentNumber || ""}
                        onChange={(e) => handleDocumentNumberChange(e.target.value)}
                        className="border-0 border-b border-gray-200 rounded-none px-0 py-0 m-0 text-base font-medium bg-transparent leading-none h-auto min-h-0 focus:border-gray-400 focus:shadow-none focus:ring-0"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div className="space-y-0 border-2 border-[#3d4b5c26] shadow-md rounded-md p-2.5">
                      <Label className="p-0 text-sm text-gray-500 font-normal">Edad</Label>
                      <Input
                        type="text"
                        value={editedLead.age || ""}
                        onChange={(e) => handleAgeChange(e.target.value)}
                        className="border-0 border-b border-gray-200 rounded-none px-0 py-0 m-0 text-base font-medium bg-transparent leading-none h-auto min-h-0 focus:border-gray-400 focus:shadow-none focus:ring-0"
                      />
                    </div>

                    <CustomFieldSelect
                      label="Género"
                      value={editedLead.gender || "Prefiero no decir"}
                      onValueChange={(value) => handleGeneralChange("gender", value)}
                      options={[
                        { value: "Masculino", label: "Masculino" },
                        { value: "Femenino", label: "Femenino" },
                        { value: "Otro", label: "Otro" },
                        { value: "Prefiero no decir", label: "Prefiero no decir" },
                      ]}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div className="space-y-0 border-2 border-[#3d4b5c26] shadow-md rounded-md p-2.5">
                      <Label className="p-0 text-sm text-gray-500 font-normal">Email</Label>
                      <Input
                        type="email"
                        value={(editedLead.email || "").toLowerCase()}
                        onChange={(e) => handleEmailChange(e.target.value)}
                        className={`border-0 border-b border-gray-200 rounded-none px-0 py-0 m-0 text-base font-medium bg-transparent leading-none h-auto min-h-0 focus:border-gray-400 focus:shadow-none focus:ring-0 ${editedLead.email && !isValidEmail(editedLead.email) ? "border-red-500" : ""}`}
                      />
                      {editedLead.email && !isValidEmail(editedLead.email) && (
                        <p className="text-red-500 text-xs mt-1">Formato de correo inválido</p>
                      )}
                    </div>
                    <div className="space-y-0 border-2 border-[#3d4b5c26] shadow-md rounded-md p-2.5">
                      <Label className="p-0 text-sm text-gray-500 font-normal">Email Alternativo</Label>
                      <Input
                        type="email"
                        value={(editedLead.alternateEmail || "").toLowerCase()}
                        onChange={(e) => handleGeneralChange("alternateEmail", e.target.value.toLowerCase())}
                        className={`border-0 border-b border-gray-200 rounded-none px-0 py-0 m-0 text-base font-medium bg-transparent leading-none h-auto min-h-0 focus:border-gray-400 focus:shadow-none focus:ring-0 ${editedLead.alternateEmail && !isValidEmail(editedLead.alternateEmail) ? "border-red-500" : ""}`}
                      />
                      {editedLead.alternateEmail && !isValidEmail(editedLead.alternateEmail) && (
                        <p className="text-red-500 text-xs mt-1">Formato de correo inválido</p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div className="space-y-0 border-2 border-[#3d4b5c26] shadow-md rounded-md p-2.5">
                      <Label className="p-0 text-sm text-gray-500 font-normal">Teléfono</Label>
                      <Input
                        value={editedLead.phone || ""}
                        onChange={(e) => handlePhoneChange(e.target.value)}
                        className="border-0 border-b border-gray-200 rounded-none px-0 py-0 m-0 text-base font-medium bg-transparent leading-none h-auto min-h-0 focus:border-gray-400 focus:shadow-none focus:ring-0"
                      />
                    </div>
                    <div className="space-y-0 border-2 border-[#3d4b5c26] shadow-md rounded-md p-2.5">
                      <Label className="p-0 text-sm text-gray-500 font-normal">Valor potencial</Label>
                      <Input
                        type="number"
                        value={editedLead.value || 0}
                        onChange={(e) => handleGeneralChange("value", Number(e.target.value))}
                        className="border-0 border-b border-gray-200 rounded-none px-0 py-0 m-0 text-base font-medium bg-transparent leading-none h-auto min-h-0 focus:border-gray-400 focus:shadow-none focus:ring-0"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <CustomFieldSelect
                      label="Ocupación"
                      value={editedLead.occupation || ""}
                      onValueChange={(value) => handleGeneralChange("occupation", value)}
                      options={[
                        { value: "Estudiante", label: "Estudiante" },
                        { value: "Empleado(a)", label: "Empleado(a)" },
                        { value: "Independiente", label: "Independiente" },
                        { value: "Desempleado(a)", label: "Desempleado(a)" },
                        { value: "Pensionado(a)", label: "Pensionado(a)" },
                        { value: "Hogar (Ama/o de casa)", label: "Hogar (Ama/o de casa)" },
                        { value: "Militar / Policía", label: "Militar / Policía" },
                        { value: "Docente", label: "Docente" },
                        { value: "Profesional de la salud", label: "Profesional de la salud" },
                        { value: "Otro", label: "Otro" },
                      ]}
                    />

                    <div className="space-y-0 border-2 border-[#3d4b5c26] shadow-md rounded-md p-2.5">
                      <Label className="p-0 text-sm text-gray-500 font-normal">Empresa</Label>
                      <Input
                        value={editedLead.company || ""}
                        onChange={(e) => handleGeneralChange("company", e.target.value)}
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
                          onKeyPress={(e) => e.key === "Enter" && handleAddProduct()}
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
                  <CardTitle className="flex items-center pt-2">Información Adicional</CardTitle>

                  <div className="mt-2 rounded-xl">
                    <SkAccordion type="single" collapsible className="w-full rounded-xl">
                      <SkAccordionItem
                        value="additional-info"
                        className="bg-white !rounded-xl !shadow-md overflow-hidden border border-gray-200"
                      >
                        <SkAccordionTrigger className="px-4 py-4 hover:bg-gray-50 data-[state=open]:bg-gray-100 text-left font-semibold text-gray-700 flex items-center justify-between w-full [&>svg]:text-green-500 [&>svg]:h-5 [&>svg]:w-5 [&>svg]:ml-auto [&>svg]:shrink-0 [&[data-state=open]>svg]:rotate-180 transition-all duration-200">
                          <span>Detalles de Información Adicional</span>
                        </SkAccordionTrigger>
                        <SkAccordionContent className="px-4 pb-4 pt-0 bg-white border-t border-gray-200">
                          {(() => {
                            // Función para obtener solo las claves dinámicas del campo additionalInfo
                            const getAdditionalInfoFields = (lead: any) => {
                              console.log("🔍 DEBUG: Full lead object:", lead);
                              console.log("🔍 DEBUG: All lead properties:", Object.keys(lead));
                              console.log("🔍 DEBUG: Lead additionalInfo value:", lead.additionalInfo);
                              console.log("🔍 DEBUG: Lead additionalInfo type:", typeof lead.additionalInfo);

                              // Buscar cualquier campo que contenga información adicional más allá de los campos estándar
                              const standardFields = [
                                "id",
                                "name",
                                "email",
                                "phone",
                                "status",
                                "source",
                                "priority",
                                "campaign",
                                "portfolio",
                                "product",
                                "createdAt",
                                "updatedAt",
                                "stage",
                                "assignedTo",
                                "assignedToName",
                                "createdBy",
                                "company",
                                "occupation",
                                "value",
                                "type",
                                "outcome",
                                "notes",
                                "documentType",
                                "documentNumber",
                                "age",
                                "gender",
                                "preferredContactChannel",
                                "portfolios",
                                "tags",
                                "nextFollowUp",
                                "campaignOwnerName",
                                "interactions",
                              ];

                              const additionalFields: any = {};

                              // Buscar primero el campo additionalInfo específico
                              if (lead.additionalInfo) {
                                console.log("🔍 Found additionalInfo field:", lead.additionalInfo);

                                if (typeof lead.additionalInfo === "object" && lead.additionalInfo !== null) {
                                  console.log("🔍 additionalInfo is object, using directly");
                                  Object.assign(additionalFields, lead.additionalInfo);
                                } else if (typeof lead.additionalInfo === "string") {
                                  console.log("🔍 additionalInfo is string, attempting to parse JSON");
                                  try {
                                    const parsed = JSON.parse(lead.additionalInfo);
                                    if (typeof parsed === "object" && parsed !== null) {
                                      Object.assign(additionalFields, parsed);
                                    } else {
                                      additionalFields.additionalInfo = lead.additionalInfo;
                                    }
                                  } catch (error) {
                                    console.log("🔍 Failed to parse additionalInfo as JSON, treating as string value");
                                    additionalFields.additionalInfo = lead.additionalInfo;
                                  }
                                } else {
                                  console.log("🔍 additionalInfo is other type, converting to string");
                                  additionalFields.additionalInfo = String(lead.additionalInfo);
                                }
                              }

                              // Buscar también campos dinámicos que no sean estándar
                              Object.keys(lead).forEach((key) => {
                                if (!standardFields.includes(key) && key !== "additionalInfo") {
                                  const value = lead[key];
                                  if (value !== null && value !== undefined && value !== "") {
                                    console.log(`🔍 Found dynamic field: ${key}`, value);
                                    additionalFields[key] = value;
                                  }
                                }
                              });

                              console.log("🔍 Final additional fields:", additionalFields);

                              return Object.keys(additionalFields).length > 0 ? additionalFields : null;
                            };

                            const additionalInfoFields = getAdditionalInfoFields(editedLead);
                            console.log("🔍 Final additionalInfo result:", additionalInfoFields);

                            return additionalInfoFields ? (
                              <div className="rounded-xl overflow-hidden bg-gray-50 mt-4">
                                <ScrollArea className="h-48">
                                  <Table>
                                    <TableHeader className="sticky top-0 bg-gray-100">
                                      <TableRow>
                                        <TableHead className="font-medium text-gray-700">Campo</TableHead>
                                        <TableHead className="font-medium text-gray-700">Valor</TableHead>
                                      </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                      {Object.entries(additionalInfoFields).map(([key, value], index) => (
                                        <TableRow key={key} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                                          <TableCell className="font-medium text-gray-600">{key}</TableCell>
                                          <TableCell className="text-gray-900">
                                            {typeof value === "object" && value !== null
                                              ? JSON.stringify(value, null, 2)
                                              : String(value || "")}
                                          </TableCell>
                                        </TableRow>
                                      ))}
                                    </TableBody>
                                  </Table>
                                </ScrollArea>
                              </div>
                            ) : (
                              <div className="p-4 text-center text-gray-500 bg-gray-50 rounded-xl border border-gray-200">
                                <AlertCircle className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                                <p className="text-sm">No hay información adicional disponible</p>
                              </div>
                            );
                          })()}
                        </SkAccordionContent>
                      </SkAccordionItem>
                    </SkAccordion>
                  </div>
                </CardContent>

                {/* Botón específico para guardar cambios generales */}
                <div className="flex justify-end gap-2 pt-4 border-t">
                  <Button onClick={handleSaveGeneral} disabled={!generalChanges} className="bg-primary">
                    Guardar Cambios Generales
                  </Button>
                </div>
              </TabsContent>

              {/* Tab Gestión */}
              <TabsContent value="management" className="space-y-6">
                <CardContent className="py-2 px-0 space-y-2">
                  <CardTitle className="flex items-center pt-2">Resultado de la Gestión</CardTitle>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    <CustomFieldSelect
                      label="Estado Actual"
                      value={editedLead.stage}
                      onValueChange={(value) => handleManagementChange("stage", value)}
                      options={[
                        { value: "Nuevo", label: "Nuevo" },
                        { value: "Asignado", label: "Asignado" },
                        { value: "Localizado: No interesado", label: "Localizado: No interesado" },
                        { value: "Localizado: Prospecto de venta FP", label: "Localizado: Prospecto de venta FP" },
                        { value: "Localizado: Prospecto de venta AD", label: "Localizado: Prospecto de venta AD" },
                        {
                          value: "Localizado: Prospecto de venta - Pendiente",
                          label: "Localizado: Prospecto de venta - Pendiente",
                        },
                        { value: "Localizado: Volver a llamar", label: "Localizado: Volver a llamar" },
                        { value: "Localizado: No vuelve a contestar", label: "Localizado: No vuelve a contestar" },
                        { value: "No localizado: No contesta", label: "No localizado: No contesta" },
                        { value: "No localizado: Número equivocado", label: "No localizado: Número equivocado" },
                        { value: "Contrato Creado", label: "Contrato Creado" },
                        { value: "Registro de Venta (fondeado)", label: "Registro de Venta (fondeado)" },
                        { value: "Repetido", label: "Repetido" },
                      ]}
                    />

                    <CustomFieldSelect
                      label="Medio de Contacto"
                      value={contactMethod}
                      onValueChange={setContactMethod}
                      options={[
                        { value: "call", label: "Teléfono" },
                        { value: "email", label: "Email" },
                        { value: "whatsapp", label: "WhatsApp" },
                        { value: "meeting", label: "Reunión" },
                      ]}
                      placeholder="Seleccionar medio"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    <CustomFieldSelect
                      label="Resultado de Gestión"
                      value={result}
                      onValueChange={setResult}
                      options={[
                        { value: "Contacto exitoso", label: "Contacto exitoso" },
                        { value: "No contesta", label: "No contesta" },
                        { value: "Reagendar", label: "Reagendar" },
                        { value: "No interesado", label: "No interesado" },
                        { value: "Información enviada", label: "Información enviada" },
                      ]}
                      placeholder="Seleccionar resultado"
                    />
                    <CustomFieldSelect
                      label="Prioridad"
                      value={editedLead.priority}
                      onValueChange={(value) => handleManagementChange("priority", value)}
                      options={[
                        { value: "low", label: "Baja" },
                        { value: "medium", label: "Media" },
                        { value: "high", label: "Alta" },
                        { value: "urgent", label: "Urgente" },
                      ]}
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    <div className="space-y-0 border-2 border-[#3d4b5c26] shadow-md rounded-md p-2.5">
                      <Label htmlFor="followUpDate" className="text-sm text-gray-500 font-normal leading-tight">
                        Próximo seguimiento
                      </Label>
                      <Input
                        id="followUpDate"
                        type="datetime-local"
                        value={formatDateForInput(editedLead.nextFollowUp || "")}
                        onChange={(e) => handleManagementChange("nextFollowUp", e.target.value)}
                        className="border-0 border-b border-gray-200 rounded-none px-0 py-0 m-0 text-base font-medium bg-transparent leading-none h-auto min-h-0 focus:border-gray-400 focus:shadow-none focus:ring-0"
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
                  <div className="flex w-full items-center gap-2">
                    {/* Izquierda */}
                    <Button size="icon" onClick={() => onOpenMassEmail?.(lead)} className="w-8 h-8">
                      <Mail className="h-3 w-3" />
                    </Button>

                    <Button
                      size="icon"
                      onClick={() => {
                        if (lead.phone) {
                          const cleanPhone = lead.phone.replace(/\D/g, "");
                          window.open(`https://wa.me/${cleanPhone}`, "_blank");
                        } else {
                          toast({
                            title: "Error",
                            description: "No hay número de teléfono disponible para este lead",
                            variant: "destructive",
                          });
                        }
                      }}
                      className="w-8 h-8"
                      title="WhatsApp"
                    >
                      <FaWhatsapp className="h-3 w-3" />
                    </Button>

                    <Button
                      size="icon"
                      onClick={handleScheduleOutlookMeeting}
                      className="w-8 h-8"
                      title="Agendar reunión en Outlook"
                    >
                      <Calendar className="h-3 w-3" />
                    </Button>

                    <Button onClick={handleProfilerClick} className="h-8 bg-primary text-white">
                      {hasExistingProfile && profileData ? "Perfilar Lead" : "Perfilar Lead"}
                    </Button>

                    {/* Derecha */}
                    <Button
                      onClick={handleSaveManagement}
                      disabled={!managementChanges || !contactMethod || !result || !managementNotes}
                      className="ml-auto h-8 bg-primary text-white"
                    >
                      Guardar Gestión
                    </Button>
                  </div>
                </CardContent>

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
                          <Button size="sm" variant="outline" onClick={handleLoadClientHistory} className="gap-1">
                            <Users className="h-3 w-3" />
                            Ver historial completo
                          </Button>
                        ) : (
                          <Button size="sm" variant="outline" onClick={handleShowCurrentLeadOnly} className="gap-1">
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
                  <div className="flex items-center justify-center py-5">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    <span className="ml-2">Cargando interacciones...</span>
                  </div>
                ) : (
                  <>
                    {/* Mostrar historial completo del cliente cuando está disponible */}
                    {showingClientHistory && clientHistory.length > 0 ? (
                      <div className="space-y-6">
                        {clientHistory.map((clientLead) => (
                          <Card
                            key={clientLead.LeadId}
                            className={clientLead.LeadId === lead.id ? "border-primary" : ""}
                          >
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
                                    {clientLead.Email} • {clientLead.Campaign || "Sin campaña"}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    Creado: {formatBogotaDistanceToNow(clientLead.CreatedAt)}
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
                                    <div
                                      key={interaction.Id}
                                      className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl"
                                    >
                                      <div className="p-2 rounded-full bg-blue-100 text-blue-600">
                                        {interaction.Type === "email" && <Mail className="h-3 w-3" />}
                                        {interaction.Type === "phone" && <Phone className="h-3 w-3" />}
                                        {interaction.Type === "whatsapp" && <MessageSquare className="h-3 w-3" />}
                                        {interaction.Type === "meeting" && <Calendar className="h-3 w-3" />}
                                        {interaction.Type === "call" && <Phone className="h-3 w-3" />}
                                        {interaction.Type === "note" && <MessageSquare className="h-3 w-3" />}
                                      </div>
                                      <div className="flex-1">
                                        <div className="flex items-center justify-between mb-1">
                                          <h5 className="text-sm font-medium">
                                            {interaction.Description || "Sin título"}
                                          </h5>
                                          <div className="flex items-center gap-2">
                                            {interaction.UserName && (
                                              <Badge variant="outline" className="text-xs">
                                                {interaction.UserName}
                                              </Badge>
                                            )}
                                            {user?.id === interaction.UserId && (
                                              <>
                                                <Button
                                                  variant="ghost"
                                                  size="sm"
                                                  onClick={() => handleEditInteraction(interaction)}
                                                  className="h-6 w-6 p-0"
                                                >
                                                  <Pencil className="h-3 w-3" />
                                                </Button>
                                                <Button
                                                  variant="ghost"
                                                  size="sm"
                                                  onClick={() => handleDeleteInteraction(interaction)}
                                                  className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                                                >
                                                  <Trash2 className="h-3 w-3" />
                                                </Button>
                                              </>
                                            )}
                                          </div>
                                        </div>
                                        <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground flex-wrap">
                                          <span>Tipo: {interaction.Type}</span>
                                          <span>•</span>
                                          <span>Estado: {interaction.Stage}</span>
                                          {interaction.Outcome && (
                                            <>
                                              <span>•</span>
                                              <span>Resultado: {interaction.Outcome}</span>
                                            </>
                                          )}
                                          <span>•</span>
                                          <span>
                                            {formatBogotaDateTime(interaction.CreatedAt, "dd/MM/yyyy hh:mm a")}
                                          </span>
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
                          <div className="text-center py-5 text-muted-foreground">
                            No hay interacciones registradas para este lead
                          </div>
                        ) : (
                          <div className="space-y-4">
                            {interactions.map((interaction) => (
                              <Card key={interaction.Id}>
                                <CardContent className="pt-4 pb-4">
                                  <div className="flex items-start justify-between">
                                    <div className="flex items-start gap-3 flex-1">
                                      <div className="p-2 rounded-full bg-blue-100 text-blue-600">
                                        {interaction.Type === "email" && <Mail className="h-4 w-4" />}
                                        {interaction.Type === "phone" && <Phone className="h-4 w-4" />}
                                        {interaction.Type === "whatsapp" && <MessageSquare className="h-4 w-4" />}
                                        {interaction.Type === "meeting" && <Calendar className="h-4 w-4" />}
                                        {interaction.Type === "call" && <Phone className="h-4 w-4" />}
                                        {interaction.Type === "note" && <MessageSquare className="h-4 w-4" />}
                                      </div>
                                      <div className="flex-1">
                                        <div className="flex items-center justify-between mb-2">
                                          <h4 className="font-medium">{interaction.Description || "Sin título"}</h4>
                                          <div className="flex items-center gap-2">
                                            {interaction.UserName && (
                                              <Badge variant="outline" className="text-xs">
                                                {interaction.UserName}
                                              </Badge>
                                            )}
                                            {user?.id === interaction.UserId && (
                                              <>
                                                <Button
                                                  variant="ghost"
                                                  size="sm"
                                                  onClick={() => handleEditInteraction(interaction)}
                                                  className="h-7 w-7 p-0"
                                                >
                                                  <Pencil className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                  variant="ghost"
                                                  size="sm"
                                                  onClick={() => handleDeleteInteraction(interaction)}
                                                  className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                                                >
                                                  <Trash2 className="h-4 w-4" />
                                                </Button>
                                              </>
                                            )}
                                          </div>
                                        </div>
                                        <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground flex-wrap">
                                          <span>Tipo: {interaction.Type}</span>
                                          <span>•</span>
                                          <span>Estado: {interaction.Stage}</span>
                                          {interaction.Outcome && (
                                            <>
                                              <span>•</span>
                                              <span>Resultado: {interaction.Outcome}</span>
                                            </>
                                          )}
                                          <span>•</span>
                                          <span>
                                            {formatBogotaDateTime(interaction.CreatedAt, "dd/MM/yyyy hh:mm a")}
                                          </span>
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
                    <span className="text-sm font-bold">Usuario Actual Asignado:</span>
                    <span className="text-sm font-medium">{assignedUserName}</span>
                  </div>
                  {permissions?.canAssign && (
                    <Button size="sm" variant="outline" onClick={() => setShowReassignDialog(true)} className="gap-1">
                      <UserPlus className="h-3 w-3" />
                      Reasignar
                    </Button>
                  )}
                </div>
                <div className="flex items-center gap-2 mb-4">
                  <History className="h-5 w-5" />
                  <h3 className="text-lg font-semibold">Historial de Asignaciones</h3>
                </div>

                {historyLoading ? (
                  <div className="flex items-center justify-center py-5">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mr-2"></div>
                    <span>Cargando historial...</span>
                  </div>
                ) : assignmentHistory.length === 0 ? (
                  <div className="text-center py-5 text-muted-foreground">
                    <History className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No hay historial de asignaciones disponible</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {assignmentHistory.map((entry, index) => (
                      <Card key={index}>
                        <CardContent className="pt-4 pb-4">
                          <div className="flex items-start justify-between">
                            <div>
                              <h4 className="font-medium">Reasignación</h4>
                              <p className="text-sm text-muted-foreground mt-1">
                                De: {entry.from_user_name || "Usuario desconocido"} → A:{" "}
                                {entry.to_user_name || "Usuario desconocido"}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                Motivo: {entry.reason || "No especificado"}
                              </p>
                              {entry.notes && <p className="text-sm text-muted-foreground">Notas: {entry.notes}</p>}
                            </div>
                            <div className="text-right">
                              <p className="text-xs text-muted-foreground">
                                {formatBogotaDateTime(entry.assigned_at, "dd/MM/yyyy hh:mm a")}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                Por: {entry.assigned_by_name || "Sistema"}
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
          </DialogContent>
        </Dialog>

        {/* Dialog de reasignación */}
        <LeadReassignDialog
          isOpen={showReassignDialog}
          onClose={() => setShowReassignDialog(false)}
          lead={editedLead}
          onSuccess={handleReassignSuccess}
        />

        {/* Dialog de edición de interacciones */}
        <EditInteractionDialog
          interaction={editingInteraction}
          open={showEditInteractionDialog}
          onOpenChange={setShowEditInteractionDialog}
          onSave={handleSaveInteraction}
        />

        {/* Componente del Perfilador */}
        <Dialog open={showProfiler} onOpenChange={() => setShowProfiler(false)}>
          <DialogContent className="max-w-4xl min-h-[600px] p-0 bg-gray-50 overflow-y-auto">
            <LeadProfiler selectedLead={lead} onBack={() => setShowProfiler(false)} />
          </DialogContent>
        </Dialog>

        {/* Resultados del Perfil */}
        <ProfileResults
          isOpen={showProfileResults}
          onClose={() => setShowProfileResults(false)}
          profileData={profileData}
        />
      </>
    );
  } catch (error) {
    console.error("Error rendering LeadDetail:", error);
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Error</DialogTitle>
          </DialogHeader>
          <div className="p-4">
            <p>Ha ocurrido un error al cargar los detalles del lead.</p>
            <Button onClick={onClose} className="mt-4">
              Cerrar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }
}
