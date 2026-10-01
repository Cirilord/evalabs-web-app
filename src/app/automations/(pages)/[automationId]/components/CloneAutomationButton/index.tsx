'use client';

import { CopyIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Button } from '@/ui/button';

import { cloneAutomation } from './action';
import { type CloneAutomationButtonProps } from './types';

export function CloneAutomationButton(props: CloneAutomationButtonProps) {
  const { automationId } = props;
  const { t } = useTranslation();
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);
  const router = useRouter();

  async function handleClone() {
    setError(null);
    setIsPending(true);

    const result = await cloneAutomation({ automationId });

    if (result.data) {
      router.push(`/automations/${result.data.id}`);
      router.refresh();
      return;
    }

    setError(result.serverError ?? t('runs.cloneError'));
    setIsPending(false);
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
