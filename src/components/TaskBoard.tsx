
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatBogotaDateTime } from '@/utils/dateUtils';
import { Clock, User, AlertTriangle } from 'lucide-react';
import { Task, TaskStatus } from '@/types/tasks';
import { useTasks } from '@/hooks/useTasks';
import { TaskEditDialog } from '@/components/TaskEditDialog';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface TaskBoardProps {
  tasks: Task[];
}

const statusConfig = {
  pending: { label: 'Pendiente', color: 'bg-yellow-100 text-yellow-800' },
  'in-progress': { label: 'En Progreso', color: 'bg-blue-100 text-blue-800' },
  completed: { label: 'Completada', color: 'bg-green-100 text-green-800' },
  cancelled: { label: 'Cancelada', color: 'bg-red-100 text-red-800' }
};

const priorityConfig = {
  low: { label: 'Baja', color: 'bg-gray-100 text-gray-800' },
  medium: { label: 'Media', color: 'bg-blue-100 text-blue-800' },
  high: { label: 'Alta', color: 'bg-orange-100 text-orange-800' },
  urgent: { label: 'Urgente', color: 'bg-red-100 text-red-800' }
};

interface TaskCardProps {
  task: Task;
  onClick: () => void;
}

function TaskCard({ task, onClick }: TaskCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const isOverdue = (dueDate: string) => {
    return new Date(dueDate) < new Date() && task.status !== 'completed';
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={onClick}
      className="p-3 border rounded-xl bg-white shadow-sm cursor-pointer hover:shadow-md transition-shadow"
    >
      <div className="space-y-2">
        <div className="flex items-start justify-between">
          <h4 className="text-sm font-medium line-clamp-2">{task.title}</h4>
          {isOverdue(task.dueDate) && (
            <AlertTriangle className="h-4 w-4 text-red-500 flex-shrink-0" />
          )}
        </div>
        
        {task.description && (
          <p className="text-xs text-muted-foreground line-clamp-2">
            {task.description}
          </p>
        )}

        <div className="flex items-center gap-2">
          <Badge className={`text-xs ${priorityConfig[task.priority].color}`}>
            {priorityConfig[task.priority].label}
          </Badge>
        </div>

        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            <span className={isOverdue(task.dueDate) ? 'text-red-600 font-medium' : ''}>
              {formatBogotaDateTime(task.dueDate, 'dd MMM')}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <User className="h-3 w-3" />
            <span>Asignada</span>
          </div>
        </div>
      </div>
    </div>
  );
}

interface DroppableColumnProps {
  status: TaskStatus;
  children: React.ReactNode;
  onDrop: (taskId: string) => void;
}

function DroppableColumn({ status, children, onDrop }: DroppableColumnProps) {
  const { isOver, setNodeRef } = useSortable({
    id: `column-${status}`,
    data: { type: 'column', status }
  });

  return (
    <div
      ref={setNodeRef}
      className={`space-y-3 min-h-[200px] ${isOver ? 'bg-gray-50 rounded-xl' : ''}`}
    >
      {children}
    </div>
  );
}

export function TaskBoard({ tasks }: TaskBoardProps) {
  const { updateTaskStatus } = useTasks();
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const tasksByStatus = {
    pending: tasks.filter(task => task.status === 'pending'),
    'in-progress': tasks.filter(task => task.status === 'in-progress'),
    completed: tasks.filter(task => task.status === 'completed'),
    cancelled: tasks.filter(task => task.status === 'cancelled')
  };

  const handleDragStart = (event: DragStartEvent) => {
    const task = tasks.find(t => t.id === event.active.id);
    if (task) {
      setActiveTask(task);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) return;

    const taskId = active.id as string;
    const overId = over.id as string;

    // Si se suelta sobre una columna
    if (overId.startsWith('column-')) {
      const newStatus = overId.replace('column-', '') as TaskStatus;
      updateTaskStatus(taskId, newStatus);
    }
    // Si se suelta sobre otra tarea, obtener el estado de esa columna
    else {
      const overTask = tasks.find(t => t.id === overId);
      if (overTask && overTask.status !== tasks.find(t => t.id === taskId)?.status) {
        updateTaskStatus(taskId, overTask.status);
      }
    }
  };

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
    setEditDialogOpen(true);
  };

  return (
    <>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Object.entries(statusConfig).map(([status, config]) => (
            <Card key={status}>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">
                  {config.label} ({tasksByStatus[status as TaskStatus].length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <SortableContext
                  items={[`column-${status}`, ...tasksByStatus[status as TaskStatus].map(t => t.id)]}
                  strategy={verticalListSortingStrategy}
                >
                  <DroppableColumn
                    status={status as TaskStatus}
                    onDrop={(taskId) => updateTaskStatus(taskId, status as TaskStatus)}
                  >
                    <div className="space-y-3">
                      {tasksByStatus[status as TaskStatus].map(task => (
                        <TaskCard
                          key={task.id}
                          task={task}
                          onClick={() => handleTaskClick(task)}
                        />
                      ))}
                      
                      {tasksByStatus[status as TaskStatus].length === 0 && (
                        <div className="text-center py-5 text-muted-foreground">
                          <p className="text-sm">No hay tareas</p>
                        </div>
                      )}
                    </div>
                  </DroppableColumn>
                </SortableContext>
              </CardContent>
            </Card>
          ))}
        </div>

        <DragOverlay>
          {activeTask ? (
            <div className="p-3 border rounded-xl bg-white shadow-lg opacity-90">
              <h4 className="text-sm font-medium">{activeTask.title}</h4>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      {selectedTask && (
        <TaskEditDialog
          task={selectedTask}
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          onTaskUpdated={() => {
            setEditDialogOpen(false);
            setSelectedTask(null);
          }}
        />
      )}
    </>
  );
}
