import { useCreateTask } from '../hooks/useTasks';
import { useTaskModal } from '../stores/taskStore';
import { TaskModal } from './TaskModal';

const TaskModalController = () => {
  const {} = useTaskModal();
  const {} = useCreateTask();

  return (
    <TaskModal />
  )
}

export default TaskModalController
