import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";
import { toast } from "sonner";
import { taskService } from "../services/";
import type { Task } from "../types";

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
    mutationFn: ({ id, ...updates }: { id: string | number } & Partial<Task>) =>
      taskService.update(id, updates),
    onSuccess: (updated) => {
      queryClient.setQueryData(taskKeys.detail(updated.id), updated);
      queryClient.invalidateQueries({ queryKey: taskKeys.lists() })
    },
  })
}

export const useDeleteTask = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: taskService.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: taskKeys.all })
      toast.success("Task deleted successfully") // where should I put this?
    },
    onError: () => {
      toast.error("Failed to delete task. Please try again.")
    }
  })
}

export const useTasksByCategory = () => {
  const { data: tasks, isLoading, error } = useTasks();

  const stats = useMemo(() => {
    if (!tasks || tasks.length === 0) return null;

    const counts = tasks.reduce((acc, task) => {
      acc[task.category] = (acc[task.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const total = tasks.length;

    const categoryStats = Object.entries(counts).map(([category, count]) => ({
      category,
      count,
      percentage: Math.round((count / total) * 100),
    }));

    return categoryStats;
  }, [tasks]);

  return { data: stats, isLoading, error };
};

export const useUpcomingTasks = () => {
  const { data: tasks, isLoading, error } = useTasks();

  const upcomingTasks = useMemo(() => {
    if (!tasks) return [];

    const now = new Date();
    now.setHours(0, 0, 0, 0);

    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(now.getDate() + 7);

    return tasks
      .filter(task => {
        if(task.status === 'completed') return false;

        const dueDate = new Date(task.due_date);
        return dueDate < now || (dueDate >= now && dueDate <= sevenDaysFromNow);
      })
      .sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime());
  }, [tasks]);

  return { data: upcomingTasks, isLoading, error };
};
