import { Label } from '../ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { createAcronym } from './TaskAssignee';

interface AssigneeSelectProps {
  selectedMember?: string;
  onAssigneeChange: (value: string) => void;
}

// DUMMY DATA
const MEMBERS = ['Dad', 'Mom'];

const AssigneeSelect = ({
  selectedMember,
  onAssigneeChange,
}: AssigneeSelectProps) => {
  return (
    <div className="space-y-2">
      <Label>Assign to</Label>
      <Select
        value={selectedMember || 'none'}
        onValueChange={
          // (val) =>
          //   setFormData({
          //     ...formData,
          //     assignee: val === 'none' ? undefined : val,
          //   }) // Because assignee is optional
          onAssigneeChange
        }
      >
        <SelectTrigger>
          <SelectValue placeholder="Select member" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem key="none" value="none">
            None
          </SelectItem>

          {MEMBERS.map((member) => (
            <SelectItem key={member} value={member}>
              <div className="flex items-center gap-2">
                <div
                  className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] text-white"
                  style={{ backgroundColor: '#0D9488' }}
                >
                  {createAcronym(member)}
                </div>
                {member}
              </div>
            </SelectItem>
          ))}

          {/* <SelectItem key="Mom" value="Mom">
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
          </SelectItem> */}
        </SelectContent>
      </Select>
    </div>
  );
};

export default AssigneeSelect;
