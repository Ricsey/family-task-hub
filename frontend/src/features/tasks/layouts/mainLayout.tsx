// layouts/MainLayout.tsx
import Navbar from '@/components/Navbar';
import TaskModal from '@/features/tasks/components/TaskModal';
import type { Task } from '@/features/tasks/types';
import { useState } from 'react';
import { Outlet } from 'react-router';

const MainLayout = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | undefined>();

  const handleSave = async (task: Task) => {
    // Itt hívhatunk egy globális re-fetch-et vagy state update-et
    setIsModalOpen(false);
    setEditingTask(undefined);
  };

  return (
    <div className="min-h-screen bg-stone-50">
      <Navbar onAddTask={() => setIsModalOpen(true)} />

      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <Outlet />
      </main>

      <TaskModal
        isOpen={isModalOpen}
        task={editingTask}
        onClose={() => {
          setIsModalOpen(false);
          setEditingTask(undefined);
        }}
        onSave={handleSave} //TODO: zustand global state management needed
      />
    </div>
  );
};

export default MainLayout;
