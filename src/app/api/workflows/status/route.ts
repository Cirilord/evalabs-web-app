import { NextResponse } from 'next/server';

import { prisma } from '@/lib/prisma';

export async function GET() {
  const workflows = await prisma.workflow.findMany({
    select: {
      id: true,
      runs: {
        orderBy: [{ startedAt: 'desc' }, { id: 'desc' }],
        select: { status: true },
        take: 1,
      },
    },
  });

  const latestRuns = Array.from(
    new Map(
      workflows.map((workflow) => [
        workflow.id,
        { status: workflow.runs[0]?.status ?? null, workflowId: workflow.id },
      ])
    ).values()
  );

  return NextResponse.json(latestRuns);
}
