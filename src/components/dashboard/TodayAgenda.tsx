import { Calendar, MapPin, ChevronRight, ArrowRight, RefreshCw } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useState } from "react";
import { useOutlookCalendar } from "@/hooks/useOutlookCalendar";
import { Skeleton } from "@/components/ui/skeleton";

type PeriodType = "Hoy" | "Esta semana" | "Próxima semana";

const periodMap: Record<PeriodType, 'today' | 'thisWeek' | 'nextWeek'> = {
  "Hoy": "today",
  "Esta semana": "thisWeek",
  "Próxima semana": "nextWeek",
};

export function TodayAgenda() {
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodType>("Hoy");
  const { events, isLoading, error, refetch } = useOutlookCalendar(periodMap[selectedPeriod]);

  return (
    <Card className="p-4 max-h-[450px] flex flex-col gap-4 bg-[#fafafa]">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 truncate">
          <h3 className="text-lg font-semibold truncate">Tu agenda</h3>
          {!isLoading && (
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={refetch}
              title="Actualizar"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          )}
        </div>
        <Button variant="link" className="text-primary p-0 h-auto">
          Organiza tu agenda
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>

      <div className="flex gap-2 mb-2">
        {(["Hoy", "Esta semana", "Próxima semana"] as PeriodType[]).map((period) => (
          <Button
            key={period}
            onClick={() => setSelectedPeriod(period)}
            variant={selectedPeriod === period ? "default" : "outline"}
            size="sm"
            className="rounded-full"
            disabled={isLoading}
          >
            {period}
          </Button>
        ))}
      </div>

      <ScrollArea className="max-h-[280px]">
        <div className="space-y-3 flex-1 pr-4">
          {isLoading ? (
            // Loading skeleton
            <>
              {[1, 2, 3].map((i) => (
                <div key={i} className="p-4 rounded-xl border bg-white">
                  <Skeleton className="h-5 w-3/4 mb-2" />
                  <div className="flex gap-4">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                </div>
              ))}
            </>
          ) : error ? (
            // Error state
            <div className="p-4 rounded-xl border bg-white text-center text-muted-foreground">
              <p>{error}</p>
              <Button
                variant="outline"
                size="sm"
                className="mt-2"
                onClick={refetch}
              >
                Reintentar
              </Button>
            </div>
          ) : events.length === 0 ? (
            // Empty state
            <div className="p-8 rounded-xl border bg-white text-center text-muted-foreground">
              <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No hay eventos programados para {selectedPeriod.toLowerCase()}</p>
            </div>
          ) : (
            // Events list
            events.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-4 rounded-xl border bg-white hover:bg-muted/50 transition-colors cursor-pointer group"
              >
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium mb-2 truncate">{item.title}</h4>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground truncate">
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
                    <div className="font-medium text-sm">{item.time}</div>
                    {item.isUrgent && (
                      <Badge variant="secondary" className="mt-1 bg-orange-100 text-orange-700">
                        Urgente
                      </Badge>
                    )}
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </Card>
  );
}
