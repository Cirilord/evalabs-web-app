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

export type RunAutomationButtonProps = Readonly<{
  automationId: string;
  automationName: string;
  expectsOutputs: boolean;
  inputs: readonly AutomationRunInput[];
  libraries: readonly AutomationLibrary[];
  script: string;
}>;
