import type { Task } from '@/components/task/entities';
import { useCallback, useState } from 'react';

export function useTaskModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task>();

  const openAddModal = useCallback(() => {
    setEditingTask(undefined);
    setIsOpen(true);
  }, []);

  const openTaskModal = useCallback((task: Task) => {
    setEditingTask(task);
    setIsOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsOpen(false);
    setEditingTask(undefined);
  }, []);

  return {
    isOpen,
    editingTask,
    openAddModal,
    openEditModal: openTaskModal,
    closeModal,
  };
}
