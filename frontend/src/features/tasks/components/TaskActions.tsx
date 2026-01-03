import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import { useDeleteTask } from '../hooks/useTasks';
import { useTaskModal } from '../stores/taskModalStore';
import type { Task } from '../types';

interface TaskActionsProps {
  task: Task;
  // onDelete: (taskId: string) => void;
}

const TaskActions = ({
  task,
  // onDelete
}: TaskActionsProps) => {
  const {openEditModal} = useTaskModal()
  const {mutate: deleteTask} = useDeleteTask()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
          <MoreHorizontal className="w-4 h-4 text-stone-500" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
        onClick={() => openEditModal(task)}
        >
          <Pencil className="w-4 h-4 mr-2" />
          Edit
        </DropdownMenuItem>
        <DropdownMenuItem
          // onClick={() => onDelete(task.id)}
          onClick={() => {
            // "Are you sure?" confirmation
            if (confirm("Are you sure you want to delete this task?")) {
              deleteTask(task.id)
            }
          }}
          className="text-red-600 focus:text-red-600"
        >
          <Trash2 className="w-4 h-4 mr-2 text-red-600" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default TaskActions;
