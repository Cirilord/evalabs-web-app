import { z } from 'zod';

export const cloneAutomationSchema = z.object({
  automationId: z.string().min(1),
});
