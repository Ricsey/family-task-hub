import { getUserColor } from '@/common/utils/userColors';

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
  if (!name) return null;

  const colorClass = getUserColor(name);
  return (
    <div className="flex items-center gap-1.5">
      <div
        className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium text-white ${colorClass}`}
      >
        {name && createAcronym(name)}
      </div>
      <span className="text-sm text-stone-600">{name}</span>
    </div>
  );
};

export default TaskAssignee;
