import type { Member } from '@/common/types/members';
import MemberAvatar from './MemberAvatar';

interface TaskAssigneeProps {
  assignee: Member;
}

const TaskAssignee = ({ assignee }: TaskAssigneeProps) => {
  return (
    <div className="flex items-center gap-1.5">
      <MemberAvatar member={assignee} />
      <span className="text-sm text-muted-foreground">{assignee.full_name}</span>
    </div>
  );
};

export default TaskAssignee;
