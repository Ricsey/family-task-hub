import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { taskSchema, type AddTaskForm } from '../schema';
import { taskService } from '../services';
import type { Task } from '../types';
import AssigneeSelect from './AssigneeSelect';
import CategorySelect from './CategorySelect';
import DuedateSelect from './DuedateSelect';

interface TaskFormProps {
  task?: Task;
  onSave: (task: Task) => void;
  onCancel: () => void;
}

const TaskForm = ({ task, onSave, onCancel }: TaskFormProps) => {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<AddTaskForm>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: task?.title || '',
      description: task?.description || '',
      assignee: task?.assignee || undefined,
      category: task?.category || undefined,
      due_date: task?.due_date ? new Date(task.due_date) : new Date(),
    },
  });

  const onSubmit = async (data: AddTaskForm) => {
    try {
      const payload: Omit<Task, 'id'> = {
        ...data,
        status: task?.status || 'todo',
      };
      const result = await taskService.save(payload, task?.id);
      onSave(result);
    } catch (error) {
      console.error(error)
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 mt-4">
      <FormField
        label="Task Title *"
        id="task-title"
        error={errors.title?.message}
      >
        <Input
          id="task-title"
          placeholder="Enter task title"
          {...register('title')}
        />
      </FormField>

      <FormField
        label="Description"
        id="task-description"
        error={errors.description?.message}
      >
        <Textarea
          id="task-description"
          placeholder="Add more details..."
          rows={3}
          {...register('description')}
        />
      </FormField>

      <div className="grid grid-cols-2 gap-4 items-start">
        <FormField
          label="Assignee"
          id="assignee"
          error={errors.assignee?.message}
        >
          <Controller
            name="assignee"
            control={control}
            render={({ field }) => (
              <AssigneeSelect
                selectedMemberId={field.value}
                onAssigneeChange={field.onChange}
              />
            )}
          />
        </FormField>

        <FormField
          label="Due Date*"
          id="due-date"
          error={errors.due_date?.message}
        >
          <Controller
            name="due_date"
            control={control}
            render={({ field }) => (
              <DuedateSelect
                date={field.value}
                onDateChange={(date) => {
                  if (!date) return;
                  field.onChange(date);
                }}
              />
            )}
          />
        </FormField>

        <FormField
          label="Category*"
          id="category-select"
          error={errors.category?.message}
        >
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
        </FormField>
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="ghost" onClick={onCancel}>
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
  );
};

export default TaskForm;

const FormField = ({
  label,
  id,
  error,
  children,
}: {
  label: string;
  id: string;
  error?: string;
  children: React.ReactNode;
}) => (
  <div className="space-y-2">
    <Label htmlFor={id}>{label}</Label>
    {children}
    {error && <p className="text-xs text-red-500 font-medium">{error}</p>}
  </div>
);
