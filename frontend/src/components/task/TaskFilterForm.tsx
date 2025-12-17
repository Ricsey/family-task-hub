import { Filter, Search } from 'lucide-react';
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
  onSelectCategory: (category: string) => void;
}

const TaskFilterForm = ({
  filterCategory,
  onSelectCategory,
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
        <SelectTrigger className="w-full lg:w-40">
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
    </div>
  );
};

export default TaskFilterForm;
