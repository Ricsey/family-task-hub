import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { taskService } from "../services/";

const taskKeys = {
  all: ['tasks'] as const,
  lists: () => [...taskKeys.all, 'list'] as const,
  details: () => [...taskKeys.all, 'detail'] as const,
  detail: (id: string | number) => [...taskKeys.details(), id] as const,
};

export const useTasks = () => {
  return useQuery({
    queryKey: taskKeys.lists(),
    queryFn: taskService.getAll,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 3,
  })
}

export const useTask = (id: number | string) => {
  return useQuery({
    queryKey: taskKeys.detail(id),
    queryFn: () => taskService.get(id),
    staleTime: 1000 * 60 * 5, // 5 minutes
    enabled: !!id // prevents fetching /tasks/undefined
  })
}

export const useCreateTask = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: taskService.create,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: taskKeys.all })
  })
}

export const useUpdateTask = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: taskService.update,
    onSuccess: (updated) => {
      queryClient.setQueryData(taskKeys.detail(updated.id), updated);
      queryClient.invalidateQueries({ queryKey: taskKeys.lists() })
    }
  })
}

export const useDeleteTask = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: taskService.delete,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: taskKeys.all })
  })
}
