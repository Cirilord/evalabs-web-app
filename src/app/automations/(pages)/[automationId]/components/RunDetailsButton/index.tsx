'use client';

import { InfoIcon } from 'lucide-react';
import { useState } from 'react';

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

function getDuration(startedAt: Date, finishedAt: Date | null) {
  if (!finishedAt) {
    return 'In progress';
  }

  return `${((finishedAt.getTime() - startedAt.getTime()) / 1_000).toFixed(2)}s`;
}

export function RunDetailsButton(props: RunDetailsButtonProps) {
  const { run } = props;
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger render={<Button size="sm" type="button" variant="outline" />}>
        <InfoIcon data-icon="inline-start" />
        Run details
      </DialogTrigger>
      <DialogContent className="flex max-h-[calc(100svh-2rem)] max-w-3xl flex-col gap-0 p-0">
        <DialogHeader className="shrink-0 border-b px-6 py-5">
          <DialogTitle>Run details</DialogTitle>
          <DialogDescription>Execution information, inputs, and logs.</DialogDescription>
        </DialogHeader>
        <div className="min-h-0 overflow-y-auto px-6 py-5">
          <dl className="grid gap-4 text-sm sm:grid-cols-4">
            <div className="flex flex-col gap-1">
              <dt className="text-muted-foreground">Status</dt>
              <dd className="font-medium">
                {run.status.charAt(0).toUpperCase() + run.status.slice(1)}
              </dd>
            </div>
            <div className="flex flex-col gap-1">
              <dt className="text-muted-foreground">Started at</dt>
              <dd>{run.startedAt.toLocaleString('en-US')}</dd>
            </div>
            <div className="flex flex-col gap-1">
              <dt className="text-muted-foreground">Duration</dt>
              <dd>{getDuration(run.startedAt, run.finishedAt)}</dd>
            </div>
            <div className="flex flex-col gap-1">
              <dt className="text-muted-foreground">Runner</dt>
              <dd>{run.runnerVersion || 'Unknown'}</dd>
            </div>
          </dl>
          <section className="mt-6">
            <h2 className="text-sm font-medium">Inputs</h2>
            <pre className="mt-2 overflow-x-auto rounded-md bg-muted px-3 py-2 text-xs text-foreground">
              {JSON.stringify(run.inputsJson, null, 2)}
            </pre>
          </section>
          <section className="mt-6">
            <h2 className="text-sm font-medium">Logs</h2>
            <pre className="mt-2 min-h-10 overflow-x-auto rounded-md bg-muted px-3 py-2 text-xs text-foreground">
              {run.logs || 'No logs available.'}
            </pre>
          </section>
          {run.error && (
            <section className="mt-6">
              <h2 className="text-sm font-medium text-destructive">Error</h2>
              <pre className="mt-2 overflow-x-auto rounded-md bg-destructive/10 px-3 py-2 text-xs text-destructive">
                {run.error}
              </pre>
            </section>
          )}
        </div>
        <DialogFooter className="shrink-0 border-t px-6 py-4">
          <DialogClose>Close</DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
