import { useCallback, useEffect, useState } from 'react';
import { Route, Routes } from 'react-router';
import './App.css';
import Navbar from './components/Navbar';
import AddTask from './components/task/AddTask';
import type { Task } from './components/task/entities';
import { useTaskModal } from './hooks/tasks';
import TasksPage from './pages/TasksPage';
import apiClient from './services/apiClient';


function App() {
  const [tasks, setTasks] = useState<Task[]>([]);

  const { isOpen, openAddModal, closeModal } = useTaskModal();

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
  const handleAddTask = (task: Task) => {
    setTasks([task, ...tasks]);
  };

  const handleUpdateTask = useCallback((updatedTask: Task) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === updatedTask.id ? updatedTask : t))
    );
  }, []);

  const handleDeleteTask = useCallback((taskId: string) => {
    setTasks((prev) => prev.filter((task) => task.id !== taskId));
  }, []);

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
                onDeleteTask={handleDeleteTask}
              />
            }
          />
        </Routes>
      </main>
      <AddTask isOpen={isOpen} onClose={closeModal} onSave={handleAddTask} />
    </div>
  );
}

export default App;
