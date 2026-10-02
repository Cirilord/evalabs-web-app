import { NextResponse } from 'next/server';

import { prisma } from '@/lib/prisma';

export async function GET() {
  const automations = await prisma.automation.findMany({
    select: {
      id: true,
      runs: {
        orderBy: [{ startedAt: 'desc' }, { id: 'desc' }],
        select: {
          status: true,
        },
        take: 1,
      },
    },
  });

  const latestRuns = Array.from(
    new Map(
      automations.map((automation) => [
        automation.id,
        { automationId: automation.id, status: automation.runs[0]?.status ?? null },
      ])
    ).values()
  );

  return NextResponse.json(latestRuns);
}
