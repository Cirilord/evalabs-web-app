'use client';

import { LoaderCircleIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { CloneWorkflowButton } from '../CloneWorkflowButton';
import { DeleteWorkflowButton } from '../DeleteWorkflowButton';
import { EditWorkflowButton } from '../EditWorkflowButton';
import { RunDetailsButton } from '../RunDetailsButton';
import { RunWorkflowButton } from '../RunWorkflowButton';
import { type WorkflowDetailsViewProps } from './types';

export function WorkflowDetailsView(props: WorkflowDetailsViewProps) {
  const { data } = props;
  const { i18n, t } = useTranslation();

  const statusLabels: Record<string, string> = {
    failed: t('runs.statusFailed'),
    preparing: t('runs.statusPreparing'),
    running: t('runs.statusRunning'),
    succeeded: t('runs.statusSucceeded'),
  };
  const statusClassNames: Record<string, string> = {
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
            <h1 className="text-2xl font-semibold tracking-tight">{data.graph.name}</h1>
            {data.graph.description && (
              <p className="mt-2 text-sm text-muted-foreground">{data.graph.description}</p>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <EditWorkflowButton workflowId={data.graph.id} />
            <CloneWorkflowButton workflowId={data.graph.id} />
            <RunWorkflowButton catalog={data.catalog} graph={data.graph} />
            <DeleteWorkflowButton workflowId={data.graph.id} />
          </div>
        </header>

        <section aria-labelledby="runs-heading" className="flex flex-col gap-4">
          <div>
            <h2 className="text-lg font-semibold" id="runs-heading">
              {t('workflow.runs')}
            </h2>
            <p className="text-sm text-muted-foreground">{t('workflow.runsDescription')}</p>
          </div>

          {data.runs.length === 0 ? (
            <div className="rounded-lg border bg-card px-5 py-10 text-center">
              <p className="font-medium">{t('runs.noRuns')}</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {t('workflow.noRunsDescription')}
              </p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-lg border bg-card">
              {data.runs.map((run) => (
                <article className="border-b px-5 py-4 last:border-b-0" key={run.id}>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <span className={`text-sm font-medium ${statusClassNames[run.status]}`}>
                        {statusLabels[run.status] ?? run.status}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {run.startedAt.toLocaleString(i18n.language)}
                      </span>
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
