import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Lead } from "@/types/crm";
import { Calendar, Phone, Mail, User } from "lucide-react";

interface TodayFollowUpsListProps {
  leads: Lead[];
}

export function TodayFollowUpsList({ leads }: TodayFollowUpsListProps) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const todayFollowUps = leads.filter(lead => {
    if (!lead.nextFollowUp) return false;
    const followUpDate = new Date(lead.nextFollowUp);
    followUpDate.setHours(0, 0, 0, 0);
    return followUpDate.getTime() === today.getTime();
  });

  const getPriorityColor = (priority: string) => {
    switch (priority?.toLowerCase()) {
      case 'high':
      case 'urgent':
        return 'destructive';
      case 'medium':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Calendar className="h-4 w-4" />
          Seguimientos de Hoy ({todayFollowUps.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {todayFollowUps.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            No hay seguimientos programados para hoy
          </p>
        ) : (
          todayFollowUps.slice(0, 5).map((lead) => (
            <div key={lead.id} className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <User className="h-3 w-3 text-muted-foreground" />
                  <span className="font-medium text-sm truncate">{lead.name}</span>
                  <Badge variant={getPriorityColor(lead.priority)} className="h-5 text-xs">
                    {lead.priority}
                  </Badge>
                </div>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Mail className="h-3 w-3" />
                    <span className="truncate max-w-[120px]">{lead.email}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Phone className="h-3 w-3" />
                    <span>{lead.phone}</span>
                  </div>
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {lead.stage} • ${lead.value?.toLocaleString() || '0'}
                </div>
              </div>
            </div>
          ))
        )}
        {todayFollowUps.length > 5 && (
          <p className="text-xs text-muted-foreground text-center pt-2">
            +{todayFollowUps.length - 5} seguimientos más...
          </p>
        )}
      </CardContent>
    </Card>
  );
}