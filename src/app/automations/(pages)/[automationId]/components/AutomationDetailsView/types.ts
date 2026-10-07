import { type Automation, type Run } from '@/generated/prisma-browser/client';

export type AutomationDetailsViewProps = Readonly<{
  automation: Automation;
  runs: readonly Run[];
}>;
