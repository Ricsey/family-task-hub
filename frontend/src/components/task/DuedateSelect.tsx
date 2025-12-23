import { format, parseISO } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { Button } from '../ui/button';
import { Calendar } from '../ui/calendar';
import { Label } from '../ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';

interface DuedateSelectProps {
  isCalendarOpen: boolean;
  onOpenChange: (open: boolean) => void;
  date?: string;
  onDateChange: (date: string) => void;
}

const DuedateSelect = ({
  isCalendarOpen,
  onOpenChange,
  date,
  onDateChange,
}: DuedateSelectProps) => {
  const handleSelect = (selectedDate: Date | undefined) => {
    if (!selectedDate) return;

    const formatted = format(selectedDate, 'yyyy-MM-dd');

    onDateChange(formatted);
    onOpenChange(false);
  };

  return (
    <div className="space-y-2">
      <Label>Due date *</Label>
      <Popover open={isCalendarOpen} onOpenChange={onOpenChange}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            // className="w-full justify-start text-left font-normal"
          >
            <CalendarIcon className="mr-2 h-4 w-4 text-stone-400" />
            {date ? format(parseISO(date), 'PPP') : 'Pick a date'}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={date ? parseISO(date) : undefined}
            onSelect={handleSelect}
            autoFocus
          />
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default DuedateSelect;
