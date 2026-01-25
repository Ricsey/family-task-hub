export interface TaskApi {
  id: string;
  title: string;
  description?: string;
  assignee?: string;
  category: 'Chore' | 'Homework' | 'Shopping' | 'Other';
  due_date: string; // YYYY-MM-DD format
  status: 'todo' | 'in-progress' | 'completed';
}
