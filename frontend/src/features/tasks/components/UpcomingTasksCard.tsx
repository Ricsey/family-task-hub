import { Card } from '@/components/ui/card';
import { Calendar } from 'lucide-react';
import { useUpcomingTasks } from '../hooks/useTasks';
import TaskCard from './TaskCard';

const UpcomingTasksCard = () => {
  const { data: upcomingTasks, isLoading } = useUpcomingTasks();

  if (isLoading) return <Card className="p-4">Loading...</Card>;

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-4">
        <p className="text-xl font-semibold">Upcoming Tasks</p>
        <Calendar className="w-5 h-5 text-muted-foreground" />
      </div>

      {upcomingTasks && upcomingTasks.length > 0 ? (
        <div className="space-y-3">
          {upcomingTasks.map((task) => (
            <TaskCard key={task.id} task={task} />
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-muted-foreground">
          <Calendar className="w-12 h-12 mx-auto mb-2 text-muted-foreground/50" />
          <p className="text-sm">No upcoming tasks in the next 7 days</p>
        </div>
      )}
    </Card>
  );
};

export default UpcomingTasksCard;
