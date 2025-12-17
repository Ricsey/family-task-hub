import './App.css';
import type { Task } from './components/task/entities';
import TasksList from './components/task/TaskList';

const exampleTasks: Task[] = [
  {
    id: '1',
    title: 'Vacuum living room',
    description: 'Vacuum carpet and under furniture',
    assignee: 'Mom',
    category: 'Chores',
    dueDate: '2025-12-11T00:00:00Z',
    status: 'in-progress',
  },
  {
    id: '2',
    title: 'Clean the kitchen',
    description: 'Wipe counters, do dishes, mop floor',
    assignee: 'Mom',
    category: 'Chores',
    dueDate: '2025-12-16T00:00:00Z',
    status: 'completed',
  },
  {
    id: '3',
    title: 'Take out trash',
    description: 'Empty all bins and take to curb',
    assignee: 'Dad',
    category: 'Chores',
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
  // return <TaskCard task={exampleTasks[0]} />;
  return <TasksList tasks={exampleTasks} />;
}

export default App;
