import apiClient from '@/services/apiClient';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import AssigneeSelect from './AssigneeSelect';
import CategorySelect from './CategorySelect';
import DuedateSelect from './DuedateSelect';
import type { Task } from './entities';

interface TaskEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (task: Task) => void;
  task?: Task;
}

const taskSchema = z.object({
  title: z.string().min(1, 'Title is required').max(50, 'Title is too long'),
  description: z
    .string()
    .min(1, 'Description is required')
    .max(500, 'Description cannot exceed 500 characters'),
  assignee: z.string().optional(),
  dueDate: z.date({error: "Due date is required"}),
  category: z.enum(
    ['Chore', 'Shopping', 'Homework', 'Other'],
    'Category is required'
  ),
});

type AddTaskForm = z.infer<typeof taskSchema>;

const CATEGORIES = ['Chore', 'Shopping', 'Homework', 'Other'] as const;
type Category = typeof CATEGORIES[number];

const isCategory = (val?: string): val is Category => 
  !!val && CATEGORIES.includes(val as Category);

const TaskModal = ({ isOpen, onClose, onSave, task }: TaskEditModalProps) => {
  const [calendarOpen, setCalendarOpen] = useState(false);

  const { register, handleSubmit, control, formState: { errors, isSubmitting } } = useForm<AddTaskForm>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: task?.title || '',
      description: task?.description || '',
      assignee: task?.assignee || undefined,
      category: isCategory(task?.category) ? task.category : undefined,
      dueDate: task?.due_date ? new Date(task.due_date) : new Date(),
    },
  });

  const processSubmit = async (data: AddTaskForm) => {
    try {
      const taskPayload = {
        title: data.title,
        description: data.description,
        assignee_id: data.assignee || null,
        category: data.category,
        status: task?.status || 'todo', 
        due_date: format(data.dueDate, 'yyyy-MM-dd'), 
      };

      const response = task 
        ? await apiClient.patch<Task>(`/task/${task.id}`, taskPayload)
        : await apiClient.post<Task>('/task', taskPayload);

      onSave(response.data);
      onClose();
    } catch (error) {
      console.error('[TASK_SUBMIT_ERROR]', error);
    }
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{task ? 'Edit Task' : 'Create Task'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(processSubmit)} className="space-y-5 mt-4">
          <div className="space-y-2">
            <Label htmlFor="title">Task Title *</Label>
            <Input
              id="title"
              placeholder="Enter task title"
              {...register('title')}
            />
            {errors.title && (
              <p className="text-xs text-red-500 font-medium">
                {errors.title.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Add more details..."
              rows={3}
              {...register('description')}
            />
            {errors.description && (
              <p className="text-xs text-red-500">
                {errors.description.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4 items-start">
            <Controller
              name="assignee"
              control={control}
              render={({ field }) => (
                <AssigneeSelect
                  selectedMember={field.value}
                  onAssigneeChange={(val) =>
                    field.onChange(val === 'none' ? undefined : val)
                  }
                />
              )}
            />
            {errors.assignee && (
              <p className="text-xs text-red-500">{errors.assignee.message}</p>
            )}

            <div className="flex flex-col">
              <Controller
                name="dueDate"
                control={control}
                render={({ field }) => (
                  <DuedateSelect
                    isCalendarOpen={calendarOpen}
                    onOpenChange={setCalendarOpen}
                    date={field.value}
                    onDateChange={(date) => {
                      if (!date) return;
                      field.onChange(date);
                      setCalendarOpen(false);
                    }}
                  />
                )}
              />
              {errors.dueDate && (
                <p className="text-xs text-red-500">{errors.dueDate.message}</p>
              )}
            </div>

            <div className="flex flex-col">
              <Controller
                name="category"
                control={control}
                render={({ field }) => (
                  <CategorySelect
                    selectedCategory={field.value}
                    onCategoryChange={field.onChange}
                  />
                )}
              />
              {errors.category && (
                <p className="text-xs text-red-500">
                  {errors.category.message}
                </p>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-teal-600 hover:bg-teal-700 text-white"
              disabled={isSubmitting}
            >
              {task ? 'Edit Task' : 'Create Task'}
              {isSubmitting && (
                <div className="w-4 h-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default TaskModal;
