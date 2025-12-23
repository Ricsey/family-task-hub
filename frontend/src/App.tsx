import { Route, Routes } from 'react-router';
import './App.css';
import Navbar from './components/Navbar';
import TasksPage from './pages/TasksPage';

function App() {
  // return <TasksPage />;
  return (
    <div>
      <Navbar />
      <main>
        <Routes>
          <Route path="/tasks" element={<TasksPage />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
