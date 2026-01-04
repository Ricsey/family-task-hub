import { useMembers } from '@/common/hooks/useMembers';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface AssigneeSelectProps {
  selectedMemberId?: string;
  onAssigneeChange: (value: string | null) => void;
}

const AssigneeSelect = ({
  selectedMemberId,
  onAssigneeChange,
}: AssigneeSelectProps) => {
  const { data: members } = useMembers();

  return (
    <Select
      value={selectedMemberId || 'none'}
      onValueChange={(val) => onAssigneeChange(val === 'none' ? null : val)}
    >
      <SelectTrigger id="assignee-select">
        <SelectValue placeholder="Select member" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem key="none" value="none">
          None
        </SelectItem>

        {members?.map((member) => (
          <SelectItem key={member.id} value={member.id}>
            <div className="flex items-center gap-2">
              <MemberAvatar name={member.full_name} />
              <span>{member.full_name}</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default AssigneeSelect;

const MemberAvatar = ({ name }: { name: string }) => {
  const displayName = name?.trim() ? createAcronym(name) : '?';

  return (
    <div className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] text-white bg-teal-600">
      {displayName}
    </div>
  );
};

const createAcronym = (name: string): string =>
  name
    .trim()
    .split(/\s+/)
    .map((part) => part[0])
    .join('')
    .toUpperCase();
