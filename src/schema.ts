import { z } from 'zod';

export const guestSchema = z.object({
  name: z.string().trim().max(48).default('معزز مہمان'),
  soundEnabled: z.boolean().default(false),
  motionEnabled: z.boolean().default(true),
  quality: z.enum(['auto', 'high', 'balanced', 'battery']).default('auto'),
  engine: z.enum(['auto', 'webgpu', 'webgl', 'canvas']).default('auto')
});

export type GuestSettings = z.infer<typeof guestSchema>;

export function parseGuestSettings(input: unknown): GuestSettings {
  const parsed = guestSchema.safeParse(input);
  return parsed.success ? parsed.data : guestSchema.parse({});
}
