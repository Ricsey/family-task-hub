import { Card } from '@/components/ui/card';
import { useState } from 'react';
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


  if (!tasks) return null; //TODO: Empty card with clear filters

  const handleSearchChange = (value: string) => setFilters({ ...filters, searchQuery: value });
  const handleCategoryChange = (value: string) => setFilters({ ...filters, category: value });
  const handleAssigneeChange = (value: string) => setFilters({ ...filters, assignee: value });
  const handleSortChange = (value: 'dueDate' | 'title') => setFilters({ ...filters, sortBy: value });

  const filteredTasks = useFilterTasks(tasks, filters);

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
