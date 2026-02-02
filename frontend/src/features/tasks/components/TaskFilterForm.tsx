import { useCategories } from '@/common/hooks/useCategories';
import { useMembers } from '@/common/hooks/useMembers';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Filter, SortAsc, User } from 'lucide-react';
import { memo } from 'react';
import type { Filters } from '../hooks/useFilterTasks';
import SearchField from './SearchField';

interface TaskFilterFormProps {
  filters: Filters;
  isDirty: boolean;
  onSelectCategory: (category: string) => void;
  onSelectAssignee: (assignee: string) => void;
  onSelectSortBy: (sortBy: 'dueDate' | 'title') => void;
  onSearchChanged: (value: string) => void;
  onResetFilter: () => void;
}

const TaskFilterForm = memo(
  ({
    filters,
    isDirty,
    onSelectCategory,
    onSelectAssignee,
    onSelectSortBy,
    onSearchChanged,
    onResetFilter,
  }: TaskFilterFormProps) => {
    const { data: categories } = useCategories();
    const { data: members, isLoading } = useMembers();


    return (
      <div className="flex flex-col">
        <div className="flex flex-col lg:flex-row gap-4">
          <SearchField
            value={filters.searchQuery}
            onTextChange={onSearchChanged}
          />

          {/* Category filter */}
          <Select
            value={filters.category}
            onValueChange={(value) => onSelectCategory(value)}
          >
            <SelectTrigger className="w-full lg:w-45">
              <Filter className="w-4 h-4 mr-2 text-muted-foreground" />
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem key="all" value="all">
                All Categories
              </SelectItem>
              {categories?.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Assignee filter */}
          <Select
            value={filters.assignee}
            onValueChange={(value) => onSelectAssignee(value)}
          >
            <SelectTrigger className="w-full lg:w-45">
              <User className="w-4 h-4 mr-2 text-muted-foreground" />
              <SelectValue placeholder="Assignee" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem key="all" value="all">
                All Members
              </SelectItem>
              {members?.map((member) => (
                <SelectItem key={member.full_name} value={member.full_name}>
                  {member.full_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Sort by */}
          <Select value={filters.sortBy} onValueChange={onSelectSortBy}>
            <SelectTrigger className="w-full lg:w-40">
              <SortAsc className="w-4 h-4 mr-2 text-muted-foreground" />
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem key="dueDate" value="dueDate">
                Due Date (Ascending)
              </SelectItem>
              <SelectItem key="title" value="title">
                Title
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          {isDirty && (
            <Button
              variant='link'
              className='w-full mt-4'
              onClick={onResetFilter}
            >
              Clear filters
            </Button>
          )}
        </div>
      </div>
    );
  }
);

export default TaskFilterForm;
