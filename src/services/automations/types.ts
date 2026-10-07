export type AutomationPortType = 'boolean' | 'file' | 'number' | 'text';

export type AutomationIdentifier = Readonly<{
  id: string;
}>;

export type AutomationIdInput = {
  automationId: string;
};

export type AutomationInput = {
  description: string;
  name: string;
  required: boolean;
  type: AutomationPortType;
};

export type AutomationLibrary = {
  name: string;
  version: string;
};

export type AutomationListItem = Readonly<{
  id: string;
  name: string;
}>;

export type AutomationRunInput = {
  automationId: string;
  inputs: Record<string, unknown>;
  runnerVersion: string;
};

export type AutomationRunStatus = Readonly<{
  automationId: string;
  status: 'failed' | 'preparing' | 'running' | 'succeeded' | null;
}>;

export type AutomationOutput = Omit<AutomationInput, 'required'>;

export type AutomationWithRuns<TAutomation, TRun> = TAutomation & {
  runs: TRun[];
};

export type CreateAutomationInput = {
  description: string;
  inputs: AutomationInput[];
  libraries: AutomationLibrary[];
  name: string;
  outputs: AutomationOutput[];
  script: string;
  scriptMode: 'file' | 'inline';
  scriptPath: string | null;
};

export type UpdateAutomationInput = CreateAutomationInput & {
  id: string;
};

export type UpdateAutomationScriptInput = AutomationIdInput & {
  script: string;
};

export type CompleteAutomationRunInput = {
  error: string;
  logs: string;
  outputs: unknown;
  runId: string;
  runnerVersion: string;
  status: 'failed' | 'succeeded';
};

export type RunIdentifier = Readonly<{
  id: string;
}>;
