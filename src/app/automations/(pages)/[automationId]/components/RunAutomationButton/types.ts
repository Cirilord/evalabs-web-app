export type AutomationRunInput = Readonly<{
  description: string;
  name: string;
  required: boolean;
  type: 'boolean' | 'file' | 'number' | 'text';
}>;

export type RunAutomationButtonProps = Readonly<{
  automationId: string;
  automationName: string;
  inputs: readonly AutomationRunInput[];
}>;
