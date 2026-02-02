import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { useCreateTask, useTask, useUpdateTask } from '../hooks/useTasks';
import { taskSchema, type AddTaskForm } from '../schema';
import { useTaskModal } from '../stores/taskModalStore';
import AssigneeSelect from './AssigneeSelect';
import CategorySelect from './CategorySelect';
import DuedateSelect from './DuedateSelect';

const TaskForm = () => {
  const { mode, currentTask, closeModal } = useTaskModal();

  const { data: task } = useTask(currentTask?.id || '');

  const createTaskMutation = useCreateTask();
  const updateTaskMutation = useUpdateTask();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<AddTaskForm>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: currentTask?.title || '',
      description: currentTask?.description || '',
      assignee_id: currentTask?.assignee_id || null,
      category: currentTask?.category || undefined,
      due_date: currentTask?.due_date
        ? new Date(currentTask.due_date)
        : new Date(),
    },
  });

  // Reset form when task changes
  useEffect(() => {
    if (task) {
      reset({
        title: task.title || '',
        description: task.description || '',
        assignee_id: task.assignee_id || null,
        category: task.category || undefined,
        due_date: task.due_date ? new Date(task.due_date) : new Date(),
      });
    } else {
      // Reset to defaults for create mode
      reset({
        title: '',
        description: '',
        assignee_id: null,
        category: undefined,
        due_date: new Date(),
      });
    }
  }, [task, reset, mode]);

  const onSubmit = async (data: AddTaskForm) => {
    try {
      if (mode === 'create') {
        const taskData = {
          ...data,
          status: 'todo' as const,
        };
        await createTaskMutation.mutateAsync(taskData);

        toast.success('Task created successfully', {
          description: `"${data.title}" has been added to tasks.`,
        });
      } else if (currentTask?.id) {
        await updateTaskMutation.mutateAsync({
          id: currentTask.id,
          ...data,
        });

        toast.success('Task updated successfully', {
          description: `"${data.title}" has been updated.`,
        });
      }

      closeModal();
    } catch (error) {
      toast.error('Failed to save task', {
        description:
          mode === 'create'
            ? 'Could not create task. Please try again.'
            : 'Could not update task. Please try again.',
      });
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
        <FormField
          label="Assignee"
          id="assignee"
          error={errors.assignee_id?.message}
        >
          <Controller
            name="assignee_id"
            control={control}
            render={({ field }) => {
              console.log('Field value:', field.value);
              return (
                <AssigneeSelect
                  selectedMemberId={field.value ?? undefined}
                  onAssigneeChange={field.onChange}
                />
              );
            }}
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
        <Button type="button" variant="ghost" onClick={closeModal}>
          Cancel
        </Button>
        <Button
          type="submit"
          className="bg-teal-600 hover:bg-teal-700 text-white"
          disabled={isSubmitting}
        >
          {mode === 'edit' ? 'Edit Task' : 'Create Task'}
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
