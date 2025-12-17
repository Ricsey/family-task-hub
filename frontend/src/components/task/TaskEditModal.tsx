import { useEffect, useState } from 'react';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { Textarea } from '../ui/textarea';
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

  useEffect(() => {
    if (task) {
      setFormData(task);
    } else {
      setFormData({}); // Clear for 'Add' mode
    }
  }, [task, isOpen]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.title && task) {
      onSave({ ...task, ...formData } as Task);
      onClose();
    }
  };

  console.log(formData);

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

          {/* Assign to */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Assign to</Label>
              <Select
                value={formData.assignee || 'none'}
                onValueChange={
                  (val) =>
                    setFormData({
                      ...formData,
                      assignee: val === 'none' ? undefined : val,
                    }) // Because assignee is optional
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select member" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem key="none" value="none">
                    None
                  </SelectItem>
                  {/* Mom */}
                  <SelectItem key="Mom" value="Mom">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] text-white"
                        style={{ backgroundColor: '#0D9488' }}
                      >
                        M
                      </div>
                      Mom
                    </div>
                  </SelectItem>
                  {/* Dad */}
                  <SelectItem key="Dad" value="Dad">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] text-white"
                        style={{ backgroundColor: '#0D9488' }}
                      >
                        D
                      </div>
                      Dad
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Category */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Category *</Label>
              <Select
                value={formData.category}
                onValueChange={(val) =>
                  setFormData({
                    ...formData,
                    category: val as Task['category'],
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select member" />
                </SelectTrigger>
                <SelectContent>
                  {/* Chore */}
                  <SelectItem key="Chore" value="Chore">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: '#0D9488' }}
                      />
                      Chore
                    </div>
                  </SelectItem>
                  {/* Shopping */}
                  <SelectItem key="Shopping" value="Shopping">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full bg-blue-500"
                        // style={{ backgroundColor: '#0D9488' }}
                      />
                      Shopping
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
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
