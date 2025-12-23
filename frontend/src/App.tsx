import { Route, Routes } from 'react-router';
import './App.css';
import Navbar from './components/Navbar';
import TasksPage from './pages/TasksPage';

function App() {
  // return <TasksPage />;
  return (
    <div>
      <Navbar />
      <main className="min-h-screen bg-stone-50">
        <Routes>
          <Route path="/tasks" element={<TasksPage />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
