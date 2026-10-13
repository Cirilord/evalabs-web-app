'use client';

import { LoaderCircleIcon, PencilIcon } from 'lucide-react';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';

import { Button } from '@/ui/button';

import { CloneAutomationButton } from '../CloneAutomationButton';
import { DeleteAutomationButton } from '../DeleteAutomationButton';
import { EditScriptButton } from '../EditScriptButton';
import { RunAutomationButton } from '../RunAutomationButton';
import { type AutomationLibrary, type AutomationRunInput } from '../RunAutomationButton/types';
import { RunDetailsButton } from '../RunDetailsButton';
import { type AutomationDetailsViewProps } from './types';

export function AutomationDetailsView(props: AutomationDetailsViewProps) {
  const { automation, runs } = props;
  const { i18n, t } = useTranslation();
  const statusLabels = {
    failed: t('runs.statusFailed'),
    preparing: t('runs.statusPreparing'),
    running: t('runs.statusRunning'),
    succeeded: t('runs.statusSucceeded'),
  };
  const statusClassNames = {
    failed: 'text-destructive',
    preparing: 'text-warning',
    running: 'text-sidebar-primary',
    succeeded: 'text-success',
  };

  return (
    <main className="flex-1 p-6 sm:p-10">
      <div className="flex w-full flex-col gap-8">
        <header className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">{automation.name}</h1>
            {automation.description && (
              <p className="mt-2 text-sm text-muted-foreground">{automation.description}</p>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <EditScriptButton automationId={automation.id} script={automation.script} />
            <Button
              nativeButton={false}
              render={<Link href={`/automations/${automation.id}/edit`} />}
              type="button"
              variant="outline"
            >
              <PencilIcon data-icon="inline-start" />
              {t('create.editAutomation')}
            </Button>
            <CloneAutomationButton automationId={automation.id} />
            <RunAutomationButton
              automationId={automation.id}
              automationName={automation.name}
              inputs={automation.inputsJson as unknown as readonly AutomationRunInput[]}
              libraries={automation.librariesJson as unknown as readonly AutomationLibrary[]}
              outputs={automation.outputsJson as unknown as readonly AutomationRunInput[]}
              script={automation.script}
            />
            <DeleteAutomationButton automationId={automation.id} automationName={automation.name} />
          </div>
        </header>

        <section aria-labelledby="runs-heading" className="flex flex-col gap-4">
          <div>
            <h2 className="text-lg font-semibold" id="runs-heading">
              {t('runs.runs')}
            </h2>
            <p className="text-sm text-muted-foreground">{t('runs.detailsDescription')}</p>
          </div>

          {runs.length === 0 ? (
            <div className="rounded-lg border bg-card px-5 py-10 text-center">
              <p className="font-medium">{t('runs.noRuns')}</p>
              <p className="mt-1 text-sm text-muted-foreground">{t('runs.noRunsDescription')}</p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-lg border bg-card">
              {runs.map((run) => (
                <article className="border-b px-5 py-4 last:border-b-0" key={run.id}>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <span className={`text-sm font-medium ${statusClassNames[run.status]}`}>
                        {statusLabels[run.status]}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {run.startedAt.toLocaleString(i18n.language)}
                      </span>
                      {run.runnerVersion && (
                        <span className="text-sm text-muted-foreground">{run.runnerVersion}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      {run.finishedAt && (
                        <span className="text-sm text-muted-foreground">
                          {t('web.finishedAt', {
                            time: run.finishedAt.toLocaleTimeString(i18n.language),
                          })}
                        </span>
                      )}
                      {(run.status === 'preparing' || run.status === 'running') && (
                        <LoaderCircleIcon
                          className={`animate-spin ${statusClassNames[run.status]}`}
                        />
                      )}
                      <RunDetailsButton run={run} />
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
