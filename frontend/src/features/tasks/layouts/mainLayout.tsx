// layouts/MainLayout.tsx
import Navbar from '@/components/Navbar';
import TaskModal from '@/features/tasks/components/TaskModal';
import { Outlet } from 'react-router';

const MainLayout = () => {

  return (
    <div className="min-h-screen bg-stone-50">
      <Navbar />

      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <Outlet />
      </main>

      <TaskModal />
    </div>
  );
};

export default MainLayout;
