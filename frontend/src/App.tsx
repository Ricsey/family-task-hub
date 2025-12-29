import { useCallback, useEffect, useState } from 'react';
import { Route, Routes } from 'react-router';
import './App.css';
import Navbar from './components/Navbar';
import TaskModal from './components/task/TaskModal';
import type { Task } from './components/task/entities';
import { useTaskModal } from './hooks/tasks';
import TasksPage from './pages/TasksPage';
import apiClient from './services/apiClient';


function App() {
  const [tasks, setTasks] = useState<Task[]>([]);

  const { isOpen, editingTask, openAddModal, openEditModal, closeModal } = useTaskModal();

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await apiClient.get<Task[]>('/task');

        const transformedTasks: Task[] = response.data.map(task => ({
        ...task,
        dueDate: new Date(task.due_date)
      }));

        setTasks(transformedTasks);
      } catch (error) {
        console.error('Failed to get tasks: ', error);
        //TODO: show it in toast.
      }
    };

    fetchTasks();
  }, []);

  // Handlers

  const handleUpdateTask = useCallback((updatedTask: Task) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === updatedTask.id ? updatedTask : t))
    );
  }, []);

  const handleDeleteTask = useCallback(async (taskId: string) => {
    try {
      await apiClient.delete(`/task/${taskId}`)
      setTasks((prev) => prev.filter((task) => task.id !== taskId));
    } catch (error) {
      console.error("Failed to delete task:", error);
      //TODO: Show in toast
    }
  }, []);

  const handleSaveTask = (savedTask: Task) => {
    setTasks((prev) => {
      const exists = prev.find(t => t.id === savedTask.id);
      if (exists) return prev.map(t => t.id === savedTask.id ? savedTask : t);
      return [savedTask, ...prev];
    });
  };


  return (
    <div>
      <Navbar onAddTask={openAddModal} />
      <main className="min-h-screen bg-stone-50">
        <Routes>
          <Route
            path="/tasks"
            element={
              <TasksPage
                tasks={tasks}
                onUpdateTask={handleUpdateTask}
                onEditTask={openEditModal}
                onDeleteTask={handleDeleteTask}
              />
            }
          />
        </Routes>
      </main>
      <TaskModal key={editingTask?.id || 'new'} isOpen={isOpen} onClose={closeModal} onSave={handleSaveTask} task={editingTask}/>
    </div>
  );
}

export default App;
