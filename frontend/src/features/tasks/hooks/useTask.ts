import { useQuery } from "@tanstack/react-query"
import { taskService } from "../services"


export const useTask = (id: number | string) => {
  return useQuery({
    queryKey: ['tasks', id],
    queryFn: () => taskService.get(id),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 3
  })
}
