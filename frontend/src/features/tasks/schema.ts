import z from 'zod';

export const taskSchema = z.object({
  title: z.string().min(1, 'Title is required').max(50, 'Title is too long'),
  description: z
    .string()
    .min(1, 'Description is required')
    .max(500, 'Description cannot exceed 500 characters'),
  assignee_id: z.string().nullable().optional(),
  due_date: z.date({ error: 'Due date is required' }),
  category: z.enum(
    ['Chore', 'Shopping', 'Homework', 'Other'],
    'Category is required'
  ),
});

export type AddTaskForm = z.infer<typeof taskSchema>;
