import { LoaderCircleIcon, PencilIcon } from 'lucide-react';

import { Button } from '@/ui/button';

import { CloneAutomationButton } from '../CloneAutomationButton';
import { DeleteAutomationButton } from '../DeleteAutomationButton';
import { EditScriptButton } from '../EditScriptButton';
import { RunAutomationButton } from '../RunAutomationButton';
import { RunDetailsButton } from '../RunDetailsButton';
import { type AutomationDetailsViewProps } from './types';
import { type AutomationRunInput } from '../RunAutomationButton/types';

function getRunStatusLabel(status: AutomationDetailsViewProps['runs'][number]['status']) {
  const labels = {
    failed: 'Failed',
    preparing: 'Installing dependencies',
    running: 'Running',
    succeeded: 'Succeeded',
  };

  return labels[status];
}

export function AutomationDetailsView(props: AutomationDetailsViewProps) {
  const { automation, runs } = props;

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
            <Button type="button" variant="outline">
              <PencilIcon data-icon="inline-start" />
              Edit automation
            </Button>
            <CloneAutomationButton automationId={automation.id} />
            <RunAutomationButton
              automationId={automation.id}
              automationName={automation.name}
              inputs={automation.inputsJson as unknown as readonly AutomationRunInput[]}
            />
            <DeleteAutomationButton automationId={automation.id} automationName={automation.name} />
          </div>
        </header>

        <section aria-labelledby="runs-heading" className="flex flex-col gap-4">
          <div>
            <h2 className="text-lg font-semibold" id="runs-heading">
              Runs
            </h2>
            <p className="text-sm text-muted-foreground">
              Execution information, inputs, and logs.
            </p>
          </div>

          {runs.length === 0 ? (
            <div className="rounded-lg border bg-background px-5 py-10 text-center">
              <p className="font-medium">No runs yet</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Run this automation to create its first execution.
              </p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-lg border bg-background">
              {runs.map((run) => (
                <article className="border-b px-5 py-4 last:border-b-0" key={run.id}>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium">{getRunStatusLabel(run.status)}</span>
                      <span className="text-sm text-muted-foreground">
                        {run.startedAt.toLocaleString('en-US')}
                      </span>
                      {run.runnerVersion && (
                        <span className="text-sm text-muted-foreground">{run.runnerVersion}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      {run.finishedAt && (
                        <span className="text-sm text-muted-foreground">
                          Finished {run.finishedAt.toLocaleTimeString('en-US')}
                        </span>
                      )}
                      {(run.status === 'preparing' || run.status === 'running') && (
                        <LoaderCircleIcon className="animate-spin text-muted-foreground" />
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
