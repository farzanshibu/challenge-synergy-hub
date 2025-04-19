import { z } from "zod";

export const overlaySettingsSchema = z.object({
  position_x: z.number().min(0).default(10),
  position_y: z.number().min(0).default(10),
  width: z.number().min(1).max(100).default(100),
  height: z.number().min(1).max(100).default(100),
  scale: z.number().min(50).max(200).default(100),
  react_code: z.string().optional(),
  confetti_enabled: z.boolean().default(true),
  sound_enabled: z.boolean().default(true),
  sound_type: z
    .object({
      increment_url: z.string().url().nullable(),
      decrement_url: z.string().url().nullable(),
      reset_url: z.string().url().nullable(),
    })
    .nullable(),
  confetti_type: z
    .object({
      increment_url: z.string().url().nullable(),
      decrement_url: z.string().url().nullable(),
      reset_url: z.string().url().nullable(),
    })
    .nullable(),
  challenge_id: z.number().optional(),
});

export type OverlaySettingsFormValues = z.infer<typeof overlaySettingsSchema>;
