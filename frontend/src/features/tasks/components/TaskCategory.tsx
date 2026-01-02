import { Badge } from '@/components/ui/badge';
import { getCategoryColor } from '../config/categories';

interface TaskCategoryProps {
  categoryName: string;
}

const TaskCategory = ({ categoryName }: TaskCategoryProps) => {
  const color = getCategoryColor(categoryName)
  return (
    <Badge
      variant="secondary"
      className={`text-xs ${color.text} ${color.bg} font-semibold`}
    >
      {categoryName}
    </Badge>
  );
};

export default TaskCategory;
