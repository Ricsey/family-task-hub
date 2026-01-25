import type { Task } from '@/components/task/entities';
import TaskFilterForm from '@/components/task/TaskFilterForm';
import TasksList from '@/components/task/TaskList';
import { filterTasks, sortTasks } from '@/components/task/utils';
import { Card } from '@/components/ui/card';
import { useState } from 'react';

interface TasksPageProps {
  tasks: Task[];
  onUpdateTask: (task: Task) => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
}

const TasksPage = ({ tasks, onUpdateTask, onEditTask, onDeleteTask }: TasksPageProps) => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedAssignee, setSelectedAssignee] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('dueDate');

  const clearFilters = () => {
    setSelectedCategory('all');
    setSelectedAssignee('all');
    setSortBy('dueDate');
    setSearchQuery('');
  };

  const filteredTasks = filterTasks(
    tasks,
    selectedCategory,
    selectedAssignee,
    searchQuery
  );
  const filteredAndSortedTasks = sortTasks(filteredTasks, sortBy);

  const handleToggleTaskStatus = (task: Task) => {
    const updatedTask: Task = {
      ...task,
      status: task.status === 'completed' ? 'in-progress' : 'completed',
    };
    onUpdateTask(updatedTask);
  };


  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold text-stone-800 mb-6">All Tasks</h1>
      <Card className="p-4 mb-6">
        <TaskFilterForm
          filterCategory={selectedCategory}
          filterAssignee={selectedAssignee}
          searchQuery={searchQuery}
          sortBy={sortBy}
          onSelectCategory={(category) => setSelectedCategory(category)}
          onSelectAssignee={(assignee) => setSelectedAssignee(assignee)}
          onSelectSortBy={(sortBy) => setSortBy(sortBy)}
          onSearchChanged={setSearchQuery}
        />
      </Card>
      <TasksList
        tasks={filteredAndSortedTasks}
        onClearFilters={clearFilters}
        onToggleTaskStatus={handleToggleTaskStatus}
        onEditTask={onEditTask}
        onDeleteTask={onDeleteTask}
      />
    </div>
  );
};

export default TasksPage;
