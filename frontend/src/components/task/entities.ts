export interface Task {
  id: string;
  title: string;
  description?: string;
  assignee: string;
  category: string;
  dueDate?: string;
  status: 'in-progress' | 'completed';
}
