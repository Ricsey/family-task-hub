export interface Task {
  id: string;
  title: string;
  description?: string;
  assignee: string;
  category: 'Chore' | 'Homework' | 'Shopping' | 'Other';
  dueDate?: string;
  status: 'todo' | 'in-progress' | 'completed';
}
