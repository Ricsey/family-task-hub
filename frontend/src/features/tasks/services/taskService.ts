import { HttpService } from "@/common/services/httpService";
import type { Task } from '@/features/tasks/types';
import type { TaskStatus } from "../types/task";

export interface SaveTaskDTO {
  title: string;
  description?: string;
  assignee_id?: string | null;
  due_date: string; // ISO or YYYY-MM-DD
  category: string;
  status?: TaskStatus;
}

class TaskService extends HttpService<Task> {
  constructor() {
    super('/tasks');
  }

  private toDTO(data: Omit<Task, 'id'>): SaveTaskDTO {
    return {
      ...data,
      due_date: data.due_date instanceof Date
        ? data.due_date.toLocaleDateString('en-CA')
        : data.due_date,
      assignee_id: data.assignee || null,
      category: data.category || '',
    };
  }

  save(data: Omit<Task, 'id'>, id?: string) {
    const payload = this.toDTO(data) as unknown as Task

    return id
      ? this.update({...payload, id})
      : this.create(payload)
  }
}

export const taskService = new TaskService()
