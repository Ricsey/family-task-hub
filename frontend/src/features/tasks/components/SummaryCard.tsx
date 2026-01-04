import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { getCategoryColor } from '../config/categories';
import { useTasksByCategory } from '../hooks/useTasks';


const SummaryCard = () => {
  const {data: stats} = useTasksByCategory();

  if(!stats) return null;

  return (
    <Card className="p-4">
      <p className="text-xl font-semibold mb-4">Tasks by category</p>
      <div className="space-y-3">
        {stats?.map(({category, count, percentage}) => (
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
              value={percentage}
              className={`flex-1 h-6 bg-stone-100 ${getCategoryColor(category).progress}`}
            />
            <span className="text-sm font-medium text-stone-600 min-w-6 text-right">
              {count}
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default SummaryCard;
