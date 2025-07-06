
import { useState, useEffect } from 'react';
import { Task, TaskStatus, TaskFilters } from '@/types/tasks';

// Mock data para tareas
const mockTasks: Task[] = [
  {
    id: '1',
    title: 'Llamar a cliente ABC Corp',
    description: 'Seguimiento de propuesta comercial',
    status: 'pending',
    priority: 'high',
    assignedTo: 'user-1',
    assignedBy: 'supervisor-1',
    leadId: 'lead-1',
    dueDate: '2025-06-20T10:00:00Z',
    createdAt: '2025-06-18T09:00:00Z',
    updatedAt: '2025-06-18T09:00:00Z'
  },
  {
    id: '2',
    title: 'Enviar cotización',
    description: 'Preparar y enviar cotización detallada',
    status: 'in-progress',
    priority: 'medium',
    assignedTo: 'user-2',
    assignedBy: 'supervisor-1',
    dueDate: '2025-06-19T16:00:00Z',
    createdAt: '2025-06-17T14:00:00Z',
    updatedAt: '2025-06-18T10:00:00Z'
  },
  {
    id: '3',
    title: 'Reunión de cierre',
    description: 'Reunión final para cerrar el negocio',
    status: 'pending',
    priority: 'urgent',
    assignedTo: 'user-1',
    assignedBy: 'supervisor-1',
    dueDate: '2025-06-21T14:00:00Z',
    createdAt: '2025-06-18T11:00:00Z',
    updatedAt: '2025-06-18T11:00:00Z'
  }
];

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>(mockTasks);
  const [loading, setLoading] = useState(false);

  const createTask = (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newTask: Task = {
      ...taskData,
      id: `task-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setTasks(prev => [...prev, newTask]);
    return newTask;
  };

  const updateTask = (taskId: string, updates: Partial<Task>) => {
    setTasks(prev => prev.map(task => 
      task.id === taskId 
        ? { ...task, ...updates, updatedAt: new Date().toISOString() }
        : task
    ));
  };

  const updateTaskStatus = (taskId: string, status: TaskStatus) => {
    const updates: Partial<Task> = {
      status,
      updatedAt: new Date().toISOString()
    };

    if (status === 'completed') {
      updates.completedAt = new Date().toISOString();
    }

    updateTask(taskId, updates);
  };

  const deleteTask = (taskId: string) => {
    setTasks(prev => prev.filter(task => task.id !== taskId));
  };

  const getTasksByFilters = (filters: TaskFilters) => {
    return tasks.filter(task => {
      if (filters.status && task.status !== filters.status) return false;
      if (filters.priority && task.priority !== filters.priority) return false;
      if (filters.assignedTo && task.assignedTo !== filters.assignedTo) return false;
      if (filters.dueDateFrom && new Date(task.dueDate) < new Date(filters.dueDateFrom)) return false;
      if (filters.dueDateTo && new Date(task.dueDate) > new Date(filters.dueDateTo)) return false;
      return true;
    });
  };

  const getUpcomingTasks = (days: number = 7) => {
    const now = new Date();
    const futureDate = new Date(now.getTime() + (days * 24 * 60 * 60 * 1000));
    
    return tasks.filter(task => {
      const dueDate = new Date(task.dueDate);
      return dueDate >= now && dueDate <= futureDate && task.status !== 'completed';
    }).sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
  };

  return {
    tasks,
    loading,
    createTask,
    updateTask,
    updateTaskStatus,
    deleteTask,
    getTasksByFilters,
    getUpcomingTasks
  };
}
