
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, Users, Mail, CheckSquare } from 'lucide-react';
import { useUpcomingActivities, UpcomingActivity } from '@/hooks/useUpcomingActivities';
import { convertToBogotaTime } from '@/utils/dateUtils';

export function UpcomingActivities() {
  const { upcomingActivities, loading } = useUpcomingActivities();

  const formatDateTime = (date: Date) => {
    // Crear una copia del objeto Date original
    const adjustedDate = new Date(date);
    adjustedDate.setHours(adjustedDate.getHours() + 5); // Sumar 5 horas

    const bogotaTime = convertToBogotaTime(adjustedDate.toISOString());

    return {
      date: bogotaTime.toLocaleDateString('es-CO', {
        weekday: 'short',
        month: 'short',
        day: 'numeric'
      }),
      time: bogotaTime.toLocaleTimeString('es-CO', {
        hour: '2-digit',
        minute: '2-digit'
      })
    };
  };

  const getSourceIcon = (source: 'microsoft' | 'calendly' | 'task') => {
    switch (source) {
      case 'microsoft':
        return <Mail className="h-3 w-3" />;
      case 'calendly':
        return <Users className="h-3 w-3" />;
      case 'task':
        return <CheckSquare className="h-3 w-3" />;
      default:
        return <Calendar className="h-3 w-3" />;
    }
  };

  const getSourceColor = (source: 'microsoft' | 'calendly' | 'task') => {
    switch (source) {
      case 'microsoft':
        return 'bg-blue-100 text-blue-800';
      case 'calendly':
        return 'bg-green-100 text-green-800';
      case 'task':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getSourceLabel = (source: 'microsoft' | 'calendly' | 'task') => {
    switch (source) {
      case 'microsoft':
        return 'Outlook';
      case 'calendly':
        return 'Calendly';
      case 'task':
        return 'Tarea';
      default:
        return 'Evento';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-[#00c83c] flex items-center gap-2">
            Próximas Actividades
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#00c83c]"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-[#00c83c] flex items-center gap-2">
          Próximas Actividades
        </CardTitle>
      </CardHeader>
      <CardContent>
        {upcomingActivities.length === 0 ? (
          <div className="text-center py-8">
            <Calendar className="h-12 w-12 mx-auto mb-2 text-muted-foreground opacity-50" />
            <p className="text-muted-foreground">No hay actividades programadas</p>
            <p className="text-sm text-muted-foreground">en los próximos 30 días</p>
          </div>
        ) : (
          <div className="space-y-3">
            {upcomingActivities.map((activity) => {
              const { date, time } = formatDateTime(activity.startTime);
              
              return (
                <div
                  key={activity.id}
                  className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <div className="flex flex-col text-sm">
                      <span className="font-medium text-muted-foreground">{date}</span>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        <span>{time}</span>
                      </div>
                    </div>
                    
                    <div className="min-w-0 flex-1">
                      <h4 className="font-medium text-sm truncate">{activity.title}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge 
                          variant="secondary" 
                          className={`text-xs flex items-center gap-1 ${getSourceColor(activity.source)}`}
                        >
                          {getSourceIcon(activity.source)}
                          {getSourceLabel(activity.source)}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
