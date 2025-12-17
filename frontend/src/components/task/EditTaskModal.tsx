import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog';
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

const EditTaskModal = () => {
  return (
    <Dialog>
      <DialogTrigger>Open</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Task</DialogTitle>
        </DialogHeader>
        <form className="space-y-5 mt-4">
          <div className="space-y-2">
            <Label htmlFor="title">Task Title *</Label>
            <Input id="title" placeholder="Enter task title" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Add more details..."
              rows={3}
            />
          </div>

          {/* Assign to */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Assign to</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select member" />
                </SelectTrigger>
                <SelectContent>
                  {/* Mom */}
                  <SelectItem key="mom" value="mom">
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
                  <SelectItem key="dad" value="dad">
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
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select member" />
                </SelectTrigger>
                <SelectContent>
                  {/* Chore */}
                  <SelectItem key="chore" value="chore">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: '#0D9488' }}
                      />
                      Chore
                    </div>
                  </SelectItem>
                  {/* Shopping */}
                  <SelectItem key="shopping" value="shopping">
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
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditTaskModal;
