import { Calendar, MapPin, ChevronRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface AgendaItem {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  isUrgent?: boolean;
}

const mockAgendaItems: AgendaItem[] = [
  {
    id: "1",
    title: "Reunión Cliente Andrés Mejía",
    date: "18/oct/2025",
    time: "10:30 a.m.",
    location: "Teams",
    isUrgent: true,
  },
  {
    id: "2",
    title: "Reunión de Equipo",
    date: "18/oct/2025",
    time: "4:00 p.m.",
    location: "Skandia",
  },
  {
    id: "3",
    title: "Envío de reportes",
    date: "18/oct/2025",
    time: "10:30 a.m.",
    location: "",
    isUrgent: true,
  },
  {
    id: "3",
    title: "Envío de reportes",
    date: "18/oct/2025",
    time: "10:30 a.m.",
    location: "",
    isUrgent: true,
  },
  {
    id: "3",
    title: "Envío de reportes",
    date: "18/oct/2025",
    time: "10:30 a.m.",
    location: "",
    isUrgent: true,
  },
];

type PeriodType = "Hoy" | "Esta semana" | "Próxima semana";

export function TodayAgenda() {
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodType>("Hoy");

  return (
    <Card className="p-4 h-full flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          <h3 className="text-lg font-semibold">Tu agenda</h3>
        </div>
        <Button variant="link" className="text-primary p-0 h-auto">
          Organiza tu agenda
        </Button>
      </div>

      <div className="flex gap-2 mb-4">
        {(["Hoy", "Esta semana", "Próxima semana"] as PeriodType[]).map((period) => (
          <Button
            key={period}
            onClick={() => setSelectedPeriod(period)}
            variant={selectedPeriod === period ? "default" : "outline"}
            size="sm"
            className="rounded-full"
          >
            {period}
          </Button>
        ))}
      </div>

      <div className="overflow-x-auto space-y-2 flex-1">
        {mockAgendaItems.map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors cursor-pointer group"
          >
            <div className="flex-1">
              <h4 className="font-medium mb-2">{item.title}</h4>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span>{item.date}</span>
                </div>
                {item.location && (
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    <span>{item.location}</span>
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="font-medium">{item.time}</div>
                {item.isUrgent && (
                  <Badge variant="secondary" className="mt-1 bg-orange-100 text-orange-700">
                    Urgente
                  </Badge>
                )}
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
