'use client';

import { LoaderCircleIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { WorkflowCanvas } from '@/components/WorkflowCanvas';
import { useWorkflowCatalog } from '@/hooks/useWorkflowCatalog';
import { createWorkflowGraph } from '@/lib/workflows';

import { type NewWorkflowPageViewProps } from './types';

export function NewWorkflowPageView(props: NewWorkflowPageViewProps) {
  void props;
  const { t } = useTranslation();
  const { data: catalog, isPending } = useWorkflowCatalog();

  if (isPending || !catalog) {
    return (
      <main className="flex flex-1 items-center justify-center p-6" role="status">
        <LoaderCircleIcon className="size-5 animate-spin" />
        <span className="sr-only">{t('common.loading')}</span>
      </main>
    );
  }

  return <WorkflowCanvas catalog={catalog} graph={createWorkflowGraph('New workflow')} runs={[]} />;
}
