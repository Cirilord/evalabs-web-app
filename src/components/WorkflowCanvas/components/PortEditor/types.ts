import { type ReactNode } from 'react';

import { type WorkflowInput, type WorkflowOutput } from '@/lib/workflows';

export type PortEditorProps = Readonly<{
  inputs: boolean;
  onChange: (ports: WorkflowInput[] | WorkflowOutput[]) => void;
  ports: WorkflowInput[] | WorkflowOutput[];
  renderPortDetails?: (port: WorkflowInput | WorkflowOutput, index: number) => ReactNode;
}>;
