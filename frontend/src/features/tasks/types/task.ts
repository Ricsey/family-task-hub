export type TaskStatus = 'todo' | 'in-progress' | 'completed';

export interface Task {
  id: string;
  title: string;
  description?: string;
  assignee_id?: string | null;
  assignee?: {
    id: string;
    full_name: string | null;
    email: string;
  } | null;
  category: 'Chore' | 'Homework' | 'Shopping' | 'Other';
  due_date: Date;
  status: TaskStatus;
}
