import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Calendar, MoreHorizontal, Pencil, Trash2 } from 'lucide-react';

const TaskCard = ({}) => {
  return (
    <Card className="p-4 border-l-4 bg-white hover:shadow-md transition-shadow duration-200">
      <div className="flex items-start gap-3">
        {/* Checkbox */}
        <Checkbox className="mt-1 border-stone-300 data-[state=checked]:bg-teal-600 data-[state=checked]:border-teal-600" />

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <h3 className={`font-medium text-stone-800`}>Task Title</h3>
              <p className="text-sm text-stone-500 mt-1 line-clamp-2">
                Task description goes here. It can be a bit longer to provide
                more details about the task.
              </p>
            </div>

            {/* Actions */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 shrink-0"
                >
                  <MoreHorizontal className="w-4 h-4 text-stone-500" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  <Pencil className="w-4 h-4 mr-2" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem className="text-red-600 focus:text-red-600">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Meta info */}
          <div className="flex items-center flex-wrap gap-2 mt-3 ">
            {/* Assignee */}
            <div className="flex items-center gap-1.5">
              <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium text-white bg-blue-500">
                AN
              </div>
              <span className="text-sm text-stone-600">Assignee Name</span>
            </div>

            {/* Category */}
            <Badge
              variant="secondary"
              className="text-xs"
              style={{
                backgroundColor: `red15`,
                color: 'red',
              }}
            >
              Category name
            </Badge>

            {/* Recurring
            {recurringLabel && (
              <Badge variant="outline" className="text-xs gap-1">
                <RefreshCw className="w-3 h-3" />
                {recurringLabel}
              </Badge>
            )} */}

            {/* Due Date */}
            <div
              className={`flex items-center gap-1 text-xs ml-auto text-stone-500`}
            >
              <Calendar className="w-3 h-3" />
              2025-12-31
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default TaskCard;
