import { useMembers } from '@/common/hooks/useMembers';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import MemberAvatar from './MemberAvatar';

interface AssigneeSelectProps {
  selectedMemberId?: string;
  onAssigneeChange: (value: string | null) => void;
}

const AssigneeSelect = ({
  selectedMemberId,
  onAssigneeChange,
}: AssigneeSelectProps) => {
  const { data: members, isLoading } = useMembers();

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
              <MemberAvatar member={member}/>
              {/* <Avatar className="h-6 w-6">
                <AvatarImage src={member.image_url} alt={member.full_name} />
                <AvatarFallback>{getInitials(member.full_name)}</AvatarFallback>
              </Avatar> */}
              <span>{member.full_name}</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default AssigneeSelect;
