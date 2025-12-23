import { Route, Routes } from 'react-router';
import './App.css';
import Navbar from './components/Navbar';
import TaskEditModal from './components/task/TaskEditModal';
import { useTaskModal } from './hooks/tasks';
import TasksPage from './pages/TasksPage';

function App() {
  const { isOpen, editingTask, openAddModal, openEditModal, closeModal } =
    useTaskModal();
  return (
    <div>
      <Navbar onAddTask={openAddModal} />
      <main className="min-h-screen bg-stone-50">
        <Routes>
          <Route path="/tasks" element={<TasksPage />} />
        </Routes>
      </main>
      <TaskEditModal />
    </div>
  );
}

export default App;
