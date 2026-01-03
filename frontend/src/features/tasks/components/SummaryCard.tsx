import { useCategories } from '@/common/hooks/useCategories';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { getCategoryColor } from '../config/categories';


const SummaryCard = () => {
  const { data: categories } = useCategories();

  return (
    <Card className="p-4">
      <p className="text-xl font-semibold mb-4">Tasks by category</p>
      <div className="space-y-3">
        {categories?.map((category) => (
          <div key={category} className="flex items-center gap-3">
            <div
              className={`w-3 h-3 rounded-full shrink-0 ${
                getCategoryColor(category).full
              }`}
            />
            <span className="text-sm text-stone-700 min-w-20">
              {category}
            </span>
            <Progress
              value={60} // Placeholder value
              className={`flex-1 h-6 bg-stone-100 ${getCategoryColor(category).progress}`}
            />
            <span className="text-sm font-medium text-stone-600 min-w-6 text-right">
              {6} {/* Placeholder value */}
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default SummaryCard;
