import type { Member } from '@/common/types/members';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface MemberAvatarProps {
  member: NonNullable<Member>
}

const MemberAvatar = ({member}: MemberAvatarProps) => {
  console.log(member)
  return (
    <Avatar className="h-6 w-6">
      <AvatarImage src={member.image_url} alt={member.full_name} />
      <AvatarFallback>{getInitials(member.full_name)}</AvatarFallback>
    </Avatar>
  )
}

export default MemberAvatar;

const getInitials = (name: string): string => {
  const words = name.trim().split(/\s+/);
  if (words.length === 1) {
    return words[0].substring(0, 2).toUpperCase();
  }
  return words.slice(0, 2).map(word => word[0].toUpperCase()).join('');
};
