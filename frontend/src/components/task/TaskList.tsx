import type { Task } from '@/components/task/entities';
import TaskCard from '@/components/task/TaskCard';

interface TasksListProps {
  tasks: Task[];
}

const TasksList = ({ tasks }: TasksListProps) => {
  return (
    <div className="space-y-3">
      {tasks.map((task) => (
        <div className="space-y-3">
          <TaskCard key={task.id} task={task} />
        </div>
      ))}
    </div>
  );
};

export default TasksList;
