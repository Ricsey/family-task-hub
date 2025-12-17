import { Filter, Search, SortAsc, User } from 'lucide-react';
import { Input } from '../ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';

interface TaskFilterFormProps {
  filterCategory: string;
  filterAssignee: string;
  sortBy: string;
  onSelectCategory: (category: string) => void;
  onSelectAssignee: (assignee: string) => void;
  onSelectSortBy: (sortBy: string) => void;
}

const TaskFilterForm = ({
  filterCategory,
  filterAssignee,
  sortBy,
  onSelectCategory,
  onSelectAssignee,
  onSelectSortBy,
}: TaskFilterFormProps) => {
  return (
    <div className="flex flex-col lg:flex-row gap-4">
      {/* Search field */}
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
        <Input placeholder="Search..." className="pl-10" />
      </div>

      {/* Category filter */}
      <Select
        value={filterCategory}
        onValueChange={(value) => onSelectCategory(value)}
      >
        <SelectTrigger className="w-full lg:w-45">
          <Filter className="w-4 h-4 mr-2 text-stone-400" />
          <SelectValue placeholder="Category" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Categories</SelectItem>
          <SelectItem value="Homework">Homework</SelectItem>
          <SelectItem value="Chore">Chore</SelectItem>
          <SelectItem value="Other">Other</SelectItem>
        </SelectContent>
      </Select>

      {/* Assignee filter */}
      <Select
        value={filterAssignee}
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
      <Select value={sortBy} onValueChange={onSelectSortBy}>
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
