import { useMembers } from '@/common/hooks/useMembers';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const getInitials = (name: string): string => {
  const words = name.trim().split(/\s+/);
  if (words.length === 1) {
    return words[0].substring(0, 2).toUpperCase();
  }
  return words.slice(0, 2).map(word => word[0].toUpperCase()).join('');
};

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
              <Avatar className="h-6 w-6">
                <AvatarImage src={member.image_url} alt={member.full_name} />
                <AvatarFallback>{getInitials(member.full_name)}</AvatarFallback>
              </Avatar>
              <span>{member.full_name}</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default AssigneeSelect;
