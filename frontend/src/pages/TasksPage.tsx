import type { Task } from '@/components/task/entities';
import TaskFilterForm from '@/components/task/TaskFilterForm';
import TasksList from '@/components/task/TaskList';
import { Card } from '@/components/ui/card';
import { useState } from 'react';

const TasksPage = () => {
  const [tasks, setTasks] = useState<Task[]>([
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
  ]);
  const [selectedCategory, setSelectedCategory] = useState('');

  const filteredTasks =
    selectedCategory && selectedCategory !== 'all'
      ? tasks.filter((task) => task.category === selectedCategory)
      : tasks;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold text-stone-800 mb-6">All Tasks</h1>
      <Card className="p-4 mb-6">
        <TaskFilterForm
          onSelectCategory={(category) => setSelectedCategory(category)}
        />
      </Card>
      <TasksList tasks={filteredTasks} />
    </div>
  );
};

export default TasksPage;
