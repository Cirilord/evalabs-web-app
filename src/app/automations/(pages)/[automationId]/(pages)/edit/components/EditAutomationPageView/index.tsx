'use client';

import { LoaderCircleIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { AutomationFormView } from '@/components/AutomationFormView';
import { useAutomation } from '@/hooks/use-automation';

import { type EditAutomationPageViewProps } from './types';

export function EditAutomationPageView(props: EditAutomationPageViewProps) {
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

  return (
    <AutomationFormView
      automation={{
        description: automation.description,
        id: automation.id,
        inputs: automation.inputsJson as never,
        libraries: automation.librariesJson as never,
        name: automation.name,
        outputs: automation.outputsJson as never,
        script: automation.script,
      }}
    />
  );
}
