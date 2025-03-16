
import { z } from 'zod';

export const formSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters long'),
  maxValue: z.coerce.number().min(1, 'Max value must be at least 1'),
  currentValue: z.coerce.number().min(0, 'Current value must be at least 0'),
  endDate: z.date().optional(),
  is_active: z.boolean().default(true),
});

export type FormValues = z.infer<typeof formSchema>;

export const updateSchema = z.object({
  id: z.number(),
  action: z.enum(['increment', 'decrement', 'reset', 'delete']),
});

export type UpdateValues = z.infer<typeof updateSchema>;
