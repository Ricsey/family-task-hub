import { useCategories } from '@/common/hooks/useCategories';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Filter, SortAsc, User } from 'lucide-react';
import type { Filters } from '../hooks/useFilterTasks';
import SearchField from './SearchField';

interface TaskFilterFormProps {
  filters: Filters
  onSelectCategory: (category: string) => void;
  onSelectAssignee: (assignee: string) => void;
  onSelectSortBy: (sortBy: "dueDate" | "title") => void;
  onSearchChanged: (value: string) => void;
}

const TaskFilterForm = ({
  filters,
  onSelectCategory,
  onSelectAssignee,
  onSelectSortBy,
  onSearchChanged,
}: TaskFilterFormProps) => {
  const {data: categories} = useCategories()

  return (
    <div className="flex flex-col lg:flex-row gap-4">
      <SearchField value={filters.searchQuery} onTextChange={onSearchChanged} />

      {/* Category filter */}
      <Select
        value={filters.category}
        onValueChange={(value) => onSelectCategory(value)}
      >
        <SelectTrigger className="w-full lg:w-45">
          <Filter className="w-4 h-4 mr-2 text-stone-400" />
          <SelectValue placeholder="Category" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Categories</SelectItem>
          {categories?.map(category =>
            <SelectItem value={category}>{category}</SelectItem>
          )}
        </SelectContent>
      </Select>

      {/* Assignee filter */}
      <Select
        value={filters.assignee}
        onValueChange={(value) => onSelectAssignee(value)}
      >
        <SelectTrigger className="w-full lg:w-45">
          <User className="w-4 h-4 mr-2 text-stone-400" />
          <SelectValue placeholder="Assignee" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Members</SelectItem>
          <SelectItem value="Mom">Mom</SelectItem>
          <SelectItem value="Dad">Dad</SelectItem>
        </SelectContent>
      </Select>

      {/* Sort by */}
      <Select value={filters.sortBy} onValueChange={onSelectSortBy}>
        <SelectTrigger className="w-full lg:w-40">
          <SortAsc className="w-4 h-4 mr-2 text-stone-400" />
          <SelectValue placeholder="Sort by" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="dueDate">Due Date (Ascending)</SelectItem>
          <SelectItem value="title">Title</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};

export default TaskFilterForm;
