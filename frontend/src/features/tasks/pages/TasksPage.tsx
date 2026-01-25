import { Card } from '@/components/ui/card';
import { useCallback, useDeferredValue, useState } from 'react';
import EmptyTasks from '../components/EmptyTasks';
import TaskFilterForm from '../components/TaskFilterForm';
import TasksGrid from '../components/TasksGrid';
import {
  INITIAL_FILTERS,
  useFilterTasks,
  type Filters,
} from '../hooks/useFilterTasks';
import { useTasks } from '../hooks/useTasks';

const TasksPage = () => {
  const { data: tasks } = useTasks();
  const [filters, setFilters] = useState<Filters>(INITIAL_FILTERS);

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

  const handleFilterReset = useCallback(() => setFilters(INITIAL_FILTERS), []);

  const { filteredTasks, isDirty } = useFilterTasks(
    tasks ?? [],
    deferredFilters
  );

  if (!tasks) return null;

  return (
    <div>
      <Card className="p-4 mb-8">
        <TaskFilterForm
          filters={filters}
          isDirty={isDirty}
          onSearchChanged={handleSearchChange}
          onSelectAssignee={handleAssigneeChange}
          onSelectCategory={handleCategoryChange}
          onSelectSortBy={handleSortChange}
          onResetFilter={handleFilterReset}
        />
      </Card>
      {filteredTasks.length > 0 ? (
        <TasksGrid tasks={filteredTasks} />
      ) : (
        <EmptyTasks onReset={handleFilterReset} />
      )}
    </div>
  );
};

export default TasksPage;
