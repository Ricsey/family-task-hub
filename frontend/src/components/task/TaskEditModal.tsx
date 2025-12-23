import { format } from 'date-fns';
import { useEffect, useState } from 'react';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import AssigneeSelect from './AssigneeSelect';
import CategorySelect from './CategorySelect';
import DuedateSelect from './DuedateSelect';
import type { Task } from './entities';

interface TaskEditModalProps {
  isOpen: boolean;
  task: Task | null;
  onClose: () => void;
  onSave: (task: Task) => void;
}

const TaskEditModal = ({
  isOpen,
  task,
  onClose,
  onSave,
}: TaskEditModalProps) => {
  const [formData, setFormData] = useState<Partial<Task>>({});
  const [calendarOpen, setCalendarOpen] = useState(false);

  useEffect(() => {
    if (task) {
      setFormData(task);
    } else {
      setFormData({}); // Clear for 'Add' mode
    }
  }, [task, isOpen]); // TODO: why do we need isOpen dependency?

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.title && task) {
      onSave({ ...task, ...formData } as Task);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Task</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSave} className="space-y-5 mt-4">
          <div className="space-y-2">
            <Label htmlFor="title">Task Title *</Label>
            <Input
              id="title"
              value={formData.title || ''}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              placeholder="Enter task title"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description || ''}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Add more details..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4 items-start">
            <AssigneeSelect
              selectedMember={formData.assignee}
              onAssigneeChange={
                (val) =>
                  setFormData({
                    ...formData,
                    assignee: val === 'none' ? undefined : val,
                  }) // Because assignee is optional
              }
            />
            <DuedateSelect
              isCalendarOpen={calendarOpen}
              onOpenChange={setCalendarOpen}
              date={formData.dueDate}
              onDateChange={(date) => {
                if (!date) return;
                setFormData({
                  ...formData,
                  dueDate: format(date, 'yyyy-MM-dd'),
                });
                setCalendarOpen(false);
              }}
            />
            <CategorySelect
              selectedCategory={formData.category}
              onCategoryChange={(value) =>
                setFormData({
                  ...formData,
                  category: value as Task['category'],
                })
              }
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-teal-600 hover:bg-teal-700 text-white"
            >
              Save Changes
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default TaskEditModal;
