import { Route, Routes } from 'react-router';
import './App.css';
import TasksPage from './pages/TasksPage';

function App() {
  // return <TasksPage />;
  return (
    <div>
      <div>Navbar</div>
      <main>
        <Routes>
          <Route path="/tasks" element={<TasksPage />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
