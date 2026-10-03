'use server';

import { revalidatePath } from 'next/cache';

import { prisma } from '@/lib/prisma';
import { actionClient } from '@/lib/safe-action';

import {
  completeWorkflowNodeRunSchema,
  completeWorkflowRunSchema,
  createWorkflowNodeRunSchema,
  createWorkflowRunSchema,
  workflowSchema,
} from './schema/workflow.schema';

export const saveWorkflow = actionClient
  .inputSchema(workflowSchema)
  .action(async ({ parsedInput: workflow }) => {
    await prisma.$transaction(async (transaction) => {
      await transaction.workflow.upsert({
        create: {
          description: workflow.description,
          id: workflow.id,
          inputsJson: workflow.inputs,
          name: workflow.name,
          outputBindingsJson: workflow.outputBindings,
          outputJson: workflow.output,
          outputsJson: workflow.outputs,
          startJson: workflow.start,
        },
        update: {
          description: workflow.description,
          inputsJson: workflow.inputs,
          name: workflow.name,
          outputBindingsJson: workflow.outputBindings,
          outputJson: workflow.output,
          outputsJson: workflow.outputs,
          startJson: workflow.start,
        },
        where: { id: workflow.id },
      });
      await transaction.workflowNode.deleteMany({ where: { workflowId: workflow.id } });
      if (workflow.nodes.length) {
        await transaction.workflowNode.createMany({
          data: workflow.nodes.map((node) => ({
            fixedInputsJson: node.fixedInputs,
            id: node.id,
            inputBindingsJson: node.inputBindings,
            positionX: node.positionX,
            positionY: node.positionY,
            runnableId: node.runnableId,
            runnableType: node.runnableType,
            workflowId: workflow.id,
          })),
        });
      }
      if (workflow.connections.length) {
        await transaction.workflowConnection.createMany({
          data: workflow.connections.map((connection) => ({
            ...connection,
            workflowId: workflow.id,
          })),
        });
      }
    });

    revalidatePath('/');
    revalidatePath(`/workflows/${workflow.id}`);

    return { id: workflow.id };
  });

export const createWorkflowRun = actionClient
  .inputSchema(createWorkflowRunSchema)
  .action(async ({ parsedInput: { inputs, workflowId } }) => {
    const run = await prisma.workflowRun.create({
      data: {
        inputsJson: inputs as never,
        outputsJson: {},
        startedAt: new Date(),
        status: 'running',
        workflowId,
      },
    });

    revalidatePath(`/workflows/${workflowId}`);

    return { id: run.id, startedAt: run.startedAt };
  });

export const completeWorkflowRun = actionClient
  .inputSchema(completeWorkflowRunSchema)
  .action(async ({ parsedInput: { error, logs, outputs, runId, status } }) => {
    const run = await prisma.workflowRun.update({
      data: { error, finishedAt: new Date(), logs, outputsJson: outputs as never, status },
      where: { id: runId },
    });

    revalidatePath(`/workflows/${run.workflowId}`);
  });

export const createWorkflowNodeRun = actionClient
  .inputSchema(createWorkflowNodeRunSchema)
  .action(async ({ parsedInput: { inputs, nodeName, workflowNodeId, workflowRunId } }) => {
    const nodeRun = await prisma.workflowNodeRun.create({
      data: {
        inputsJson: inputs as never,
        nodeName,
        outputsJson: {},
        startedAt: new Date(),
        status: 'running',
        workflowNodeId,
        workflowRunId,
      },
    });

    return { id: nodeRun.id, startedAt: nodeRun.startedAt };
  });

export const completeWorkflowNodeRun = actionClient
  .inputSchema(completeWorkflowNodeRunSchema)
  .action(async ({ parsedInput: { error, logs, nodeRunId, outputs, status } }) => {
    await prisma.workflowNodeRun.update({
      data: { error, finishedAt: new Date(), logs, outputsJson: outputs as never, status },
      where: { id: nodeRunId },
    });
  });
