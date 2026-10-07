import 'server-only';

import { prisma } from '@/lib/prisma/server';

import { type SaveWorkflowInput, type WorkflowIdentifier } from '../types';

export async function saveWorkflow(input: SaveWorkflowInput): Promise<WorkflowIdentifier> {
  const workflow = await prisma.$transaction(async (transaction) => {
    const savedWorkflow = await transaction.workflow.upsert({
      create: {
        description: input.description,
        id: input.id,
        inputsJson: input.inputs,
        name: input.name,
        outputBindingsJson: input.outputBindings,
        outputJson: input.output,
        outputsJson: input.outputs,
        startJson: input.start,
      },
      update: {
        description: input.description,
        inputsJson: input.inputs,
        name: input.name,
        outputBindingsJson: input.outputBindings,
        outputJson: input.output,
        outputsJson: input.outputs,
        startJson: input.start,
      },
      where: { id: input.id },
    });

    await transaction.workflowConnection.deleteMany({ where: { workflowId: input.id } });
    await transaction.workflowNode.deleteMany({ where: { workflowId: input.id } });

    if (input.nodes.length) {
      await transaction.workflowNode.createMany({
        data: input.nodes.map((node) => ({
          fixedInputsJson: node.fixedInputs,
          id: node.id,
          inputBindingsJson: node.inputBindings,
          positionX: node.positionX,
          positionY: node.positionY,
          runnableId: node.runnableId,
          runnableType: node.runnableType,
          workflowId: input.id,
        })),
      });
    }

    if (input.connections.length) {
      await transaction.workflowConnection.createMany({
        data: input.connections.map((connection) => ({ ...connection, workflowId: input.id })),
      });
    }

    return { id: savedWorkflow.id };
  });

  return workflow;
}
