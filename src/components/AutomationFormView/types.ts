import { type z } from 'zod';

import { type createAutomationSchema } from './schema/automation-form.schema';

export type AutomationFormViewValues = z.infer<typeof createAutomationSchema>;

export type AutomationFormAutomation = Readonly<{
  description: string;
  id: string;
  inputs: AutomationFormViewValues['inputs'];
  libraries: AutomationFormViewValues['libraries'];
  name: string;
  outputs: AutomationFormViewValues['outputs'];
  script: string;
  scriptPath: string | null;
  scriptSource: 'external' | 'file' | 'inline' | 'managed';
}>;

export type AutomationFormViewProps = Readonly<{
  automation?: AutomationFormAutomation;
}>;
