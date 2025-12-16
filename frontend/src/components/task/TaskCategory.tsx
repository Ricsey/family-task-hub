import { Badge } from '@/components/ui/badge';
import { getCategoryColors } from './categoryColors';

interface TaskCategoryProps {
  categoryName: string;
}

const TaskCategory = ({ categoryName }: TaskCategoryProps) => {
  const categoryColor = getCategoryColors(categoryName);
  return (
    <Badge
      variant="secondary"
      className={`text-xs ${categoryColor.background} ${categoryColor.text} font-semibold`}
    >
      {categoryName}
    </Badge>
  );
};

export default TaskCategory;
