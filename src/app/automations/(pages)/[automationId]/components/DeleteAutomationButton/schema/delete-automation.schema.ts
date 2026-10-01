import { z } from 'zod';

export const deleteAutomationSchema = z.object({
  automationId: z.string().min(1),
});
