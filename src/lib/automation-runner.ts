import 'client-only';

import { type AutomationArtifact, persistAutomationArtifact } from '@/lib/automation-artifacts';
import { type PyodideRunnerId } from '@/lib/runner';
import { type AutomationLibrary, type AutomationOutput } from '@/services/automations/types';

export class AutomationExecutionError extends Error {
  public readonly logs: string;

  public constructor(message: string, logs: string) {
    super(message);
    this.logs = logs;
  }
}

export type AutomationExecutionResult = Readonly<{
  logs: string;
  outputs: Record<string, unknown>;
  runnerVersion: string;
}>;

type RunAutomationInBrowserOptions = Readonly<{
  files: Readonly<Record<string, File>>;
  inputs: Readonly<Record<string, boolean | number | string>>;
  libraries: readonly AutomationLibrary[];
  outputSchema: readonly AutomationOutput[];
  runnerId: PyodideRunnerId;
  script: string;
}>;

type WorkerExecutionResult = AutomationExecutionResult &
  Readonly<{
    artifacts: readonly AutomationArtifact[];
  }>;

type WorkerMessage =
  | Readonly<{
      logs: string;
      message: string;
      requestId: string;
      type: 'failed';
    }>
  | Readonly<{
      requestId: string;
      result: WorkerExecutionResult;
      type: 'succeeded';
    }>;

type PendingExecution = Readonly<{
  reject: (reason: Error) => void;
  resolve: (result: WorkerExecutionResult) => void;
}>;

let executionWorker: Worker | undefined;
let requestCount = 0;
const pendingExecutions = new Map<string, PendingExecution>();

function rejectPendingExecutions(error: Error) {
  for (const pendingExecution of pendingExecutions.values()) {
    pendingExecution.reject(error);
  }

  pendingExecutions.clear();
}

function getExecutionWorker() {
  if (executionWorker) {
    return executionWorker;
  }

  executionWorker = new Worker('/automation-runner.worker.mjs', { type: 'module' });
  executionWorker.addEventListener('message', (event: MessageEvent<WorkerMessage>) => {
    const message = event.data;
    const pendingExecution = pendingExecutions.get(message.requestId);

    if (!pendingExecution) {
      return;
    }

    pendingExecutions.delete(message.requestId);
    if (message.type === 'failed') {
      pendingExecution.reject(new AutomationExecutionError(message.message, message.logs));
      return;
    }

    pendingExecution.resolve(message.result);
  });
  executionWorker.addEventListener('error', (event) => {
    executionWorker?.terminate();
    executionWorker = undefined;
    rejectPendingExecutions(new Error(event.message || 'The Python execution worker failed.'));
  });

  return executionWorker;
}

export function runAutomationInBrowser(
  options: RunAutomationInBrowserOptions
): Promise<AutomationExecutionResult> {
  const requestId = `automation-run-${requestCount++}`;
  const worker = getExecutionWorker();

  return new Promise<WorkerExecutionResult>((resolve, reject) => {
    pendingExecutions.set(requestId, { reject, resolve });
    worker.postMessage({ ...options, requestId, type: 'run' });
  }).then(async (execution) => {
    const outputs = { ...execution.outputs };

    await Promise.all(
      execution.artifacts.map(async (artifact) => {
        const reference = await persistAutomationArtifact(artifact);
        outputs[artifact.outputName] = reference;
      })
    );

    return { logs: execution.logs, outputs, runnerVersion: execution.runnerVersion };
  });
}
