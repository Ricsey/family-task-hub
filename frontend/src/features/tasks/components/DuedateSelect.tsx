import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { useEffect, useState } from 'react';

interface DuedateSelectProps {
  date: Date;
  onDateChange: (date: Date) => void;
  id?: string;
}

const MOBILE_LANDSCAPE_BREAKPOINT = 1024;

const DuedateSelect = ({ date, onDateChange, id }: DuedateSelectProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < MOBILE_LANDSCAPE_BREAKPOINT);
    };

    let timeoutId: number | undefined;

    const handleResize = () => {
      if (timeoutId !== undefined) {
        clearTimeout(timeoutId);
      }
      timeoutId = window.setTimeout(() => {
        checkMobile();
      }, 150);
    };

    checkMobile();
    window.addEventListener('resize', handleResize);
    return () => {
      if (timeoutId !== undefined) {
        clearTimeout(timeoutId);
      }
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const handleDateSelect = (selectedDate: Date | undefined) => {
    if (selectedDate) {
      onDateChange(selectedDate);
      setIsOpen(false);
    }
  };

  const buttonContent = (
    <>
      <CalendarIcon className="mr-2 h-4 w-4 text-muted-foreground" />
      {format(date, 'PPP')}
    </>
  );

  // Mobile: Use Dialog
  if (isMobile) {
    return (
      <div className="space-y-2">
        <Button
          id={id}
          variant="outline"
          type="button"
          onClick={() => setIsOpen(true)}
        >
          {buttonContent}
        </Button>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogContent className="w-auto">
            <DialogHeader>
              <DialogTitle>Select Due Date</DialogTitle>
            </DialogHeader>
            <div className="flex justify-center">
              <Calendar
                mode="single"
                selected={date}
                onSelect={handleDateSelect}
                autoFocus
              />
            </div>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  // Desktop: Use Popover
  return (
    <div className="space-y-2">
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button id={id} variant="outline" type="button">
            {buttonContent}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={date}
            onSelect={handleDateSelect}
            autoFocus
          />
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default DuedateSelect;
