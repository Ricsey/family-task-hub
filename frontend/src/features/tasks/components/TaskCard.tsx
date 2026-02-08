import { useMembers } from '@/common/hooks/useMembers';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { memo } from 'react';
import { getCategoryColor } from '../config/categories';
import { useToggleTaskStatus } from '../hooks/useTasks';
import type { Task } from '../types';
import TaskActions from './TaskActions';
import TaskAssignee from './TaskAssignee';
import TaskCategory from './TaskCategory';
import TaskDueDate from './TaskDueDate';

interface TaskCardProps {
  task: Task;
}

const TaskCard = memo(({ task }: TaskCardProps) => {
    const isDone = task.status === 'completed';
    const { mutate: toggleStatus } = useToggleTaskStatus();
    const { data: members } = useMembers();
    const handleToggle = () => toggleStatus(task);

    const assignee = task.assignee_id
      ? members?.find(member => member.id === task.assignee_id)
      : null;

    return (
      <Card
        className={`p-4 border-l-4 ${getCategoryColor(task.category).border}
      } bg-card hover:shadow-md transition-shadow duration-200 ${
        isDone ? 'opacity-60' : ''
      }`}
      >
        <div className="flex items-start gap-3">
          {/* Checkbox */}
          <Checkbox
            className="mt-1 border-border data-[state=checked]:bg-teal-600 data-[state=checked]:border-teal-600"
            checked={isDone}
            onCheckedChange={handleToggle}
          />

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1">
                <h3
                  className={`font-medium ${
                    isDone ? 'text-muted-foreground line-through' : 'text-card-foreground'
                  }`}
                >
                  {task.title}
                </h3>
                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                  {task.description}
                </p>
              </div>

              {/* Actions */}
              <TaskActions
                task={task}
                // onEdit={onEdit} onDelete={onDelete}
              />
            </div>

            {/* Meta info */}
            <div className="flex items-center flex-wrap gap-2 mt-3 ">
              {assignee && <TaskAssignee assignee={assignee} />}
              <TaskCategory categoryName={task.category} />

              {/* Recurring
            {recurringLabel && (
              <Badge variant="outline" className="text-xs gap-1">
                <RefreshCw className="w-3 h-3" />
                {recurringLabel}
              </Badge>
            )} */}

              {task.due_date && (
                <TaskDueDate dueDate={task.due_date} isDone={isDone} />
              )}
            </div>
          </div>
        </div>
      </Card>
    );
  }
);

export default TaskCard;
