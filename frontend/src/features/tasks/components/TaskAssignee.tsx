import { UserButton, useUser } from '@clerk/clerk-react';

interface TaskAssigneeProps {
  name: string | null;
}

export const createAcronym = (str: string): string => {
  if (!str) {
    return '';
  }

  const input = String(str).trim();
  const words = input.split(/\s+/);

  const acronym = words
    .map((word) => {
      if (word.length === 0) {
        return '';
      }

      return word.charAt(0).toUpperCase();
    })
    .join('');

  return acronym;
};

const TaskAssignee = ({ name }: TaskAssigneeProps) => {
  const {user} = useUser();

  if (!name) return null;

  return (
    <div className="flex items-center gap-1.5">
      <UserButton />
      <span className="text-sm text-stone-600">{user?.fullName}</span>
    </div>
  );
};

export default TaskAssignee;
