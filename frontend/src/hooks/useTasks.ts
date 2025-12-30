import type { Task } from '@/components/task/entities'
import taskService from '@/services/taskService'
import {useQuery} from '@tanstack/react-query'

export const useTasks = () => {
  const tasksQuery = useQuery({
    queryKey: ['tasks'],
    queryFn: taskService.getAll<Task>().then(res => res.data)
  })
}