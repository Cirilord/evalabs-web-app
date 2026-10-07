'use client';

import { LoaderCircleIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { useAutomation } from '@/hooks/useAutomation';

import { AutomationDetailsView } from '../AutomationDetailsView';
import { type AutomationDetailsPageViewProps } from './types';

export function AutomationDetailsPageView(props: AutomationDetailsPageViewProps) {
  const { automationId } = props;
  const { t } = useTranslation();
  const { data: automation, isPending } = useAutomation(automationId);

  if (isPending) {
    return (
      <main className="flex flex-1 items-center justify-center p-6" role="status">
        <LoaderCircleIcon className="size-5 animate-spin" />
        <span className="sr-only">{t('common.loading')}</span>
      </main>
    );
  }

  if (!automation) {
    return (
      <main className="flex flex-1 items-center justify-center p-6">
        <p className="text-sm text-muted-foreground">{t('common.notFound')}</p>
      </main>
    );
  }

  return <AutomationDetailsView automation={automation} runs={automation.runs} />;
}
