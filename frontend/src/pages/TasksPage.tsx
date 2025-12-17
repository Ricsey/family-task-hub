import type { Task } from '@/components/task/entities';
import TaskEditModal from '@/components/task/TaskEditModal';
import TaskFilterForm from '@/components/task/TaskFilterForm';
import TasksList from '@/components/task/TaskList';
import { filterTasks, sortTasks } from '@/components/task/utils';
import { Card } from '@/components/ui/card';
import { useTaskModal } from '@/hooks/tasks';
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

  const handleToggleTaskStatus = (taskId: string) => {
    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task.id === taskId
          ? {
              ...task,
              status: task.status === 'completed' ? 'in-progress' : 'completed',
            }
          : task
      )
    );
  };

  const { isOpen, editingTask, openAddModal, openEditModal, closeModal } =
    useTaskModal();
  const handleUpdateTask = (updatedTask: Task) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === updatedTask.id ? updatedTask : t))
    );
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
        onEditTask={openEditModal}
      />

      {/* Modal for editing a task */}
      <TaskEditModal
        isOpen={isOpen}
        task={editingTask}
        onClose={closeModal}
        onSave={handleUpdateTask}
      />
    </div>
  );
};

export default TasksPage;
