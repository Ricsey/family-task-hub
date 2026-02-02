import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

interface SearchBarProps {
  value: string;
  onTextChange: (text: string) => void;
}

const SearchField = ({ value, onTextChange }: SearchBarProps) => {
  return (
    <div className="relative flex-1">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
      <Input
        placeholder="Search..."
        className="pl-10"
        value={value}
        onChange={(e) => onTextChange(e.target.value)}
      />
    </div>
  );
};

export default SearchField;
