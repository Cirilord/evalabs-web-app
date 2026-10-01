import { notFound } from 'next/navigation';

import { prisma } from '@/lib/prisma';

import { AutomationDetailsView } from './components/AutomationDetailsView';
import { type AutomationDetailsPageProps } from './types';

export default async function AutomationDetailsPage(props: AutomationDetailsPageProps) {
  const { params } = props;
  const { automationId } = await params;
  const automation = await prisma.automation.findUnique({ where: { id: automationId } });
  const runs = await prisma.run.findMany({
    orderBy: { startedAt: 'desc' },
    where: { automationId },
  });

  if (!automation) {
    notFound();
  }

  return <AutomationDetailsView automation={automation} runs={runs} />;
}
