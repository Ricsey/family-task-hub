import type { Task } from '@/components/task/entities';
import TasksList from '@/components/task/TaskList';

interface TaskListProps {
  tasks: Task[];
}

const TaskList = ({ tasks }: TaskListProps) => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold text-stone-800 mb-6">All Tasks</h1>
      <TasksList tasks={tasks} />
    </div>
  );
};

export default TaskList;
