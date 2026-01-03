import { Navigate, Route, Routes } from 'react-router';
import './App.css';
import MainLayout from './features/tasks/layouts/mainLayout';
import TasksDashboard from './features/tasks/pages/TasksDashboard';
import TasksPage from './features/tasks/pages/TasksPage';


function App() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route index element={<Navigate to="/tasks" replace />} />
        <Route path="tasks" element={<TasksPage />} />
        <Route path="calendar" element={<div>Calendar - Coming Soon</div>} />
        <Route path="dashboard" element={<TasksDashboard />} />
      </Route>
      <Route path="*" element={<div>404 - Not Found</div>} />
    </Routes>
  )
}

export default App;
