import { useCategories } from '@/common/hooks/useCategories';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { getCategoryColor } from '../config/categories';

interface CategoryEditProps {
  selectedCategory?: string;
  onCategoryChange: (value: string) => void;
  id?: string;
}

const CategorySelect = ({
  selectedCategory,
  onCategoryChange,
  id,
}: CategoryEditProps) => {
  const { data: categories } = useCategories();

  return (
    <Select value={selectedCategory} onValueChange={onCategoryChange}>
      <SelectTrigger id={id}>
        <SelectValue placeholder="Select category" />
      </SelectTrigger>
      <SelectContent>
        {categories?.map((cat) => (
          <SelectItem key={cat} value={cat}>
            <div className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: getCategoryColor(cat) }}
              />
              {cat}
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default CategorySelect;
