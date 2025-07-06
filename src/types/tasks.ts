
export type TaskStatus = 'pending' | 'in-progress' | 'completed' | 'cancelled';
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  assignedTo: string; // User ID
  assignedBy: string; // User ID
  leadId?: string; // Optional lead association
  dueDate: string; // ISO date string
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

export interface TaskFilters {
  status?: TaskStatus;
  priority?: TaskPriority;
  assignedTo?: string;
  dueDateFrom?: string;
  dueDateTo?: string;
}
