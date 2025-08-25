import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Task } from "@/types/tasks";
import { CheckSquare, Clock, User, AlertTriangle } from "lucide-react";

interface TodayTasksListProps {
  tasks: Task[];
}

export function TodayTasksList({ tasks }: TodayTasksListProps) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const todayTasks = tasks.filter(task => {
    const taskDate = new Date(task.dueDate);
    taskDate.setHours(0, 0, 0, 0);
    return taskDate.getTime() === today.getTime() && task.status !== 'completed';
  });

  const getPriorityColor = (priority: string) => {
    switch (priority?.toLowerCase()) {
      case 'urgent':
        return 'destructive';
      case 'high':
        return 'destructive';
      case 'medium':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const getPriorityIcon = (priority: string) => {
    if (priority?.toLowerCase() === 'urgent') {
      return <AlertTriangle className="h-3 w-3" />;
    }
    return <Clock className="h-3 w-3" />;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'in-progress':
        return 'secondary';
      case 'pending':
        return 'outline';
      case 'completed':
        return 'default';
      default:
        return 'outline';
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <CheckSquare className="h-4 w-4" />
          Tareas de Hoy ({todayTasks.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {todayTasks.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            No hay tareas programadas para hoy
          </p>
        ) : (
          todayTasks.slice(0, 5).map((task) => (
            <div key={task.id} className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  {getPriorityIcon(task.priority)}
                  <span className="font-medium text-sm truncate">{task.title}</span>
                  <Badge variant={getPriorityColor(task.priority)} className="h-5 text-xs">
                    {task.priority}
                  </Badge>
                </div>
                {task.description && (
                  <p className="text-xs text-muted-foreground mb-1 truncate">
                    {task.description}
                  </p>
                )}
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Badge variant={getStatusColor(task.status)} className="h-4 text-xs">
                    {task.status === 'in-progress' ? 'En progreso' : 
                     task.status === 'pending' ? 'Pendiente' : 
                     task.status === 'completed' ? 'Completada' : task.status}
                  </Badge>
                  <span>•</span>
                  <span>{new Date(task.dueDate).toLocaleTimeString('es-CO', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}</span>
                </div>
              </div>
              <User className="h-4 w-4 text-muted-foreground ml-2" />
            </div>
          ))
        )}
        {todayTasks.length > 5 && (
          <p className="text-xs text-muted-foreground text-center pt-2">
            +{todayTasks.length - 5} tareas más...
          </p>
        )}
      </CardContent>
    </Card>
  );
}