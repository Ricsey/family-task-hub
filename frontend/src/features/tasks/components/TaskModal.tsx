import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useTaskModal } from '../stores/taskModalStore';
import TaskForm from './TaskForm';

const TaskModal = () => {
  const { isOpen, closeModal } = useTaskModal();

  const handleOpenChange = (open: boolean) => {
    if (!open) closeModal();
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            <ModalTitle />
          </DialogTitle>
        </DialogHeader>
        <TaskForm />
      </DialogContent>
    </Dialog>
  );
};

export default TaskModal;

const ModalTitle = () => {
  const { mode } = useTaskModal();
  return mode === 'edit' ? 'Edit Task' : 'Create Task';
};
