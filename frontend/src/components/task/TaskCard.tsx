import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { getCategoryColors } from './categoryColors';
import { type Task } from './entities';
import TaskActions from './TaskActions';
import TaskAssignee from './TaskAssignee';
import TaskCategory from './TaskCategory';
import TaskDueDate from './TaskDueDate';

interface TaskCardProps {
  task: Task;
  onToggleStatus: () => void;
}

const TaskCard = ({ task, onToggleStatus }: TaskCardProps) => {
  const categoryColors = getCategoryColors(task.category);

  const isDone = task.status === 'completed';

  return (
    <Card
      className={`p-4 border-l-4 ${
        categoryColors.border
      } bg-white hover:shadow-md transition-shadow duration-200 ${
        isDone ? 'opacity-60' : ''
      }`}
    >
      <div className="flex items-start gap-3">
        {/* Checkbox */}
        <Checkbox
          className="mt-1 border-stone-300 data-[state=checked]:bg-teal-600 data-[state=checked]:border-teal-600"
          checked={isDone}
          onCheckedChange={onToggleStatus}
        />

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <h3
                className={`font-medium ${
                  isDone ? 'text-stone-500 line-through' : 'text-stone-800'
                }`}
              >
                {task.title}
              </h3>
              <p className="text-sm text-stone-500 mt-1 line-clamp-2">
                {task.description}
              </p>
            </div>

            {/* Actions */}
            <TaskActions />
          </div>

          {/* Meta info */}
          <div className="flex items-center flex-wrap gap-2 mt-3 ">
            <TaskAssignee name={task.assignee} />
            <TaskCategory categoryName={task.category} />

            {/* Recurring
            {recurringLabel && (
              <Badge variant="outline" className="text-xs gap-1">
                <RefreshCw className="w-3 h-3" />
                {recurringLabel}
              </Badge>
            )} */}

            {task.dueDate && (
              <TaskDueDate dueDate={task.dueDate} isDone={isDone} />
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};

export default TaskCard;
