import { useQuery } from '@tanstack/react-query';
import { memberService } from '../services/membersService';

const memberKeys = {
  all: ['members'] as const,
};

export const useMembers = () => {
  return useQuery({
    queryKey: memberKeys.all,
    queryFn: memberService.getAll,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};
