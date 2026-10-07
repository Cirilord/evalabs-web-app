import { NextResponse } from 'next/server';

import { findAutomationStatuses } from '@/services/automations/server/find-automation-statuses';

export async function GET() {
  const latestRuns = await findAutomationStatuses();

  return NextResponse.json(latestRuns);
}
