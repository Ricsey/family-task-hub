import type { Task } from '@/components/task/entities';
import TaskCard from '@/components/task/TaskCard';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface TasksListProps {
  tasks: Task[];
  onClearFilters: () => void;
  onToggleTaskStatus: (task: Task) => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
}

const TasksList = ({
  tasks,
  onClearFilters,
  onToggleTaskStatus,
  onEditTask,
  onDeleteTask,
}: TasksListProps) => {
  if (tasks.length === 0) {
    return (
      <Card className="p-12 bg-white text-center">
        <p className="text-stone-500">No tasks found matching your filters.</p>
        <Button
          variant="link"
          onClick={onClearFilters}
          className="mt-2 text-teal-600"
        >
          Clear all filters
        </Button>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {tasks.map((task) => (
        <div className="space-y-3" key={task.id}>
          <TaskCard
            task={task}
            onToggleStatus={() => onToggleTaskStatus(task)}
            onEdit={onEditTask}
            onDelete={onDeleteTask}
          />
        </div>
      ))}
    </div>
  );
};

export default TasksList;
