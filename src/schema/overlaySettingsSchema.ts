import { z } from 'zod';

export const overlaySettingsSchema = z.object({
  position_x: z.number().min(0).default(10),
  position_y: z.number().min(0).default(10),
  width: z.number().min(100).max(1000).default(300),
  height: z.number().min(100).max(1000).default(200),
  react_code: z.string().optional(),
  confetti_enabled: z.boolean().default(true),
  sound_enabled: z.boolean().default(true),
  sound_type: z.object({
    increment_url: z.string().url().nullable(),
    decrement_url: z.string().url().nullable(),
    reset_url: z.string().url().nullable()
  }).nullable(),
  confetti_type: z.object({
    increment_url: z.string().url().nullable(),
    decrement_url: z.string().url().nullable(),
    reset_url: z.string().url().nullable()
  }).nullable(),
  challenge_id: z.number().optional(),
});

export type OverlaySettingsFormValues = z.infer<typeof overlaySettingsSchema>;