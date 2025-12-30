import { Navigate, Route, Routes } from 'react-router';
import './App.css';
import MainLayout from './features/tasks/layouts/mainLayout';


function App() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route index element={<Navigate to="/tasks" replace />} />
        <Route path="tasks" element={<div>Tasks - Coming Soon</div>} />
        <Route path="calendar" element={<div>Calendar - Coming Soon</div>} />
      </Route>
      <Route path="*" element={<div>404 - Not Found</div>} />
    </Routes>
  )
}

export default App;
