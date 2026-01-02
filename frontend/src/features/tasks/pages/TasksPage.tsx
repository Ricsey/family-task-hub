import { Card } from '@/components/ui/card';
import { useCallback, useDeferredValue, useState } from 'react';
import TaskFilterForm from '../components/TaskFilterForm';
import TasksGrid from '../components/TasksGrid';
import { useFilterTasks, type Filters } from '../hooks/useFilterTasks';
import { useTasks } from '../hooks/useTasks';

const TasksPage = () => {
  const { data: tasks } = useTasks();
  const [filters, setFilters] = useState<Filters>({
    searchQuery: '',
    category: 'all',
    assignee: 'all',
    sortBy: 'dueDate',
  });

  const deferredFilters = useDeferredValue(filters);

  const handleSearchChange = useCallback((value: string) => {
    setFilters((prev) => ({ ...prev, searchQuery: value }));
  }, []);

  const handleCategoryChange = useCallback((value: string) => {
    setFilters((prev) => ({ ...prev, category: value }));
  }, []);

  const handleAssigneeChange = useCallback((value: string) => {
    setFilters((prev) => ({ ...prev, assignee: value }));
  }, []);

  const handleSortChange = useCallback((value: 'dueDate' | 'title') => {
    setFilters((prev) => ({ ...prev, sortBy: value }));
  }, []);

  const filteredTasks = useFilterTasks(tasks ?? [], deferredFilters);

  if (!tasks) return null; //TODO: Empty card with clear filters

  return (
    <div>
      <Card className="p-4 mb-8">
        <TaskFilterForm
          filters={filters}
          onSearchChanged={handleSearchChange}
          onSelectAssignee={handleAssigneeChange}
          onSelectCategory={handleCategoryChange}
          onSelectSortBy={handleSortChange}
        />
      </Card>
      {tasks && <TasksGrid tasks={filteredTasks} />}
    </div>
  );
};

export default TasksPage;
