'use client';

import { DownloadIcon, FileIcon, InfoIcon } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import {
  type AutomationArtifactReference,
  getAutomationArtifactFile,
  isAutomationArtifactReference,
} from '@/lib/automation-artifacts';
import { Button } from '@/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/ui/dialog';

import { type RunDetailsButtonProps } from './types';

function getDuration(startedAt: Date, finishedAt: Date | null, inProgress: string) {
  if (!finishedAt) {
    return inProgress;
  }

  return `${((finishedAt.getTime() - startedAt.getTime()) / 1_000).toFixed(2)}s`;
}

function formatFileSize(size: number, locale: string) {
  return new Intl.NumberFormat(locale, {
    notation: 'compact',
    style: 'unit',
    unit: 'byte',
    unitDisplay: 'narrow',
  }).format(size);
}

export function RunDetailsButton(props: RunDetailsButtonProps) {
  const { run } = props;
  const { i18n, t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const artifacts = Object.entries(run.outputs).filter(
    (entry): entry is [string, AutomationArtifactReference] =>
      isAutomationArtifactReference(entry[1])
  );
  const scalarOutputs = Object.fromEntries(
    Object.entries(run.outputs).filter(([, output]) => !isAutomationArtifactReference(output))
  );

  async function downloadArtifact(artifact: AutomationArtifactReference) {
    const file = await getAutomationArtifactFile(artifact);
    const url = URL.createObjectURL(file);
    const link = document.createElement('a');

    link.download = artifact.name;
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger render={<Button size="sm" type="button" variant="outline" />}>
        <InfoIcon data-icon="inline-start" />
        {t('runs.details')}
      </DialogTrigger>
      <DialogContent className="flex max-h-[calc(100svh-2rem)] max-w-3xl flex-col gap-0 p-0">
        <DialogHeader className="shrink-0 border-b px-6 py-5">
          <DialogTitle>{t('runs.details')}</DialogTitle>
          <DialogDescription>{t('workflow.runsDescription')}</DialogDescription>
        </DialogHeader>
        <div className="min-h-0 overflow-y-auto px-6 py-5">
          <dl className="grid gap-4 text-sm sm:grid-cols-3">
            <div className="flex flex-col gap-1">
              <dt className="text-muted-foreground">{t('web.status')}</dt>
              <dd className="font-medium">
                {run.status.charAt(0).toUpperCase() + run.status.slice(1)}
              </dd>
            </div>
            <div className="flex flex-col gap-1">
              <dt className="text-muted-foreground">{t('web.startedAt')}</dt>
              <dd>{run.startedAt.toLocaleString(i18n.language)}</dd>
            </div>
            <div className="flex flex-col gap-1">
              <dt className="text-muted-foreground">{t('web.duration')}</dt>
              <dd>{getDuration(run.startedAt, run.finishedAt, t('web.inProgress'))}</dd>
            </div>
          </dl>
          <section className="mt-6">
            <h2 className="text-sm font-medium">{t('runs.inputs')}</h2>
            <pre className="mt-2 overflow-x-auto rounded-md bg-muted px-3 py-2 text-xs text-foreground">
              {JSON.stringify(run.inputs, null, 2)}
            </pre>
          </section>
          <section className="mt-6">
            <h2 className="text-sm font-medium">{t('runs.artifacts')}</h2>
            {artifacts.length > 0 ? (
              <div className="mt-3 overflow-hidden rounded-lg border bg-card">
                {artifacts.map(([outputName, artifact]) => (
                  <div
                    className="flex items-center justify-between gap-4 border-b px-4 py-3 last:border-b-0"
                    key={outputName}
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-muted">
                        <FileIcon className="size-4 text-muted-foreground" />
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">{artifact.name}</p>
                        <p className="truncate text-xs text-muted-foreground">
                          {outputName} · {artifact.mimeType} ·{' '}
                          {formatFileSize(artifact.size, i18n.language)}
                        </p>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      type="button"
                      variant="outline"
                      onClick={() => void downloadArtifact(artifact)}
                    >
                      <DownloadIcon data-icon="inline-start" />
                      {t('runs.downloadArtifact')}
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-3 rounded-lg border border-dashed px-4 py-5 text-sm text-muted-foreground">
                {t('runs.noArtifacts')}
              </p>
            )}
          </section>
          {Object.keys(scalarOutputs).length > 0 && (
            <section className="mt-6">
              <h2 className="text-sm font-medium">{t('workflow.outputs')}</h2>
              <pre className="mt-2 overflow-x-auto rounded-md bg-muted px-3 py-2 text-xs text-foreground">
                {JSON.stringify(scalarOutputs, null, 2)}
              </pre>
            </section>
          )}
          <section className="mt-6">
            <h2 className="text-sm font-medium">{t('workflow.logs')}</h2>
            <pre className="mt-2 min-h-10 overflow-x-auto rounded-md bg-muted px-3 py-2 text-xs text-foreground">
              {run.logs || t('workflow.noLogs')}
            </pre>
          </section>
          {run.nodeRuns.length > 0 && (
            <section className="mt-6">
              <h2 className="text-sm font-medium">{t('workflow.nodeRuns')}</h2>
              <div className="mt-2 overflow-hidden rounded-lg border bg-card">
                {run.nodeRuns.map((nodeRun) => (
                  <details className="border-b px-4 py-3 last:border-b-0" key={nodeRun.id}>
                    <summary className="cursor-pointer text-sm font-medium">
                      {nodeRun.nodeName}
                    </summary>
                    <div className="mt-3 flex flex-col gap-3">
                      {nodeRun.error && <p className="text-sm text-destructive">{nodeRun.error}</p>}
                      {Object.entries(nodeRun.outputs)
                        .filter((entry): entry is [string, AutomationArtifactReference] =>
                          isAutomationArtifactReference(entry[1])
                        )
                        .map(([outputName, artifact]) => (
                          <div
                            className="flex items-center justify-between gap-4 rounded-lg border px-3 py-2"
                            key={outputName}
                          >
                            <div className="flex min-w-0 items-center gap-3">
                              <FileIcon className="size-4 shrink-0 text-muted-foreground" />
                              <div className="min-w-0">
                                <p className="truncate text-sm font-medium">{artifact.name}</p>
                                <p className="truncate text-xs text-muted-foreground">
                                  {outputName} · {artifact.mimeType} ·{' '}
                                  {formatFileSize(artifact.size, i18n.language)}
                                </p>
                              </div>
                            </div>
                            <Button
                              size="sm"
                              type="button"
                              variant="outline"
                              onClick={() => void downloadArtifact(artifact)}
                            >
                              <DownloadIcon data-icon="inline-start" />
                              {t('runs.downloadArtifact')}
                            </Button>
                          </div>
                        ))}
                      {Object.keys(
                        Object.fromEntries(
                          Object.entries(nodeRun.outputs).filter(
                            ([, output]) => !isAutomationArtifactReference(output)
                          )
                        )
                      ).length > 0 && (
                        <pre className="overflow-x-auto rounded-md bg-muted px-3 py-2 text-xs text-foreground">
                          {JSON.stringify(
                            Object.fromEntries(
                              Object.entries(nodeRun.outputs).filter(
                                ([, output]) => !isAutomationArtifactReference(output)
                              )
                            ),
                            null,
                            2
                          )}
                        </pre>
                      )}
                      <pre className="overflow-x-auto rounded-md bg-muted px-3 py-2 text-xs text-foreground">
                        {nodeRun.logs || t('workflow.noLogs')}
                      </pre>
                    </div>
                  </details>
                ))}
              </div>
            </section>
          )}
          {run.error && (
            <section className="mt-6">
              <h2 className="text-sm font-medium text-destructive">{t('runs.error')}</h2>
              <pre className="mt-2 overflow-x-auto rounded-md bg-destructive/10 px-3 py-2 text-xs text-destructive">
                {run.error}
              </pre>
            </section>
          )}
        </div>
        <DialogFooter className="shrink-0 border-t px-6 py-4">
          <DialogClose>{t('common.close')}</DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
