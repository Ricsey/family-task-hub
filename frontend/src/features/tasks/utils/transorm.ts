import type { Task, TaskApi } from "../types";

export const toApiTask = (task: Task): TaskApi => {
  const { assignee, ...rest } = task;
  return {
    ...rest,
    due_date: task.due_date ? formatDateForApi(task.due_date) : undefined!,
  };
};

export const fromApiTask = (taskApi: TaskApi): Task => {
  const { assignee, ...rest } = taskApi;
  return {
    ...rest,
    due_date: parseDateFromApi(taskApi.due_date),
  };
};

export const formatDateForApi = (date: Date): string => {
  // Use local date components to avoid timezone issues
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const parseDateFromApi = (dateStr: string): Date => {
  // Parse YYYY-MM-DD string as local date
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
};
