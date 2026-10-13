'use client';

import '@xyflow/react/dist/style.css';

import { useQueryClient } from '@tanstack/react-query';
import {
  Background,
  type Connection,
  Controls,
  Handle,
  type Node,
  type NodeProps,
  Position,
  ReactFlow,
  type ReactFlowInstance,
  useNodesState,
  useUpdateNodeInternals,
} from '@xyflow/react';
import { cn } from 'cn';
import {
  ArrowLeftIcon,
  BotIcon,
  LogOutIcon,
  PlayIcon,
  TriangleAlertIcon,
  WorkflowIcon,
} from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useRunner } from '@/contexts/RunnerProvider';
import {
  getAutomationArtifactFile,
  isAutomationArtifactReference,
} from '@/lib/automation-artifacts';
import { AutomationExecutionError, runAutomationInBrowser } from '@/lib/automation-runner';
import { queryKeys } from '@/lib/query-keys';
import {
  configureWorkflowOutputs,
  getWorkflowErrors,
  type WorkflowGraph,
  type WorkflowRunnable,
} from '@/lib/workflows';
import { completeWorkflowNodeRun } from '@/services/workflows/client/complete-workflow-node-run';
import { completeWorkflowRun } from '@/services/workflows/client/complete-workflow-run';
import { createWorkflowNodeRun } from '@/services/workflows/client/create-workflow-node-run';
import { createWorkflowRun } from '@/services/workflows/client/create-workflow-run';
import { saveWorkflow } from '@/services/workflows/client/save-workflow';
import { Button } from '@/ui/button';
import { Input } from '@/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/ui/popover';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/ui/select';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/ui/sheet';
import { Textarea } from '@/ui/textarea';

import { EndDetailsPanel } from './components/EndDetailsPanel';
import { RunWorkflowDialog } from './components/RunWorkflowDialog';
import { StartDetailsPanel } from './components/StartDetailsPanel';
import { useWorkflowViewport } from './hooks/use-workflow-viewport';
import { type WorkflowCanvasProps, type WorkflowRunHistory } from './types';

type CanvasNode = Node<
  Readonly<{
    inputErrors?: string[];
    inputSources: Record<string, string>;
    inputs: WorkflowRunnable['inputs'];
    label: string;
    outputs: WorkflowRunnable['outputs'];
    runnableType?: WorkflowRunnable['type'];
    status: string;
    type: 'end' | 'runnable' | 'start';
  }>,
  'end' | 'runnable' | 'start'
>;

function statusTextClass(status: string) {
  switch (status) {
    case 'preparing':
      return 'animate-pulse text-warning';
    case 'running':
      return 'animate-pulse text-info';
    case 'waiting':
      return 'text-warning';
    case 'succeeded':
      return 'text-success';
    case 'failed':
      return 'text-destructive';
    default:
      return 'text-muted-foreground';
  }
}

function RunnableNode(props: NodeProps<CanvasNode>) {
  const { data, id, selected } = props;
  const { t } = useTranslation();
  const updateNodeInternals = useUpdateNodeInternals();
  const handles = JSON.stringify([
    data.inputs.map((port) => port.name),
    data.outputs.map((port) => port.name),
  ]);
  const TypeIcon = data.runnableType === 'workflow' ? WorkflowIcon : BotIcon;

  useEffect(() => {
    updateNodeInternals(id);
  }, [handles, id, updateNodeInternals]);

  return (
    <div
      className={cn(
        'min-w-56 rounded-lg border bg-card py-3 shadow-sm',
        selected && 'ring-2 ring-ring',
        Boolean(data.inputErrors?.length) && 'border-destructive ring-2 ring-destructive/30'
      )}
    >
      {Boolean(data.inputErrors?.length) && (
        <p className="px-4 text-xs text-destructive" role="status">
          {t('workflow.inputsNeedAttention')}
        </p>
      )}
      <div className="relative flex items-center gap-2 px-4 font-medium">
        <Handle
          id="node:input"
          position={Position.Left}
          title={t('workflow.connectInput')}
          type="target"
        />
        <TypeIcon className="size-4 text-primary" />
        {data.label}
        <Handle id="node:output" position={Position.Right} type="source" />
      </div>
      <p className={cn('px-4 text-xs', statusTextClass(data.status))} role="status">
        {data.status}
      </p>
      <div className="mt-3 flex justify-between gap-6">
        <div className="flex flex-col gap-3">
          {data.inputs.map((input) => (
            <div key={input.name} className="relative pl-4 text-xs">
              <span>
                {input.name}
                {input.required ? ' *' : ''} · {input.type}
              </span>
              {data.inputSources[input.name] && (
                <p className="text-muted-foreground">{data.inputSources[input.name]}</p>
              )}
            </div>
          ))}
        </div>
        <div className="flex flex-col gap-3">
          {data.outputs.map((output) => (
            <div key={output.name} className="relative pr-4 text-right text-xs">
              <span>
                {output.name} · {output.type}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function StartNode(props: NodeProps<CanvasNode>) {
  const { data, id, selected } = props;
  const { t } = useTranslation();
  const updateNodeInternals = useUpdateNodeInternals();
  const handles = JSON.stringify(data.outputs.map((port) => port.name));

  useEffect(() => {
    updateNodeInternals(id);
  }, [handles, id, updateNodeInternals]);

  return (
    <div
      className={cn(
        'min-w-56 rounded-lg border bg-card py-3 shadow-sm',
        selected && 'ring-2 ring-ring'
      )}
    >
      <div className="relative flex items-center gap-2 px-4 font-medium">
        <PlayIcon className="size-4 text-primary" />
        {t('workflow.start')}
        <Handle
          className="size-3 border-0 bg-primary shadow-none"
          id="start:flow"
          position={Position.Right}
          title={t('workflow.connectStart')}
          type="source"
        />
      </div>
      <p className="px-4 text-xs text-muted-foreground">{t('workflow.entrypoint')}</p>
      <p className={cn('px-4 text-xs', statusTextClass(data.status))} role="status">
        {data.status}
      </p>
      <div className="mt-3 flex flex-col gap-3">
        {data.outputs.map((port) => (
          <div key={port.name} className="relative px-4 text-xs">
            {port.name} · {port.type}
          </div>
        ))}
      </div>
      <p className="mt-3 px-4 text-xs text-muted-foreground">{t('workflow.startHint')}</p>
    </div>
  );
}

function EndNode(props: NodeProps<CanvasNode>) {
  const { data, id, selected } = props;
  const { t } = useTranslation();
  const updateNodeInternals = useUpdateNodeInternals();
  const handles = JSON.stringify(data.outputs.map((port) => port.name));

  useEffect(() => {
    updateNodeInternals(id);
  }, [handles, id, updateNodeInternals]);

  return (
    <div
      className={cn(
        'min-w-56 rounded-lg border bg-card py-3 shadow-sm',
        selected && 'ring-2 ring-ring'
      )}
    >
      <div className="relative flex items-center gap-2 px-4 font-medium">
        <Handle
          className="size-3 border-0 bg-primary shadow-none"
          id="node:input"
          position={Position.Left}
          type="target"
        />
        <LogOutIcon className="size-4 text-primary" />
        {t('workflow.end')}
      </div>
      <p className="px-4 text-xs text-muted-foreground">{t('workflow.completion')}</p>
      <p className={cn('px-4 text-xs', statusTextClass(data.status))} role="status">
        {data.status}
      </p>
      <div className="mt-3 flex flex-col gap-3">
        {data.outputs.map((port) => (
          <div key={port.name} className="relative px-4 text-xs">
            {port.name} · {port.type}
          </div>
        ))}
      </div>
      <p className="mt-3 px-4 text-xs text-muted-foreground">{t('workflow.configureOutputs')}</p>
    </div>
  );
}

const NODE_TYPES = { end: EndNode, runnable: RunnableNode, start: StartNode };

export function WorkflowCanvas(props: WorkflowCanvasProps) {
  const { backHref, catalog, graph: initialGraph, runs: initialRuns } = props;
  const { i18n, t } = useTranslation();
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const [graph, setGraph] = useState<WorkflowGraph>(initialGraph);
  const [isSaving, setIsSaving] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [sidebarMode, setSidebarMode] = useState<'board' | 'toolbox'>('board');
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isErrorsOpen, setIsErrorsOpen] = useState(false);
  const [isRunsOpen, setIsRunsOpen] = useState(false);
  const [isNodeDetailsOpen, setIsNodeDetailsOpen] = useState(false);
  const [selectedNodeId, setSelectedNodeId] = useState<string>();
  const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance<CanvasNode>>();
  const [toolboxQuery, setToolboxQuery] = useState('');
  const [error, setError] = useState('');
  const [savedGraph, setSavedGraph] = useState(() => JSON.stringify(initialGraph));
  const [nodeStatuses, setNodeStatuses] = useState<Record<string, string>>(() => {
    const latestRun = initialRuns[0];

    if (!latestRun) {
      return {};
    }

    return {
      [initialGraph.output.id]: latestRun.status,
      [initialGraph.start.id]: latestRun.status,
      ...Object.fromEntries(
        latestRun.nodeRuns.map((nodeRun) => [nodeRun.workflowNodeId, nodeRun.status])
      ),
    };
  });
  const nodeTypes = useRef(NODE_TYPES).current;
  const [workflowRuns, setWorkflowRuns] = useState<readonly WorkflowRunHistory[]>(initialRuns);
  const { initialViewport, scheduleViewportSave } = useWorkflowViewport(initialGraph.id);
  const { runnerId } = useRunner();
  const dirty = savedGraph !== JSON.stringify(graph);
  const selectedNode = graph.nodes.find((node) => node.id === selectedNodeId);
  const selectedRunnable = selectedNode
    ? catalog.find(
        (item) => item.id === selectedNode.runnableId && item.type === selectedNode.runnableType
      )
    : undefined;
  const isStartSelected = isNodeDetailsOpen && selectedNodeId === graph.start.id;
  const isEndSelected = isNodeDetailsOpen && selectedNodeId === graph.output.id;
  const boardItems = [
    { id: graph.start.id, label: t('workflow.start'), type: 'start' },
    ...graph.nodes.map((node) => {
      const runnable = catalog.find(
        (item) => item.id === node.runnableId && item.type === node.runnableType
      );

      return {
        id: node.id,
        label: runnable?.name ?? t('workflow.missingRunnable'),
        type: node.runnableType,
      };
    }),
    { id: graph.output.id, label: t('workflow.end'), type: 'end' },
  ];
  const errors = useMemo(() => getWorkflowErrors(graph, catalog), [catalog, graph]);

  function getRunStatusLabel(status: string) {
    const statusLabels: Record<string, string> = {
      failed: t('runs.statusFailed'),
      preparing: t('runs.statusPreparing'),
      running: t('runs.statusRunning'),
      succeeded: t('runs.statusSucceeded'),
      waiting: t('workflow.statusWaiting'),
    };

    return statusLabels[status] ?? status;
  }

  function showRunOnBoard(run: WorkflowRunHistory) {
    setNodeStatuses({
      [graph.output.id]: run.status,
      [graph.start.id]: run.status,
      ...Object.fromEntries(
        run.nodeRuns.map((nodeRun) => [nodeRun.workflowNodeId, nodeRun.status])
      ),
    });
    setIsRunsOpen(false);
  }

  const nodes = useMemo<CanvasNode[]>(() => {
    const runnableNodes = graph.nodes.map((node) => {
      const runnable = catalog.find(
        (item) => item.id === node.runnableId && item.type === node.runnableType
      );

      return {
        data: {
          inputErrors: (runnable?.inputs ?? []).flatMap((input) => {
            const hasConnection = graph.connections.some(
              (connection) =>
                connection.targetNodeId === node.id && connection.targetInputName === input.name
            );
            const hasFixedValue = Object.hasOwn(node.fixedInputs, input.name);
            const hasStartBinding = Boolean(node.inputBindings[input.name]);

            return input.required && !hasConnection && !hasFixedValue && !hasStartBinding
              ? [input.name]
              : [];
          }),
          inputSources: Object.fromEntries(
            (runnable?.inputs ?? []).flatMap((input) => {
              const connection = graph.connections.find(
                (item) => item.targetNodeId === node.id && item.targetInputName === input.name
              );

              if (connection) {
                const sourceNode = graph.nodes.find((item) => item.id === connection.sourceNodeId);
                const source = sourceNode
                  ? catalog.find(
                      (item) =>
                        item.id === sourceNode.runnableId && item.type === sourceNode.runnableType
                    )
                  : undefined;

                return [
                  [
                    input.name,
                    `${source?.name ?? t('workflow.missingRunnable')} · ${
                      connection.sourceOutputName || t('workflow.output')
                    }`,
                  ],
                ];
              }

              if (Object.hasOwn(node.fixedInputs, input.name)) {
                return [[input.name, t('workflow.fixedValue')]];
              }

              const startBinding = node.inputBindings[input.name];
              return startBinding ? [[input.name, `${t('workflow.start')} · ${startBinding}`]] : [];
            })
          ),
          inputs: runnable?.inputs ?? [],
          label: runnable?.name ?? node.runnableId,
          outputs: runnable?.outputs ?? [],
          runnableType: node.runnableType,
          status: nodeStatuses[node.id] ?? t('workflow.notRun'),
          type: 'runnable' as const,
        },
        id: node.id,
        position: { x: node.positionX, y: node.positionY },
        selected: isNodeDetailsOpen && selectedNodeId === node.id,
        type: 'runnable' as const,
      };
    });

    return [
      {
        data: {
          inputSources: {},
          inputs: [],
          label: t('workflow.start'),
          outputs: graph.inputs,
          status: nodeStatuses[graph.start.id] ?? t('workflow.ready'),
          type: 'start',
        },
        id: graph.start.id,
        position: { x: graph.start.positionX, y: graph.start.positionY },
        selected: isNodeDetailsOpen && selectedNodeId === graph.start.id,
        type: 'start',
      },
      ...runnableNodes,
      {
        data: {
          inputSources: {},
          inputs: [],
          label: t('workflow.end'),
          outputs: graph.outputs,
          status: nodeStatuses[graph.output.id] ?? t('workflow.ready'),
          type: 'end',
        },
        id: graph.output.id,
        position: { x: graph.output.positionX, y: graph.output.positionY },
        selected: isNodeDetailsOpen && selectedNodeId === graph.output.id,
        type: 'end',
      },
    ];
  }, [catalog, graph, isNodeDetailsOpen, nodeStatuses, selectedNodeId, t]);
  const [canvasNodes, setCanvasNodes, handleNodesChange] = useNodesState<CanvasNode>(nodes);

  useEffect(() => {
    setCanvasNodes(nodes);
  }, [nodes, setCanvasNodes]);

  const edges = useMemo(
    () => [
      ...graph.start.targets.map((target) => ({
        id: `${graph.start.id}:${target}`,
        source: graph.start.id,
        sourceHandle: 'start:flow',
        target,
        targetHandle: 'node:input',
        type: 'smoothstep',
      })),
      ...graph.connections.map((connection) => ({
        id: connection.id,
        source: connection.sourceNodeId,
        sourceHandle: 'node:output',
        target: connection.targetNodeId,
        targetHandle: 'node:input',
        type: 'smoothstep',
      })),
      ...graph.output.sources.map((source) => ({
        id: `${source}:${graph.output.id}`,
        source,
        sourceHandle: 'node:output',
        target: graph.output.id,
        targetHandle: 'node:input',
        type: 'smoothstep',
      })),
    ],
    [graph.connections, graph.output.id, graph.output.sources, graph.start.id, graph.start.targets]
  );

  function addRunnable(runnable: WorkflowRunnable, position?: Readonly<{ x: number; y: number }>) {
    const nodeId = crypto.randomUUID();
    const offset = graph.nodes.length * 36;

    setGraph((current) => ({
      ...current,
      nodes: [
        ...current.nodes,
        {
          fixedInputs: {},
          id: nodeId,
          inputBindings: {},
          positionX: position?.x ?? 360 + offset,
          positionY: position?.y ?? 240 + offset,
          runnableId: runnable.id,
          runnableType: runnable.type,
        },
      ],
    }));
    openNodeDetails(nodeId);
  }

  function closeNodeDetails() {
    setIsNodeDetailsOpen(false);
    setSelectedNodeId(undefined);
  }

  function openNodeDetails(nodeId: string) {
    setSelectedNodeId(nodeId);
    setIsNodeDetailsOpen(true);
  }

  async function persistWorkflow() {
    setError('');
    setIsSaving(true);

    try {
      await saveWorkflow(graph);

      setSavedGraph(JSON.stringify(graph));
      await queryClient.invalidateQueries({ queryKey: queryKeys.workflows });
      await queryClient.invalidateQueries({ queryKey: queryKeys.workflowCatalog });
      await queryClient.invalidateQueries({ queryKey: queryKeys.workflow(graph.id) });
      router.replace(`/workflows/${graph.id}`);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : String(saveError));
    } finally {
      setIsSaving(false);
    }
  }

  function connect(connection: Connection) {
    if (!connection.source || !connection.target || connection.source === connection.target) {
      return;
    }

    if (connection.source === graph.start.id) {
      setGraph((current) => ({
        ...current,
        start: { ...current.start, targets: [connection.target!] },
      }));
      return;
    }

    if (connection.target === graph.output.id) {
      setGraph((current) => ({
        ...current,
        output: { ...current.output, sources: [connection.source!] },
      }));
      return;
    }

    setGraph((current) => ({
      ...current,
      connections: [
        ...current.connections.filter(
          (item) =>
            item.sourceNodeId !== connection.source && item.targetNodeId !== connection.target
        ),
        {
          id: crypto.randomUUID(),
          sourceNodeId: connection.source!,
          sourceOutputName: '',
          targetInputName: '',
          targetNodeId: connection.target!,
        },
      ],
    }));
  }

  async function runWorkflow(
    suppliedValues: Record<string, boolean | number | string>,
    suppliedFiles: Record<string, File>
  ) {
    const suppliedInputs = Object.fromEntries(
      graph.inputs.flatMap((input) => {
        const value = suppliedValues[input.name];

        if (value === undefined) {
          return [];
        }

        return [[input.name, input.type === 'number' && value !== '' ? Number(value) : value]];
      })
    );
    const workflowRun = await createWorkflowRun({
      inputs: suppliedInputs,
      workflowId: graph.id,
    });

    await queryClient.invalidateQueries({ queryKey: queryKeys.workflowStatuses });

    let activeNodeId: string | undefined;
    const runId = workflowRun.id;
    const startedAt = workflowRun.startedAt;

    setIsRunning(true);
    setNodeStatuses({ [graph.start.id]: 'running', [graph.output.id]: 'waiting' });
    setWorkflowRuns((current) => [
      {
        error: '',
        finishedAt: null,
        id: runId,
        inputs: suppliedInputs,
        logs: '',
        nodeRuns: [],
        outputs: {},
        startedAt,
        status: 'running',
      },
      ...current,
    ]);

    try {
      const logs: string[] = [];
      const executeGraph = async (
        workflowGraph: WorkflowGraph,
        workflowInputs: Record<string, boolean | number | string>,
        workflowFiles: Record<string, File>
      ): Promise<Record<string, unknown>> => {
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

          activeNodeId = node.id;

          const inputs: Record<string, boolean | number | string> = { ...node.fixedInputs };
          const files: Record<string, File> = {};

          for (const [inputName, publicInputName] of Object.entries(node.inputBindings)) {
            const value = workflowInputs[publicInputName];
            if (
              typeof value === 'boolean' ||
              typeof value === 'number' ||
              typeof value === 'string'
            ) {
              inputs[inputName] = value;
            }
            if (workflowFiles[publicInputName]) {
              files[inputName] = workflowFiles[publicInputName];
            }
          }

          for (const connection of workflowGraph.connections.filter(
            (item) => item.targetNodeId === node.id
          )) {
            const value = completedOutputs.get(connection.sourceNodeId)?.[
              connection.sourceOutputName
            ];
            if (
              typeof value === 'boolean' ||
              typeof value === 'number' ||
              typeof value === 'string'
            ) {
              inputs[connection.targetInputName] = value;
            }
            if (isAutomationArtifactReference(value)) {
              files[connection.targetInputName] = await getAutomationArtifactFile(value);
            }
          }

          setNodeStatuses((current) => ({ ...current, [node.id]: 'running' }));
          const persistedNodeRun = await createWorkflowNodeRun({
            inputs,
            nodeName: runnable.name,
            workflowNodeId: node.id,
            workflowRunId: runId,
          });

          const nodeRun = {
            error: '',
            finishedAt: null,
            id: persistedNodeRun.id,
            inputs,
            logs: '',
            nodeName: runnable.name,
            outputs: {},
            startedAt: persistedNodeRun.startedAt,
            status: 'running',
            workflowNodeId: node.id,
          } satisfies WorkflowRunHistory['nodeRuns'][number];
          setWorkflowRuns((current) =>
            current.map((run) =>
              run.id === runId ? { ...run, nodeRuns: [...run.nodeRuns, nodeRun] } : run
            )
          );

          try {
            const result =
              runnable.type === 'workflow'
                ? runnable.graph
                  ? { logs: '', outputs: await executeGraph(runnable.graph, inputs, files) }
                  : (() => {
                      throw new Error(`Unable to run ${runnable.name}.`);
                    })()
                : runnable.script
                  ? await runAutomationInBrowser({
                      files,
                      inputs,
                      libraries: runnable.libraries ?? [],
                      outputSchema: runnable.outputs,
                      runnerId,
                      script: runnable.script,
                    })
                  : (() => {
                      throw new Error(`Unable to run ${runnable.name}.`);
                    })();
            const outputs =
              result.outputs && typeof result.outputs === 'object' && !Array.isArray(result.outputs)
                ? (result.outputs as Record<string, unknown>)
                : {};
            const nodeLogs = result.logs;
            if (nodeLogs) {
              logs.push(`${runnable.name}\n${nodeLogs}`);
            }

            await completeWorkflowNodeRun({
              error: '',
              logs: nodeLogs,
              nodeRunId: nodeRun.id,
              outputs,
              status: 'succeeded',
            });

            setWorkflowRuns((current) =>
              current.map((run) =>
                run.id === runId
                  ? {
                      ...run,
                      nodeRuns: run.nodeRuns.map((item) =>
                        item.id === nodeRun.id
                          ? {
                              ...item,
                              finishedAt: new Date(),
                              logs: nodeLogs,
                              outputs,
                              status: 'succeeded',
                            }
                          : item
                      ),
                    }
                  : run
              )
            );

            completedOutputs.set(node.id, outputs);
            pendingNodes.delete(node.id);
            setNodeStatuses((current) => ({ ...current, [node.id]: 'succeeded' }));
          } catch (nodeError) {
            const message = nodeError instanceof Error ? nodeError.message : String(nodeError);
            const nodeLogs = nodeError instanceof AutomationExecutionError ? nodeError.logs : '';
            await completeWorkflowNodeRun({
              error: message,
              logs: nodeLogs,
              nodeRunId: nodeRun.id,
              outputs: {},
              status: 'failed',
            });
            setWorkflowRuns((current) =>
              current.map((run) =>
                run.id === runId
                  ? {
                      ...run,
                      nodeRuns: run.nodeRuns.map((item) =>
                        item.id === nodeRun.id
                          ? {
                              ...item,
                              error: message,
                              finishedAt: new Date(),
                              logs: nodeLogs,
                              status: 'failed',
                            }
                          : item
                      ),
                    }
                  : run
              )
            );
            throw nodeError;
          }
        }

        return Object.fromEntries(
          workflowGraph.outputs.map((output) => {
            const fixedValue = workflowGraph.output.fixedOutputs[output.name];
            const binding = workflowGraph.outputBindings[output.name];
            const value = Object.hasOwn(workflowGraph.output.fixedOutputs, output.name)
              ? fixedValue
              : completedOutputs.get(binding?.nodeId ?? '')?.[binding?.outputName ?? ''];

            return [output.name, value ?? null];
          })
        );
      };

      const outputs = await executeGraph(graph, suppliedInputs, suppliedFiles);
      await completeWorkflowRun({
        error: '',
        logs: logs.join('\n\n'),
        outputs,
        runId,
        status: 'succeeded',
      });

      setNodeStatuses((current) => ({
        ...current,
        [graph.output.id]: 'succeeded',
        [graph.start.id]: 'succeeded',
      }));
      setWorkflowRuns((current) =>
        current.map((run) =>
          run.id === runId
            ? {
                ...run,
                finishedAt: new Date(),
                logs: logs.join('\n\n'),
                outputs,
                status: 'succeeded',
              }
            : run
        )
      );
    } catch (runError) {
      const message =
        runError instanceof AutomationExecutionError || runError instanceof Error
          ? runError.message
          : String(runError);
      setNodeStatuses((current) => ({
        ...current,
        ...(activeNodeId ? { [activeNodeId]: 'failed' } : {}),
        [graph.output.id]: 'failed',
      }));
      await completeWorkflowRun({
        error: message,
        logs: runError instanceof AutomationExecutionError ? runError.logs : '',
        outputs: {},
        runId,
        status: 'failed',
      });
      setWorkflowRuns((current) =>
        current.map((run) =>
          run.id === runId
            ? { ...run, error: message, finishedAt: new Date(), status: 'failed' }
            : run
        )
      );
      throw new Error(message);
    } finally {
      setIsRunning(false);
      await queryClient.invalidateQueries({ queryKey: queryKeys.workflowStatuses });
      await queryClient.invalidateQueries({ queryKey: queryKeys.workflow(graph.id) });
    }
  }

  return (
    <main className="flex h-full min-h-0 flex-col">
      <header className="flex flex-wrap items-center gap-3 border-b p-3">
        {backHref && (
          <Button type="button" variant="outline" onClick={() => router.push(backHref)}>
            <ArrowLeftIcon data-icon="inline-start" />
            {t('common.back')}
          </Button>
        )}
        <Input
          aria-label={t('workflow.name')}
          className="max-w-64"
          value={graph.name}
          onChange={(event) => setGraph((current) => ({ ...current, name: event.target.value }))}
        />
        <span className="text-xs text-muted-foreground">
          {dirty ? t('workflow.unsaved') : t('workflow.saved')}
        </span>
        <Button type="button" variant="outline" onClick={() => setIsDetailsOpen(true)}>
          {t('workflow.details')}
        </Button>
        <Button type="button" variant="outline" onClick={() => setIsRunsOpen(true)}>
          {t('workflow.runs')} ({workflowRuns.length})
        </Button>
        <Button
          disabled={errors.length > 0 || isSaving || !dirty}
          type="button"
          onClick={() => void persistWorkflow()}
        >
          {t('workflow.save')}
        </Button>
        <RunWorkflowDialog
          defaultOpen={searchParams.get('run') === 'true'}
          inputs={graph.inputs}
          isRunning={isRunning}
          onRun={runWorkflow}
        />
        {errors.length > 0 && (
          <Popover open={isErrorsOpen} onOpenChange={setIsErrorsOpen}>
            <PopoverTrigger
              render={
                <Button
                  aria-label={t('workflow.showErrors', { count: errors.length })}
                  size="icon"
                  type="button"
                  variant="ghost"
                />
              }
            >
              <TriangleAlertIcon className="text-destructive" />
            </PopoverTrigger>
            <PopoverContent align="start" className="w-96 p-4">
              <h2 className="font-medium">
                {t('workflow.issuesToResolve', { count: errors.length })}
              </h2>
              <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                {errors.map((issue) => (
                  <li key={`${issue.key}:${JSON.stringify(issue.values)}`}>
                    {t(issue.key, issue.values ?? {})}
                  </li>
                ))}
              </ul>
            </PopoverContent>
          </Popover>
        )}
      </header>
      {error && <p className="px-4 py-2 text-sm text-destructive">{error}</p>}
      <div className="relative flex min-h-80 flex-1">
        <div className="min-w-0 flex-1">
          <ReactFlow<CanvasNode>
            defaultViewport={initialViewport ?? { x: 0, y: 0, zoom: 1 }}
            edges={edges}
            fitView={!initialViewport}
            fitViewOptions={{ maxZoom: 1, padding: 0.2 }}
            nodes={canvasNodes}
            nodeTypes={nodeTypes}
            onConnect={connect}
            onDragOver={(event) => {
              event.preventDefault();
              event.dataTransfer.dropEffect = 'copy';
            }}
            onDrop={(event) => {
              event.preventDefault();

              try {
                const item = JSON.parse(event.dataTransfer.getData('application/eva-runnable')) as {
                  id: string;
                  type: WorkflowRunnable['type'];
                };
                const runnable = catalog.find(
                  (candidate) => candidate.id === item.id && candidate.type === item.type
                );
                const position = reactFlowInstance?.screenToFlowPosition({
                  x: event.clientX,
                  y: event.clientY,
                });

                if (runnable) {
                  addRunnable(runnable, position);
                }
              } catch {
                setError(t('workflow.addRunnableError'));
              }
            }}
            onInit={(instance) => setReactFlowInstance(instance)}
            onNodeClick={(_, node) => openNodeDetails(node.id)}
            onNodesChange={handleNodesChange}
            onMove={(_, viewport) => scheduleViewportSave(viewport)}
            onPaneClick={() => {
              closeNodeDetails();
            }}
            onNodeDragStop={(_, node) => {
              setGraph((current) => {
                if (node.id === current.start.id) {
                  return {
                    ...current,
                    start: {
                      ...current.start,
                      positionX: node.position.x,
                      positionY: node.position.y,
                    },
                  };
                }
                if (node.id === current.output.id) {
                  return {
                    ...current,
                    output: {
                      ...current.output,
                      positionX: node.position.x,
                      positionY: node.position.y,
                    },
                  };
                }

                return {
                  ...current,
                  nodes: current.nodes.map((item) =>
                    item.id === node.id
                      ? {
                          ...item,
                          positionX: node.position.x,
                          positionY: node.position.y,
                        }
                      : item
                  ),
                };
              });
            }}
            onNodesDelete={(deletedNodes) => {
              const deletedIds = new Set(deletedNodes.map((node) => node.id));
              setGraph((current) => ({
                ...current,
                connections: current.connections.filter(
                  (connection) =>
                    !deletedIds.has(connection.sourceNodeId) &&
                    !deletedIds.has(connection.targetNodeId)
                ),
                nodes: current.nodes.filter((node) => !deletedIds.has(node.id)),
                start: {
                  ...current.start,
                  targets: current.start.targets.filter((target) => !deletedIds.has(target)),
                },
              }));
            }}
          >
            <Background />
            <Controls
              className="!bottom-4 !left-4 !overflow-hidden !rounded-md !border !border-border !bg-background !shadow-sm [--xy-controls-button-background-color:var(--background)] [--xy-controls-button-background-color-hover:var(--muted)] [--xy-controls-button-color:var(--foreground)] [&_button]:!size-8 [&_button]:!border-0 [&_button]:!border-b [&_button]:!border-border [&_button:last-child]:!border-b-0 [&_button_svg]:!fill-foreground"
              showInteractive={false}
            />
          </ReactFlow>
          {isStartSelected && (
            <StartDetailsPanel
              graph={graph}
              onClose={closeNodeDetails}
              onInputsChange={(inputs) => setGraph((current) => ({ ...current, inputs }))}
            />
          )}
          {isEndSelected && (
            <EndDetailsPanel
              catalog={catalog}
              graph={graph}
              onClose={closeNodeDetails}
              onFixedOutputsChange={(fixedOutputs) =>
                setGraph((current) => ({
                  ...current,
                  output: { ...current.output, fixedOutputs },
                }))
              }
              onOutputBindingsChange={(outputBindings) =>
                setGraph((current) => ({ ...current, outputBindings }))
              }
              onOutputsChange={(outputs) =>
                setGraph((current) => configureWorkflowOutputs(current, outputs))
              }
            />
          )}
          {isNodeDetailsOpen && selectedNode && (
            <aside className="absolute inset-y-0 right-0 z-20 flex w-96 flex-col gap-4 overflow-auto border-l bg-background p-4 shadow-lg">
              <div className="flex items-center justify-between gap-3">
                <h2 className="font-medium">{selectedRunnable?.name ?? selectedNode.runnableId}</h2>
                <Button
                  aria-label={t('common.close')}
                  size="icon"
                  type="button"
                  variant="ghost"
                  onClick={closeNodeDetails}
                >
                  <ArrowLeftIcon />
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">{t('workflow.connectInput')}</p>
              {selectedNode && selectedRunnable && (
                <div className="flex flex-col gap-4">
                  {selectedRunnable.inputs.map((input) => {
                    const connection = graph.connections.find(
                      (item) =>
                        item.targetNodeId === selectedNode.id && item.targetInputName === input.name
                    );
                    const sourceOptions = [
                      ...(graph.start.targets.includes(selectedNode.id)
                        ? graph.inputs
                            .filter((port) => port.type === input.type)
                            .map((port) => ({
                              label: `${t('workflow.start')} · ${port.name}`,
                              value: `start:${port.name}`,
                            }))
                        : []),
                      ...graph.connections
                        .filter(
                          (item) =>
                            item.targetNodeId === selectedNode.id &&
                            item.sourceNodeId !== graph.start.id
                        )
                        .flatMap((item) => {
                          const sourceNode = graph.nodes.find(
                            (node) => node.id === item.sourceNodeId
                          );
                          const runnable = sourceNode
                            ? catalog.find(
                                (candidate) =>
                                  candidate.id === sourceNode.runnableId &&
                                  candidate.type === sourceNode.runnableType
                              )
                            : undefined;

                          return (runnable?.outputs ?? [])
                            .filter((output) => output.type === input.type)
                            .map((output) => ({
                              label: `${runnable?.name ?? t('workflow.missingRunnable')} · ${output.name}`,
                              value: JSON.stringify({
                                nodeId: item.sourceNodeId,
                                outputName: output.name,
                              }),
                            }));
                        }),
                    ];
                    const uniqueSourceOptions = Array.from(
                      new Map(sourceOptions.map((option) => [option.value, option])).values()
                    );
                    const fixedValue = selectedNode.fixedInputs[input.name];
                    const inputMode = Object.hasOwn(selectedNode.fixedInputs, input.name)
                      ? 'fixed'
                      : 'connection';
                    const connectedValue = connection?.sourceOutputName
                      ? JSON.stringify({
                          nodeId: connection.sourceNodeId,
                          outputName: connection.sourceOutputName,
                        })
                      : selectedNode.inputBindings[input.name]
                        ? `start:${selectedNode.inputBindings[input.name]}`
                        : null;

                    return (
                      <div
                        key={input.name}
                        className="flex flex-col gap-2 border-t pt-4 first:border-t-0 first:pt-0"
                      >
                        <p className="text-sm font-medium">
                          {input.name}
                          {input.required ? ' *' : ''} · {input.type}
                        </p>
                        <p className="text-xs text-muted-foreground">{input.description}</p>
                        <Select
                          items={[
                            { label: t('workflow.connectionInput'), value: 'connection' },
                            { label: t('workflow.fixedValue'), value: 'fixed' },
                          ]}
                          value={inputMode}
                          onValueChange={(value) => {
                            const fixedInputs = { ...selectedNode.fixedInputs };
                            const inputBindings = { ...selectedNode.inputBindings };
                            const connections = graph.connections.filter(
                              (item) =>
                                !(
                                  item.targetNodeId === selectedNode.id &&
                                  item.targetInputName === input.name
                                )
                            );
                            delete fixedInputs[input.name];
                            delete inputBindings[input.name];

                            if (value === 'fixed') {
                              fixedInputs[input.name] =
                                input.type === 'boolean' ? false : input.type === 'number' ? 0 : '';
                            }

                            setGraph((current) => ({
                              ...current,
                              connections,
                              nodes: current.nodes.map((node) =>
                                node.id === selectedNode.id
                                  ? { ...node, fixedInputs, inputBindings }
                                  : node
                              ),
                            }));
                          }}
                        >
                          <SelectTrigger
                            aria-label={t('workflow.sourceForInput', { name: input.name })}
                            className="h-9 w-full"
                          >
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectGroup>
                              <SelectItem value="connection">
                                {t('workflow.connectionInput')}
                              </SelectItem>
                              <SelectItem value="fixed">{t('workflow.fixedValue')}</SelectItem>
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                        {inputMode === 'fixed' ? (
                          input.type === 'boolean' ? (
                            <Select
                              items={[
                                { label: t('workflow.true'), value: 'true' },
                                { label: t('workflow.false'), value: 'false' },
                              ]}
                              value={String(fixedValue)}
                              onValueChange={(value) => {
                                setGraph((current) => ({
                                  ...current,
                                  nodes: current.nodes.map((node) =>
                                    node.id === selectedNode.id
                                      ? {
                                          ...node,
                                          fixedInputs: {
                                            ...node.fixedInputs,
                                            [input.name]: value === 'true',
                                          },
                                        }
                                      : node
                                  ),
                                }));
                              }}
                            >
                              <SelectTrigger aria-label={input.name} className="h-9 w-full">
                                <SelectValue placeholder={t('workflow.selectValue')} />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectGroup>
                                  <SelectItem value="true">{t('workflow.true')}</SelectItem>
                                  <SelectItem value="false">{t('workflow.false')}</SelectItem>
                                </SelectGroup>
                              </SelectContent>
                            </Select>
                          ) : (
                            <Input
                              aria-label={input.name}
                              step={input.type === 'number' ? 'any' : undefined}
                              type={input.type === 'number' ? 'number' : 'text'}
                              value={
                                typeof fixedValue === 'string' || typeof fixedValue === 'number'
                                  ? fixedValue
                                  : ''
                              }
                              onChange={(event) => {
                                const value =
                                  input.type === 'number'
                                    ? event.target.value === ''
                                      ? ''
                                      : Number(event.target.value)
                                    : event.target.value;
                                setGraph((current) => ({
                                  ...current,
                                  nodes: current.nodes.map((node) =>
                                    node.id === selectedNode.id
                                      ? {
                                          ...node,
                                          fixedInputs: { ...node.fixedInputs, [input.name]: value },
                                        }
                                      : node
                                  ),
                                }));
                              }}
                            />
                          )
                        ) : (
                          <Select
                            items={uniqueSourceOptions}
                            value={connectedValue}
                            onValueChange={(value) => {
                              const inputBindings = { ...selectedNode.inputBindings };
                              const connections = graph.connections.filter(
                                (item) =>
                                  !(
                                    item.targetNodeId === selectedNode.id &&
                                    item.targetInputName === input.name
                                  )
                              );

                              delete inputBindings[input.name];

                              if (value?.startsWith('start:')) {
                                inputBindings[input.name] = value.slice(6);
                              } else if (value) {
                                const source = JSON.parse(value) as {
                                  nodeId: string;
                                  outputName: string;
                                };
                                connections.push({
                                  id: crypto.randomUUID(),
                                  sourceNodeId: source.nodeId,
                                  sourceOutputName: source.outputName,
                                  targetInputName: input.name,
                                  targetNodeId: selectedNode.id,
                                });
                              }

                              setGraph((current) => ({
                                ...current,
                                connections,
                                nodes: current.nodes.map((node) =>
                                  node.id === selectedNode.id ? { ...node, inputBindings } : node
                                ),
                              }));
                            }}
                          >
                            <SelectTrigger
                              aria-label={t('workflow.connectedInputFor', { name: input.name })}
                              className="h-9 w-full"
                            >
                              <SelectValue placeholder={t('workflow.selectConnectedInput')} />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectGroup>
                                {uniqueSourceOptions.map((option) => (
                                  <SelectItem key={option.value} value={option.value}>
                                    {option.label}
                                  </SelectItem>
                                ))}
                                {uniqueSourceOptions.length === 0 && (
                                  <p className="px-2 py-1.5 text-sm text-muted-foreground">
                                    {t('workflow.noCompatibleInputs')}
                                  </p>
                                )}
                              </SelectGroup>
                            </SelectContent>
                          </Select>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
              {selectedNode && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setGraph((current) => ({
                      ...current,
                      connections: current.connections.filter(
                        (connection) =>
                          connection.sourceNodeId !== selectedNode.id &&
                          connection.targetNodeId !== selectedNode.id
                      ),
                      nodes: current.nodes.filter((node) => node.id !== selectedNode.id),
                    }));
                    closeNodeDetails();
                  }}
                >
                  {t('common.delete')}
                </Button>
              )}
            </aside>
          )}
        </div>
        <aside className="flex w-96 shrink-0 flex-col overflow-auto border-l bg-background">
          <div className="grid grid-cols-2 gap-2 border-b p-2">
            <Button
              type="button"
              variant={sidebarMode === 'board' ? 'secondary' : 'ghost'}
              onClick={() => setSidebarMode('board')}
            >
              {t('workflow.board')}
            </Button>
            <Button
              type="button"
              variant={sidebarMode === 'toolbox' ? 'secondary' : 'ghost'}
              onClick={() => setSidebarMode('toolbox')}
            >
              {t('workflow.toolbox')}
            </Button>
          </div>
          {sidebarMode === 'toolbox' ? (
            <>
              <div className="flex flex-col gap-3 border-b p-4">
                <p className="text-xs text-muted-foreground">{t('workflow.toolboxHint')}</p>
                <Input
                  aria-label={t('workflow.searchAutomations')}
                  placeholder={t('workflow.searchAutomations')}
                  value={toolboxQuery}
                  onChange={(event) => setToolboxQuery(event.target.value)}
                />
              </div>
              <div className="flex flex-col gap-5 p-4">
                {(['automation', 'workflow'] as const).map((type) => {
                  const items = catalog.filter(
                    (item) =>
                      item.type === type &&
                      item.name.toLowerCase().includes(toolboxQuery.trim().toLowerCase())
                  );

                  return (
                    <section key={type} className="flex flex-col gap-2">
                      <h3 className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                        {type === 'automation'
                          ? t('workflow.automations')
                          : t('workflow.workflows')}
                      </h3>
                      {items.map((item) => (
                        <Button
                          key={item.id}
                          className="h-auto justify-start py-2.5"
                          draggable
                          type="button"
                          variant="outline"
                          onDragStart={(event) => {
                            event.dataTransfer.effectAllowed = 'copy';
                            event.dataTransfer.setData(
                              'application/eva-runnable',
                              JSON.stringify({ id: item.id, type: item.type })
                            );
                          }}
                          onClick={() => addRunnable(item)}
                        >
                          {type === 'automation' ? (
                            <BotIcon data-icon="inline-start" />
                          ) : (
                            <WorkflowIcon data-icon="inline-start" />
                          )}
                          {item.name}
                        </Button>
                      ))}
                      {items.length === 0 && (
                        <p className="rounded-md border border-dashed px-3 py-4 text-xs text-muted-foreground">
                          {t('workflow.noItems', { type })}
                        </p>
                      )}
                    </section>
                  );
                })}
              </div>
            </>
          ) : (
            <div className="flex flex-col gap-5 p-4">
              {(['flow', 'automation', 'workflow'] as const).map((type) => {
                const items = boardItems.filter((item) =>
                  type === 'flow'
                    ? item.type === 'start' || item.type === 'end'
                    : item.type === type
                );
                const label =
                  type === 'flow'
                    ? t('workflow.flow')
                    : type === 'automation'
                      ? t('workflow.automations')
                      : t('workflow.workflows');

                return (
                  <section key={type} className="flex flex-col gap-2">
                    <h3 className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                      {label}
                    </h3>
                    {items.map((item) => (
                      <Button
                        key={item.id}
                        className="h-auto justify-start py-2.5"
                        type="button"
                        variant="outline"
                        onClick={() => openNodeDetails(item.id)}
                      >
                        {item.type === 'automation' ? (
                          <BotIcon data-icon="inline-start" />
                        ) : item.type === 'workflow' ? (
                          <WorkflowIcon data-icon="inline-start" />
                        ) : item.type === 'start' ? (
                          <PlayIcon data-icon="inline-start" />
                        ) : (
                          <LogOutIcon data-icon="inline-start" />
                        )}
                        {item.label}
                      </Button>
                    ))}
                    {items.length === 0 && type === 'automation' && (
                      <p className="rounded-lg border border-dashed px-2.5 py-2.5 text-sm text-muted-foreground">
                        {t('workflow.noAutomationsOnBoard')}
                      </p>
                    )}
                    {items.length === 0 && type === 'workflow' && (
                      <p className="rounded-lg border border-dashed px-2.5 py-2.5 text-sm text-muted-foreground">
                        {t('workflow.noWorkflowsOnBoard')}
                      </p>
                    )}
                  </section>
                );
              })}
            </div>
          )}
        </aside>
      </div>
      <Sheet open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>{t('workflow.details')}</SheetTitle>
            <SheetDescription>{t('workflow.description')}</SheetDescription>
          </SheetHeader>
          <div className="px-4">
            <Textarea
              aria-label={t('workflow.description')}
              value={graph.description}
              onChange={(event) =>
                setGraph((current) => ({ ...current, description: event.target.value }))
              }
            />
          </div>
        </SheetContent>
      </Sheet>
      <Sheet open={isRunsOpen} onOpenChange={setIsRunsOpen}>
        <SheetContent side="right">
          <SheetHeader>
            <SheetTitle>{t('workflow.runs')}</SheetTitle>
            <SheetDescription>{t('workflow.runsDescription')}</SheetDescription>
          </SheetHeader>
          <div className="flex flex-col gap-3 px-4 pb-6">
            {workflowRuns.length === 0 ? (
              <p className="text-sm text-muted-foreground">{t('runs.noRuns')}</p>
            ) : (
              workflowRuns.map((run) => (
                <details key={run.id}>
                  <summary className="cursor-pointer text-sm">
                    {run.startedAt.toLocaleString(i18n.language)} ·{' '}
                    <span className={statusTextClass(run.status)}>
                      {getRunStatusLabel(run.status)}
                    </span>
                  </summary>
                  <div className="flex flex-col gap-4 py-3 text-sm">
                    <Button type="button" variant="outline" onClick={() => showRunOnBoard(run)}>
                      {t('workflow.showOnBoard')}
                    </Button>
                    <p>
                      {getRunStatusLabel(run.status)} ·{' '}
                      {run.startedAt.toLocaleString(i18n.language)}
                    </p>
                    {run.error && (
                      <p className="whitespace-pre-wrap text-destructive" role="alert">
                        {run.error}
                      </p>
                    )}
                    <details>
                      <summary>{t('workflow.resolvedInputs')}</summary>
                      <pre className="overflow-auto whitespace-pre-wrap">
                        {JSON.stringify(run.inputs, null, 2)}
                      </pre>
                    </details>
                    <details>
                      <summary>{t('workflow.outputs')}</summary>
                      <pre className="overflow-auto whitespace-pre-wrap">
                        {JSON.stringify(run.outputs, null, 2)}
                      </pre>
                    </details>
                    <details>
                      <summary>{t('workflow.logs')}</summary>
                      <pre className="overflow-auto whitespace-pre-wrap">
                        {run.logs || t('runs.noLogs')}
                      </pre>
                    </details>
                    {run.nodeRuns.map((nodeRun) => (
                      <details key={nodeRun.id}>
                        <summary>
                          {nodeRun.nodeName} · {getRunStatusLabel(nodeRun.status)}
                        </summary>
                        <div className="flex flex-col gap-3 py-3">
                          <p>
                            {getRunStatusLabel(nodeRun.status)} ·{' '}
                            {nodeRun.startedAt.toLocaleString(i18n.language)}
                          </p>
                          {nodeRun.error && (
                            <p className="whitespace-pre-wrap text-destructive" role="alert">
                              {nodeRun.error}
                            </p>
                          )}
                          <details>
                            <summary>{t('workflow.resolvedInputs')}</summary>
                            <pre className="overflow-auto whitespace-pre-wrap">
                              {JSON.stringify(nodeRun.inputs, null, 2)}
                            </pre>
                          </details>
                          <details>
                            <summary>{t('workflow.outputs')}</summary>
                            <pre className="overflow-auto whitespace-pre-wrap">
                              {JSON.stringify(nodeRun.outputs, null, 2)}
                            </pre>
                          </details>
                          <details>
                            <summary>{t('workflow.logs')}</summary>
                            <pre className="overflow-auto whitespace-pre-wrap">
                              {nodeRun.logs || t('runs.noLogs')}
                            </pre>
                          </details>
                        </div>
                      </details>
                    ))}
                  </div>
                </details>
              ))
            )}
          </div>
        </SheetContent>
      </Sheet>
    </main>
  );
}
