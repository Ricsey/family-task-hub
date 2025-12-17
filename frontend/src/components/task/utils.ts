import { format, isToday, isTomorrow } from 'date-fns';

export const formatDueDate = (dueDate: string) => {
  if (isToday(dueDate)) return 'Today';
  if (isTomorrow(dueDate)) return 'Tomorrow';
  return format(dueDate, 'MMM d');
};
