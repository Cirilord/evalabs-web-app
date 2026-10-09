'use client';

import { useQueryClient } from '@tanstack/react-query';
import { CopyIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { queryKeys } from '@/lib/query-keys';
import { cloneWorkflow } from '@/services/workflows/client/clone-workflow';
import { Button } from '@/ui/button';

import { type CloneWorkflowButtonProps } from './types';

export function CloneWorkflowButton(props: CloneWorkflowButtonProps) {
  const { workflowId } = props;
  const { t } = useTranslation();
  const [isPending, setIsPending] = useState(false);
  const queryClient = useQueryClient();
  const router = useRouter();

  async function handleClone() {
    setIsPending(true);
    const workflow = await cloneWorkflow({ workflowId });
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: queryKeys.workflows }),
      queryClient.invalidateQueries({ queryKey: queryKeys.workflowCatalog }),
    ]);
    router.push(`/workflows/${workflow.id}`);
  }

  return (
    <Button disabled={isPending} type="button" variant="outline" onClick={() => void handleClone()}>
      <CopyIcon data-icon="inline-start" />
      {t('runs.cloneAutomation')}
    </Button>
  );
}
