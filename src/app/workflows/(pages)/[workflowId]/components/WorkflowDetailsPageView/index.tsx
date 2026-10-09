'use client';

import { LoaderCircleIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { useWorkflowCanvasData } from '@/hooks/use-workflow-canvas-data';

import { WorkflowDetailsView } from '../WorkflowDetailsView';
import { type WorkflowDetailsPageViewProps } from './types';

export function WorkflowDetailsPageView(props: WorkflowDetailsPageViewProps) {
  const { workflowId } = props;
  const { t } = useTranslation();
  const { data, isPending } = useWorkflowCanvasData(workflowId);

  if (isPending) {
    return (
      <main className="flex flex-1 items-center justify-center p-6" role="status">
        <LoaderCircleIcon className="size-5 animate-spin" />
        <span className="sr-only">{t('common.loading')}</span>
      </main>
    );
  }

  if (!data) {
    return (
      <main className="flex flex-1 items-center justify-center p-6">
        <p className="text-sm text-muted-foreground">{t('common.notFound')}</p>
      </main>
    );
  }

  return <WorkflowDetailsView data={data} />;
}
