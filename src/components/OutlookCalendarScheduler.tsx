
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar, Clock } from "lucide-react";
import { Lead } from "@/types/crm";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

interface OutlookCalendarSchedulerProps {
  lead: Lead;
}

export function OutlookCalendarScheduler({ lead }: OutlookCalendarSchedulerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isScheduling, setIsScheduling] = useState(false);
  const [meetingData, setMeetingData] = useState({
    title: `Reunión con ${lead.name}`,
    date: "",
    time: "",
    duration: "60", // minutos
    description: `Reunión programada con ${lead.name} de ${lead.company || 'la empresa'}.`,
    location: ""
  });
  
  const { toast } = useToast();
  const { user } = useAuth();

  const handleScheduleMeeting = async () => {
    if (!meetingData.date || !meetingData.time) {
      toast({
        title: "Error",
        description: "Por favor selecciona fecha y hora para la reunión",
        variant: "destructive",
      });
      return;
    }

    setIsScheduling(true);
    console.log('📅 Programando reunión en Outlook...', {
      lead: lead.name,
      user: user?.name,
      meetingData
    });

    try {
      // Crear fecha y hora de inicio
      const startDateTime = new Date(`${meetingData.date}T${meetingData.time}`);
      const endDateTime = new Date(startDateTime.getTime() + parseInt(meetingData.duration) * 60000);
      
      // Formatear fechas para Outlook
      const startDate = startDateTime.toISOString();
      const endDate = endDateTime.toISOString();
      
      // Crear URL para abrir Outlook con los datos de la reunión
      const outlookUrl = `https://outlook.live.com/calendar/0/deeplink/compose?` +
        `subject=${encodeURIComponent(meetingData.title)}` +
        `&startdt=${encodeURIComponent(startDate)}` +
        `&enddt=${encodeURIComponent(endDate)}` +
        `&body=${encodeURIComponent(meetingData.description)}` +
        `&location=${encodeURIComponent(meetingData.location)}` +
        `&to=${encodeURIComponent(lead.email)}`;

      console.log('📅 URL de Outlook generada:', outlookUrl);
      
      // Abrir Outlook en una nueva ventana
      window.open(outlookUrl, '_blank');
      
      toast({
        title: "Éxito",
        description: "Se abrió Outlook para programar la reunión",
      });
      
      setIsOpen(false);
      
      // Reset form
      setMeetingData({
        title: `Reunión con ${lead.name}`,
        date: "",
        time: "",
        duration: "60",
        description: `Reunión programada con ${lead.name} de ${lead.company || 'la empresa'}.`,
        location: ""
      });
      
    } catch (error) {
      console.error('❌ Error al programar reunión:', error);
      toast({
        title: "Error",
        description: "Error al abrir Outlook para programar la reunión",
        variant: "destructive",
      });
    } finally {
      setIsScheduling(false);
    }
  };

  const getTomorrowDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          className="gap-2"
        >
          <Calendar className="h-4 w-4" />
          Agendar Reunión
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Programar Reunión en Outlook
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="meeting-title">Título de la reunión</Label>
            <Input
              id="meeting-title"
              value={meetingData.title}
              onChange={(e) => setMeetingData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Título de la reunión"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="meeting-date">Fecha</Label>
              <Input
                id="meeting-date"
                type="date"
                value={meetingData.date}
                onChange={(e) => setMeetingData(prev => ({ ...prev, date: e.target.value }))}
                min={getTomorrowDate()}
              />
            </div>
            <div>
              <Label htmlFor="meeting-time">Hora</Label>
              <Input
                id="meeting-time"
                type="time"
                value={meetingData.time}
                onChange={(e) => setMeetingData(prev => ({ ...prev, time: e.target.value }))}
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="meeting-duration">Duración (minutos)</Label>
            <select
              id="meeting-duration"
              value={meetingData.duration}
              onChange={(e) => setMeetingData(prev => ({ ...prev, duration: e.target.value }))}
              className="w-full p-2 border border-gray-300 rounded-md"
            >
              <option value="30">30 minutos</option>
              <option value="60">1 hora</option>
              <option value="90">1.5 horas</option>
              <option value="120">2 horas</option>
            </select>
          </div>
          
          <div>
            <Label htmlFor="meeting-location">Ubicación (opcional)</Label>
            <Input
              id="meeting-location"
              value={meetingData.location}
              onChange={(e) => setMeetingData(prev => ({ ...prev, location: e.target.value }))}
              placeholder="Sala de reuniones, dirección, etc."
            />
          </div>
          
          <div>
            <Label htmlFor="meeting-description">Descripción</Label>
            <Textarea
              id="meeting-description"
              value={meetingData.description}
              onChange={(e) => setMeetingData(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
              placeholder="Agenda de la reunión..."
            />
          </div>
          
          <div className="bg-blue-50 p-3 rounded-md text-sm text-blue-700">
            <p className="font-medium">ℹ️ Información:</p>
            <p>Se abrirá Outlook con los datos de la reunión pre-llenados y se invitará automáticamente a {lead.email}.</p>
          </div>
          
          <div className="flex gap-3">
            <Button
              onClick={handleScheduleMeeting}
              disabled={isScheduling}
              className="flex-1"
            >
              {isScheduling ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Programando...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Abrir Outlook
                </div>
              )}
            </Button>
            <Button
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={isScheduling}
            >
              Cancelar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
