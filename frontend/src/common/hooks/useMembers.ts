import { useQuery } from "@tanstack/react-query";
import { memberService } from "../services/membersService";

export const useMembers = () => {
  return useQuery({
    queryKey: ['members'],
    queryFn: () => memberService.getAll(),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};
