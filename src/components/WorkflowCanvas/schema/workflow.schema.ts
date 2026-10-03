import { z } from 'zod';

const workflowPortTypeSchema = z.enum(['boolean', 'file', 'number', 'text']);

const workflowInputSchema = z.object({
  description: z.string().max(500),
  name: z.string().trim().min(1).max(100),
  required: z.boolean(),
  type: workflowPortTypeSchema,
});

const workflowOutputSchema = workflowInputSchema.omit({ required: true });

export const workflowSchema = z.object({
  connections: z.array(
    z.object({
      id: z.string().uuid(),
      sourceNodeId: z.string().uuid(),
      sourceOutputName: z.string(),
      targetInputName: z.string(),
      targetNodeId: z.string().uuid(),
    })
  ),
  description: z.string().max(500),
  id: z.string().uuid(),
  inputs: z.array(workflowInputSchema),
  name: z.string().trim().min(1).max(100),
  nodes: z.array(
    z.object({
      fixedInputs: z.record(z.string(), z.union([z.boolean(), z.number(), z.string()])),
      id: z.string().uuid(),
      inputBindings: z.record(z.string(), z.string()),
      positionX: z.number().finite(),
      positionY: z.number().finite(),
      runnableId: z.string().uuid(),
      runnableType: z.enum(['automation', 'workflow']),
    })
  ),
  output: z.object({
    fixedOutputs: z.record(z.string(), z.union([z.boolean(), z.number(), z.string()])).default({}),
    id: z.string().uuid(),
    positionX: z.number().finite(),
    positionY: z.number().finite(),
    sources: z.array(z.string().uuid()),
  }),
  outputBindings: z.record(
    z.string(),
    z.object({ nodeId: z.string().uuid(), outputName: z.string() })
  ),
  outputs: z.array(workflowOutputSchema),
  start: z.object({
    id: z.string().uuid(),
    positionX: z.number().finite(),
    positionY: z.number().finite(),
    targets: z.array(z.string().uuid()),
  }),
});

const workflowRunValueSchema = z.unknown();

export const createWorkflowRunSchema = z.object({
  inputs: z.record(z.string(), workflowRunValueSchema),
  workflowId: z.string().uuid(),
});

export const completeWorkflowRunSchema = z.object({
  error: z.string(),
  logs: z.string(),
  outputs: z.record(z.string(), workflowRunValueSchema),
  runId: z.string().uuid(),
  status: z.enum(['succeeded', 'failed']),
});

export const createWorkflowNodeRunSchema = z.object({
  inputs: z.record(z.string(), workflowRunValueSchema),
  nodeName: z.string(),
  workflowNodeId: z.string().uuid(),
  workflowRunId: z.string().uuid(),
});

export const completeWorkflowNodeRunSchema = z.object({
  error: z.string(),
  logs: z.string(),
  nodeRunId: z.string().uuid(),
  outputs: z.record(z.string(), workflowRunValueSchema),
  status: z.enum(['succeeded', 'failed']),
});
