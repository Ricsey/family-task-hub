import { format, isToday, isTomorrow } from 'date-fns';
import type { Task } from './entities';

export const formatDueDate = (dueDate: string) => {
  if (isToday(dueDate)) return 'Today';
  if (isTomorrow(dueDate)) return 'Tomorrow';
  return format(dueDate, 'MMM d');
};

const filterByCategory = (tasks: Task[], category: string) => {
  if (category === 'all') return tasks;
  return tasks.filter((task) => task.category === category);
};

const filterByAssignee = (tasks: Task[], assignee: string) => {
  if (assignee === 'all') return tasks;
  return tasks.filter((task) => task.assignee === assignee);
};

const filterBySearch = (tasks: Task[], query: string) => {
  if (!query) return tasks;

  const lowerQuery = query.toLowerCase();
  return tasks.filter(
    (task) =>
      task.title.toLowerCase().includes(lowerQuery) ||
      task.description?.toLowerCase().includes(lowerQuery)
  );
};

export const filterTasks = (
  tasks: Task[],
  category: string,
  assignee: string,
  searchQuery: string
) => {
  let result = [...tasks];

  result = filterByCategory(result, category);
  result = filterByAssignee(result, assignee);
  result = filterBySearch(result, searchQuery);

  return result;
};

export const sortTasks = (tasks: Task[], sortBy: string): Task[] => {
  return [...tasks].sort((a, b) => {
    switch (sortBy) {
      case 'date':
        // ascending
        return (
          new Date(a.dueDate ?? 0).getTime() -
          new Date(b.dueDate ?? 0).getTime()
        ); // casue dueDate is optional

      case 'title':
        return a.title.localeCompare(b.title);

      default:
        return 0;
    }
  });
};
