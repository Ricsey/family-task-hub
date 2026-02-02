import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

const EmptyTasks = ({ onReset }: { onReset: () => void }) => {
  return (
    <Card className="p-8 text-center">
      <p className="text-muted-foreground text-xl">
        No task found matching your filters.
      </p>
      <Button variant="link" onClick={onReset}>
        Clear all filters
      </Button>
    </Card>
  );
};

export default EmptyTasks;
