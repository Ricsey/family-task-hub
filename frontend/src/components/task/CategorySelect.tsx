import { Label } from '@/components/ui/label';
import useCategory from '@/hooks/useCategory';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';

interface CategoryEditProps {
  selectedCategory?: string;
  onCategoryChange: (value: string) => void;
}

const CategorySelect = ({
  selectedCategory,
  onCategoryChange,
}: CategoryEditProps) => {
  const { categories } = useCategory();

  return (
    <div className="space-y-2">
      <Label>Category *</Label>
      <Select
        // value={formData.category}
        value={selectedCategory}
        onValueChange={onCategoryChange}
      >
        <SelectTrigger>
          <SelectValue placeholder="Select category" />
        </SelectTrigger>
        <SelectContent>
          {categories.map((cat) => (
            <SelectItem key={cat} value={cat}>
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: '#0D9488' }} // TODO: rotate colors
                />
                {cat}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default CategorySelect;
