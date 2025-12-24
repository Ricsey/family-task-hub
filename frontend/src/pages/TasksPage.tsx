import type { Task } from '@/components/task/entities';
import TaskEditModal from '@/components/task/TaskEditModal';
import TaskFilterForm from '@/components/task/TaskFilterForm';
import TasksList from '@/components/task/TaskList';
import { filterTasks, sortTasks } from '@/components/task/utils';
import { Card } from '@/components/ui/card';
import { useTaskModal } from '@/hooks/tasks';
import { useState } from 'react';

interface TasksPageProps {
  tasks: Task[];
  onUpdateTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
}

const TasksPage = ({ tasks, onUpdateTask, onDeleteTask }: TasksPageProps) => {
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

  const { isOpen, editingTask, openEditModal, closeModal } = useTaskModal();

  const handleSaveEditedTask = (updatedTask: Task) => {
    onUpdateTask(updatedTask);
    closeModal();
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
        onDeleteTask={onDeleteTask}
      />

      {/* Modal for editing a task */}
      <TaskEditModal
        isOpen={isOpen}
        task={editingTask}
        onClose={closeModal}
        onSave={handleSaveEditedTask}
      />
    </div>
  );
};

export default TasksPage;
