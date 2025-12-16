import './App.css';
import type { Task } from './components/task/entities';
import TaskCard from './components/task/TaskCard';

const exampleTask: Task = {
  id: '1',
  title: 'Finish the project report',
  description:
    'Complete the final report for the project and submit it to the manager.',
  assignee: 'Allili Hamid Richard',
  category: 'Personal',
  dueDate: '2025-12-11T00:00:00Z',
  // status: 'in-progress',
  status: 'completed',
};

function App() {
  return <TaskCard task={exampleTask} />;
}

export default App;
