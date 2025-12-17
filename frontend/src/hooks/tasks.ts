import type { Task } from '@/components/task/entities';
import { useCallback, useState } from 'react';

export function useTaskModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const openAddModal = useCallback(() => {
    setEditingTask(null);
    setIsOpen(true);
  }, []);

  const openEditModal = useCallback((task: Task) => {
    setEditingTask(task);
    setIsOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsOpen(false);
    setEditingTask(null);
  }, []);

  return {
    isOpen,
    editingTask,
    openAddModal,
    openEditModal,
    closeModal,
  };
}
