import { z } from 'zod';

export const updateAutomationScriptSchema = z.object({
  automationId: z.string().min(1),
  script: z.string().trim().min(1).max(50_000),
});
