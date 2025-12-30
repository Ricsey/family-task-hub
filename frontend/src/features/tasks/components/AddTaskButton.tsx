import { Button } from '@/components/ui/button';
import { PlusIcon } from 'lucide-react';
import { useTaskModal } from '../stores/taskStore';

const AddTaskButton = () => {
  const open = useTaskModal(s => s.open)
  return (
    <Button className="bg-teal-600 hover:bg-teal-700" onClick={open}>
      <PlusIcon />
      <span className="hidden sm:inline">Add Task</span>
    </Button>
  );
};

export default AddTaskButton;
