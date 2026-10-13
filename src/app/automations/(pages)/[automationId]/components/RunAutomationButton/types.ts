export type AutomationRunInput = Readonly<{
  description: string;
  name: string;
  required: boolean;
  type: 'boolean' | 'file' | 'number' | 'text';
}>;

export type AutomationLibrary = Readonly<{
  name: string;
  version: string;
}>;

export type AutomationRunOutput = Readonly<{
  description: string;
  name: string;
  type: 'boolean' | 'file' | 'number' | 'text';
}>;

export type RunAutomationButtonProps = Readonly<{
  automationId: string;
  automationName: string;
  inputs: readonly AutomationRunInput[];
  libraries: readonly AutomationLibrary[];
  outputs: readonly AutomationRunOutput[];
  script: string;
}>;
