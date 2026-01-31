import { useMembers } from '@/common/hooks/useMembers';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { UserButton, useUser } from '@clerk/clerk-react';

interface AssigneeSelectProps {
  selectedMemberId?: string;
  onAssigneeChange: (value: string | null) => void;
}

const AssigneeSelect = ({
  selectedMemberId,
  onAssigneeChange,
}: AssigneeSelectProps) => {
  const { data: members, isLoading } = useMembers();
  const {user} = useUser();

  if (isLoading) return null;

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
              <UserButton />
              <span>{user?.fullName}</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default AssigneeSelect;
