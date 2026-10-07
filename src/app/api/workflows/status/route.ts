import { NextResponse } from 'next/server';

import { findWorkflowStatuses } from '@/services/workflows/server/find-workflow-statuses';

export async function GET() {
  const workflowStatuses = await findWorkflowStatuses();

  return NextResponse.json(workflowStatuses);
}
