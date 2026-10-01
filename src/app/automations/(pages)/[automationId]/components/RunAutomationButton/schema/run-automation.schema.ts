import { z } from 'zod';

export const runAutomationSchema = z.object({
  automationId: z.string().min(1),
  inputs: z.record(z.string(), z.unknown()),
});
