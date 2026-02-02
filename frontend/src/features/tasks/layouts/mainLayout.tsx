// layouts/MainLayout.tsx
import ToastProvider from '@/common/providers/toastProvider';
import Navbar from '@/components/Navbar';
import TaskModal from '@/features/tasks/components/TaskModal';
import { Outlet } from 'react-router';

const MainLayout = () => {

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <Outlet />
      </main>

      <TaskModal />
      <ToastProvider />
    </div>
  );
};

export default MainLayout;
