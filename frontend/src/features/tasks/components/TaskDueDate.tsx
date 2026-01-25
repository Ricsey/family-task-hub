import { format, isPast, isToday, isTomorrow, startOfDay } from 'date-fns';
import { Calendar } from 'lucide-react';

interface TaskDueDateProps {
  dueDate: Date;
  isDone: boolean;
}

//TODO: Maybe this goes to utils?
export function formatDueDate(date: Date): string {
  if (isToday(date)) return 'Today';
  if (isTomorrow(date)) return 'Tomorrow';
  return format(date, 'MMM d');
}

const TaskDueDate = ({ dueDate, isDone }: TaskDueDateProps) => {
  const dateToCheck = startOfDay(dueDate);
  const isOverDue = isPast(dateToCheck) && !isToday(dateToCheck) && !isDone;

  const renderedDate = formatDueDate(dueDate);

  return (
    <div
      className={`flex items-center gap-1 text-xs ml-auto ${
        isOverDue ? 'text-red-600' : 'text-stone-500'
      }`}
    >
      <Calendar className="w-3 h-3" />
      {renderedDate}
    </div>
  );
};

export default TaskDueDate;
