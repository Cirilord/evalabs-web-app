import { z } from 'zod';

export const runAutomationSchema = z.object({
  automationId: z.string().min(1),
  inputs: z.record(z.string(), z.unknown()),
  runnerVersion: z.string().min(1).max(100),
});

export const completeAutomationRunSchema = z.object({
  error: z.string(),
  logs: z.string(),
  outputs: z.unknown(),
  runId: z.string().min(1),
  runnerVersion: z.string().min(1).max(100),
  status: z.enum(['failed', 'succeeded']),
});
