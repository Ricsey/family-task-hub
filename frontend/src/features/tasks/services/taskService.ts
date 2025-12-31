  import { TransformedHttpService } from "@/common/services/httpService";
import type { Task, TaskApi } from '@/features/tasks/types';
import type { TaskStatus } from "../types/task";
import { fromApiTask, toApiTask } from "../utils/transorm";

  export interface SaveTaskDTO {
    title: string;
    description?: string;
    assignee_id?: string | null;
    due_date: string; // ISO or YYYY-MM-DD
    category: string;
    status?: TaskStatus;
  }

  class TaskService extends TransformedHttpService<Task, TaskApi> {
    constructor() {
      super('/tasksx', fromApiTask, toApiTask);
    }
  }

  export const taskService = new TaskService()
