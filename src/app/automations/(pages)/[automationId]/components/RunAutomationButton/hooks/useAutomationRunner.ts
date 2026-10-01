import { type AutomationLibrary } from '../types';

export class AutomationExecutionError extends Error {
  public readonly logs: string;

  public constructor(message: string, logs: string) {
    super(message);
    this.logs = logs;
  }
}

export type AutomationExecutionResult = Readonly<{
  logs: string;
  outputs: unknown;
  runnerVersion: string;
}>;

type RunAutomationInBrowserOptions = Readonly<{
  expectsOutputs: boolean;
  files: Readonly<Record<string, File>>;
  inputs: Readonly<Record<string, boolean | number | string>>;
  libraries: readonly AutomationLibrary[];
  script: string;
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
      result: AutomationExecutionResult;
      type: 'succeeded';
    }>;

type PendingExecution = Readonly<{
  reject: (reason: Error) => void;
  resolve: (result: AutomationExecutionResult) => void;
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
  if (executionWorker) return executionWorker;

  executionWorker = new Worker('/automation-runner.worker.mjs', { type: 'module' });
  executionWorker.addEventListener('message', (event: MessageEvent<WorkerMessage>) => {
    const message = event.data;
    const pendingExecution = pendingExecutions.get(message.requestId);

    if (!pendingExecution) return;

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

  return new Promise((resolve, reject) => {
    pendingExecutions.set(requestId, { reject, resolve });
    worker.postMessage({ ...options, requestId, type: 'run' });
  });
}
