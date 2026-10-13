'use client';

import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';

import { RunWorkflowDialog } from '@/components/WorkflowCanvas/components/RunWorkflowDialog';
import { useRunner } from '@/contexts/RunnerProvider';
import {
  getAutomationArtifactFile,
  isAutomationArtifactReference,
} from '@/lib/automation-artifacts';
import { AutomationExecutionError, runAutomationInBrowser } from '@/lib/automation-runner';
import { queryKeys } from '@/lib/query-keys';
import { type WorkflowGraph, type WorkflowRunnable } from '@/lib/workflows';
import { completeWorkflowNodeRun } from '@/services/workflows/client/complete-workflow-node-run';
import { completeWorkflowRun } from '@/services/workflows/client/complete-workflow-run';
import { createWorkflowNodeRun } from '@/services/workflows/client/create-workflow-node-run';
import { createWorkflowRun } from '@/services/workflows/client/create-workflow-run';

import { type RunWorkflowButtonProps } from './types';

export function RunWorkflowButton(props: RunWorkflowButtonProps) {
  const { catalog, graph } = props;
  const { runnerId } = useRunner();
  const queryClient = useQueryClient();
  const [isRunning, setIsRunning] = useState(false);

  async function executeGraph(
    workflowGraph: WorkflowGraph,
    workflowInputs: Record<string, boolean | number | string>,
    workflowFiles: Record<string, File>,
    workflowRunId: string,
    logs: string[]
  ): Promise<Record<string, unknown>> {
    const completedOutputs = new Map<string, Record<string, unknown>>();
    const pendingNodes = new Set(workflowGraph.nodes.map((node) => node.id));

    while (pendingNodes.size > 0) {
      const node = workflowGraph.nodes.find(
        (candidate) =>
          pendingNodes.has(candidate.id) &&
          workflowGraph.connections
            .filter((connection) => connection.targetNodeId === candidate.id)
            .every((connection) => completedOutputs.has(connection.sourceNodeId))
      );

      if (!node) {
        throw new Error('The workflow contains a cycle.');
      }

      const runnable = catalog.find(
        (item) => item.id === node.runnableId && item.type === node.runnableType
      );
      if (!runnable) {
        throw new Error(`Unable to run ${node.runnableId}.`);
      }

      const inputs: Record<string, boolean | number | string> = { ...node.fixedInputs };
      const files: Record<string, File> = {};

      for (const [inputName, publicInputName] of Object.entries(node.inputBindings)) {
        const value = workflowInputs[publicInputName];
        if (typeof value === 'boolean' || typeof value === 'number' || typeof value === 'string') {
          inputs[inputName] = value;
        }
        if (workflowFiles[publicInputName]) {
          files[inputName] = workflowFiles[publicInputName];
        }
      }

      for (const connection of workflowGraph.connections.filter(
        (item) => item.targetNodeId === node.id
      )) {
        const value = completedOutputs.get(connection.sourceNodeId)?.[connection.sourceOutputName];
        if (typeof value === 'boolean' || typeof value === 'number' || typeof value === 'string') {
          inputs[connection.targetInputName] = value;
        }
        if (isAutomationArtifactReference(value)) {
          files[connection.targetInputName] = await getAutomationArtifactFile(value);
        }
      }

      const nodeRun = await createWorkflowNodeRun({
        inputs,
        nodeName: runnable.name,
        workflowNodeId: node.id,
        workflowRunId,
      });

      try {
        const result = await executeRunnable(runnable, inputs, files, workflowRunId, logs);
        const outputs =
          result.outputs && typeof result.outputs === 'object' && !Array.isArray(result.outputs)
            ? (result.outputs as Record<string, unknown>)
            : {};
        if (result.logs) {
          logs.push(`${runnable.name}\n${result.logs}`);
        }
        await completeWorkflowNodeRun({
          error: '',
          logs: result.logs,
          nodeRunId: nodeRun.id,
          outputs,
          status: 'succeeded',
        });
        completedOutputs.set(node.id, outputs);
        pendingNodes.delete(node.id);
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        await completeWorkflowNodeRun({
          error: message,
          logs: error instanceof AutomationExecutionError ? error.logs : '',
          nodeRunId: nodeRun.id,
          outputs: {},
          status: 'failed',
        });
        throw error;
      }
    }

    return Object.fromEntries(
      workflowGraph.outputs.map((output) => {
        const binding = workflowGraph.outputBindings[output.name];
        const value = Object.hasOwn(workflowGraph.output.fixedOutputs, output.name)
          ? workflowGraph.output.fixedOutputs[output.name]
          : completedOutputs.get(binding?.nodeId ?? '')?.[binding?.outputName ?? ''];
        return [output.name, value ?? null];
      })
    );
  }

  async function executeRunnable(
    runnable: WorkflowRunnable,
    inputs: Record<string, boolean | number | string>,
    files: Record<string, File>,
    workflowRunId: string,
    logs: string[]
  ) {
    if (runnable.type === 'workflow' && runnable.graph) {
      return {
        logs: '',
        outputs: await executeGraph(runnable.graph, inputs, files, workflowRunId, logs),
      };
    }
    if (runnable.type === 'automation' && runnable.script) {
      return runAutomationInBrowser({
        files,
        inputs,
        libraries: runnable.libraries ?? [],
        outputSchema: runnable.outputs,
        runnerId,
        script: runnable.script,
      });
    }
    throw new Error(`Unable to run ${runnable.name}.`);
  }

  async function handleRun(
    values: Record<string, boolean | number | string>,
    files: Record<string, File>
  ) {
    const inputs = Object.fromEntries(
      graph.inputs.flatMap((input) => {
        const value = values[input.name];
        return value === undefined
          ? []
          : [[input.name, input.type === 'number' && value !== '' ? Number(value) : value]];
      })
    );
    const workflowRun = await createWorkflowRun({ inputs, workflowId: graph.id });
    setIsRunning(true);
    const logs: string[] = [];

    try {
      const outputs = await executeGraph(graph, inputs, files, workflowRun.id, logs);
      await completeWorkflowRun({
        error: '',
        logs: logs.join('\n\n'),
        outputs,
        runId: workflowRun.id,
        status: 'succeeded',
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      await completeWorkflowRun({
        error: message,
        logs: error instanceof AutomationExecutionError ? error.logs : '',
        outputs: {},
        runId: workflowRun.id,
        status: 'failed',
      });
      throw error;
    } finally {
      setIsRunning(false);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.workflow(graph.id) }),
        queryClient.invalidateQueries({ queryKey: queryKeys.workflowStatuses }),
      ]);
    }
  }

  return <RunWorkflowDialog inputs={graph.inputs} isRunning={isRunning} onRun={handleRun} />;
}
