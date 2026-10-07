'use client';

import { useQueryClient } from '@tanstack/react-query';
import { CopyIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { queryKeys } from '@/lib/query-keys';
import { cloneAutomation } from '@/services/automations/client/clone-automation';
import { Button } from '@/ui/button';

import { type CloneAutomationButtonProps } from './types';

export function CloneAutomationButton(props: CloneAutomationButtonProps) {
  const { automationId } = props;
  const { t } = useTranslation();
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);
  const queryClient = useQueryClient();
  const router = useRouter();

  async function handleClone() {
    setError(null);
    setIsPending(true);

    try {
      const automation = await cloneAutomation({ automationId });

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.automations }),
        queryClient.invalidateQueries({ queryKey: queryKeys.workflowCatalog }),
      ]);
      router.push(`/automations/${automation.id}`);
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : t('runs.cloneError'));
      setIsPending(false);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <Button disabled={isPending} type="button" variant="outline" onClick={handleClone}>
        <CopyIcon data-icon="inline-start" />
        {isPending ? t('runs.cloning') : t('runs.cloneAutomation')}
      </Button>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
