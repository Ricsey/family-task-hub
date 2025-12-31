import type { Task, TaskApi } from "../types";

export const toApiTask = (task: Task): TaskApi => ({
  ...task,
  due_date: formatDateForApi(task.due_date),
});

export const fromApiTask = (taskApi: TaskApi): Task => ({
  ...taskApi,
  due_date: parseDateFromApi(taskApi.due_date),
});

export const formatDateForApi = (date: Date): string => {
  // Format as YYYY-MM-DD
  return date.toISOString().split('T')[0];
};

export const parseDateFromApi = (dateStr: string): Date => {
  // Parse YYYY-MM-DD string to Date object
  return new Date(dateStr + 'T00:00:00');
};
