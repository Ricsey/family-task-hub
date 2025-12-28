import { useCallback, useEffect, useState } from 'react';
import { Route, Routes } from 'react-router';
import './App.css';
import Navbar from './components/Navbar';
import AddTask from './components/task/AddTask';
import type { Task } from './components/task/entities';
import { useTaskModal } from './hooks/tasks';
import TasksPage from './pages/TasksPage';
import apiClient from './services/apiClient';

const DUMMY_TASKS: Task[] = [
  {
    id: '1',
    title: 'Vacuum living room',
    description: 'Vacuum carpet and under furniture',
    assignee: 'Mom',
    category: 'Chore',
    dueDate: '2025-12-11T00:00:00Z',
    status: 'in-progress',
  },
  {
    id: '2',
    title: 'Clean the kitchen',
    description: 'Wipe counters, do dishes, mop floor',
    assignee: 'Mom',
    category: 'Chore',
    dueDate: '2025-12-16T00:00:00Z',
    status: 'completed',
  },
  {
    id: '3',
    title: 'Take out trash',
    description: 'Empty all bins and take to curb',
    assignee: 'Dad',
    category: 'Chore',
    dueDate: '2025-12-16T00:00:00Z',
    status: 'in-progress',
  },
  {
    id: '4',
    title: 'Fix garage door',
    description: 'The hinge needs adjustment',
    assignee: 'Dad',
    category: 'Other',
    dueDate: '2025-12-19T00:00:00Z',
    status: 'in-progress',
  },
];

function App() {
  const [tasks, setTasks] = useState<Task[]>(DUMMY_TASKS);

  const { isOpen, openAddModal, closeModal } = useTaskModal();

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await apiClient.get<Task[]>('/task');
        setTasks(response.data);
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
