import { create } from "zustand";
import type { Task } from "../types";

interface TaskModalStore {
  isOpen: boolean;
  mode: 'edit' | 'create';
  currentTask: Task | null;
  openCreateModal: () => void;
  openEditModal: (task: Task) => void;
  resetModal: () => void;
  closeModal: () => void;
}

export const useTaskModal = create<TaskModalStore>(
  set => ({
    // Initial state
    isOpen: false,
    mode: 'create',
    currentTask: null,

    // Actions
    openCreateModal: () => {
      set({
        isOpen: true,
        mode: 'create',
        currentTask: null,
      })
    },

    openEditModal: (task) => {
      set({
        isOpen: true,
        mode: 'edit',
        currentTask: task,
      })
    },

    resetModal: () => {
      set({
        isOpen: true,
        mode: 'create',
        currentTask: null,
      })
    },

    closeModal: () => {
      set({
        isOpen: false
      })
    }
  })
)
