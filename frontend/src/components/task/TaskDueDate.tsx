import { isPast, isToday, parseISO } from 'date-fns';
import { Calendar } from 'lucide-react';
import { formatDueDate } from './utils';

interface TaskDueDateProps {
  dueDate: string;
  isDone: boolean;
}

const TaskDueDate = ({ dueDate, isDone }: TaskDueDateProps) => {
  const dueDateISO = parseISO(dueDate);
  const isOverDue = isPast(dueDateISO) && !isToday(dueDateISO) && !isDone;
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
