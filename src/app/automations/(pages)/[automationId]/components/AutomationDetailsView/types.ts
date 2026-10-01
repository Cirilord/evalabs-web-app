import { type Automation, type Run } from '@/generated/prisma/client';

export type AutomationDetailsViewProps = Readonly<{
  automation: Automation;
  runs: readonly Run[];
}>;
