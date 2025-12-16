import { isPast, isToday, parseISO } from 'date-fns';
import { Calendar } from 'lucide-react';

interface TaskDueDateProps {
  dueDate: string;
  isDone: boolean;
}

const TaskDueDate = ({ dueDate, isDone }: TaskDueDateProps) => {
  const dueDateISO = parseISO(dueDate);
  const isOverDue = isPast(dueDateISO) && !isToday(dueDateISO) && !isDone;

  return (
    <div
      className={`flex items-center gap-1 text-xs ml-auto ${
        isOverDue ? 'text-red-600' : 'text-stone-500'
      }`}
    >
      <Calendar className="w-3 h-3" />
      {dueDateISO.toISOString().split('T')[0]}
    </div>
  );
};

export default TaskDueDate;
