export interface Task {
  id: string;
  title: string;
  description?: string;
  assignee?: string;
  category: 'Chore' | 'Homework' | 'Shopping' | 'Other';
  due_date: Date;
  status: 'todo' | 'in-progress' | 'completed';
}
