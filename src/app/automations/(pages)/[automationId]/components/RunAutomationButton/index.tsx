'use client';

import { useQueryClient } from '@tanstack/react-query';
import { FileIcon, LoaderCircleIcon, PlayIcon } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useRunner } from '@/contexts/RunnerProvider';
import { AutomationExecutionError, runAutomationInBrowser } from '@/lib/automation-runner';
import { queryKeys } from '@/lib/query-keys';
import { getPyodideRunnerLabel } from '@/lib/runner';
import { completeAutomationRun } from '@/services/automations/client/complete-automation-run';
import { createAutomationRun } from '@/services/automations/client/create-automation-run';
import { Button } from '@/ui/button';
import { Checkbox } from '@/ui/checkbox';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/ui/dialog';
import { Input } from '@/ui/input';
import { Label } from '@/ui/label';

import { completeAutomationRunSchema, runAutomationSchema } from './schema/run-automation.schema';
import { type RunAutomationButtonProps } from './types';

export function RunAutomationButton(props: RunAutomationButtonProps) {
  const { automationId, automationName, inputs, libraries, outputs, script } = props;
  const { t } = useTranslation();
  const { runnerId } = useRunner();
  const runnerVersion = getPyodideRunnerLabel(runnerId);
  const [error, setError] = useState<string | null>(null);
  const [files, setFiles] = useState<Record<string, File>>({});
  const [isPending, setIsPending] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [values, setValues] = useState<Record<string, boolean | string>>({});
  const queryClient = useQueryClient();

  function openDialog() {
    setError(null);
    setValues(
      Object.fromEntries(inputs.map((input) => [input.name, input.type === 'boolean' ? false : '']))
    );
    setFiles({});
    setIsOpen(true);
  }

  async function handleRun() {
    const missingInput = inputs.find(
      (input) =>
        input.required &&
        ((input.type === 'file' && !files[input.name]) ||
          (input.type !== 'boolean' && input.type !== 'file' && values[input.name] === ''))
    );

    if (missingInput) {
      setError(t('web.inputRequired', { name: missingInput.name }));
      return;
    }

    setError(null);
    setIsPending(true);

    const normalizedInputs = Object.fromEntries(
      inputs.map((input) => {
        const value = values[input.name] ?? '';

        return [input.name, input.type === 'number' && value !== '' ? Number(value) : value];
      })
    );
    const runInput = runAutomationSchema.safeParse({
      automationId,
      inputs: normalizedInputs,
      runnerVersion,
    });

    if (!runInput.success) {
      setError(t('web.runCreationError'));
      setIsPending(false);
      return;
    }

    let runId: string | undefined;

    try {
      const run = await createAutomationRun(runInput.data);
      runId = run.id;

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.automation(automationId) }),
        queryClient.invalidateQueries({ queryKey: queryKeys.automationStatuses }),
      ]);
      setIsOpen(false);

      const execution = await runAutomationInBrowser({
        files,
        inputs: normalizedInputs,
        libraries,
        outputSchema: outputs,
        runnerId,
        script,
      });
      const completionInput = completeAutomationRunSchema.parse({
        error: '',
        logs: execution.logs,
        outputs: execution.outputs,
        runId: run.id,
        runnerVersion: execution.runnerVersion,
        status: 'succeeded',
      });

      await completeAutomationRun(completionInput);
    } catch (executionError) {
      const executionLogs =
        executionError instanceof AutomationExecutionError ? executionError.logs : '';
      const executionMessage =
        executionError instanceof Error ? executionError.message : String(executionError);

      if (!runId) {
        setError(executionMessage);
      } else {
        try {
          const completionInput = completeAutomationRunSchema.parse({
            error: executionMessage,
            logs: executionLogs,
            outputs: {},
            runId,
            runnerVersion,
            status: 'failed',
          });

          await completeAutomationRun(completionInput);
          setError(executionMessage);
        } catch (completionError) {
          const completionMessage =
            completionError instanceof Error ? completionError.message : String(completionError);

          setError(`${executionMessage}\n${t('web.runSaveError', { error: completionMessage })}`);
        }
      }
    } finally {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.automation(automationId) }),
        queryClient.invalidateQueries({ queryKey: queryKeys.automationStatuses }),
      ]);
      setIsPending(false);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <Button disabled={isPending} type="button" onClick={openDialog}>
        <PlayIcon data-icon="inline-start" />
        {isPending ? t('web.starting') : t('runs.run')}
      </Button>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <Dialog open={isOpen} onOpenChange={(open) => !isPending && setIsOpen(open)}>
        <DialogContent className="flex max-h-[calc(100svh-2rem)] max-w-lg flex-col gap-0 p-0">
          <DialogHeader className="shrink-0 border-b px-6 py-5">
            <DialogTitle>
              {t('runs.run')} {automationName}
            </DialogTitle>
            <DialogDescription>{t('runs.runDescription')}</DialogDescription>
          </DialogHeader>
          <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
            {inputs.length === 0 ? (
              <p className="text-sm text-muted-foreground">{t('runs.runNoInputs')}</p>
            ) : (
              <div className="flex flex-col gap-5">
                {inputs.map((input) => {
                  const inputId = `run-input-${input.name}`;
                  const label = input.required ? `${input.name} *` : input.name;
                  return input.type === 'boolean' ? (
                    <div key={input.name} className="flex flex-col gap-2">
                      <div className="flex items-center gap-2">
                        <Checkbox
                          checked={Boolean(values[input.name])}
                          id={inputId}
                          onCheckedChange={(checked) =>
                            setValues({ ...values, [input.name]: checked })
                          }
                        />
                        <Label htmlFor={inputId}>{label}</Label>
                      </div>
                      {input.description && (
                        <p className="text-sm text-muted-foreground">{input.description}</p>
                      )}
                    </div>
                  ) : input.type === 'file' ? (
                    <div key={input.name} className="flex flex-col gap-2">
                      <Label htmlFor={inputId}>{label}</Label>
                      <div className="flex gap-2">
                        <Input
                          readOnly
                          value={String(values[input.name] ?? '')}
                          placeholder={t('web.noFileSelected')}
                        />
                        <Button
                          render={<label htmlFor={inputId} />}
                          nativeButton={false}
                          type="button"
                          variant="outline"
                        >
                          <FileIcon data-icon="inline-start" />
                          {t('common.file')}
                        </Button>
                        <Input
                          className="sr-only"
                          id={inputId}
                          type="file"
                          onChange={(event) => {
                            const file = event.target.files?.[0];
                            setFiles(
                              file
                                ? { ...files, [input.name]: file }
                                : Object.fromEntries(
                                    Object.entries(files).filter(([name]) => name !== input.name)
                                  )
                            );
                            setValues({ ...values, [input.name]: file?.name ?? '' });
                          }}
                        />
                      </div>
                      {input.description && (
                        <p className="text-sm text-muted-foreground">{input.description}</p>
                      )}
                    </div>
                  ) : (
                    <div key={input.name} className="flex flex-col gap-2">
                      <Label htmlFor={inputId}>{label}</Label>
                      <Input
                        id={inputId}
                        type={input.type}
                        value={String(values[input.name] ?? '')}
                        onChange={(event) =>
                          setValues({ ...values, [input.name]: event.target.value })
                        }
                      />
                      {input.description && (
                        <p className="text-sm text-muted-foreground">{input.description}</p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
            {error && <p className="mt-4 text-sm text-destructive">{error}</p>}
          </div>
          <DialogFooter className="shrink-0 border-t px-6 py-4">
            <DialogClose disabled={isPending}>{t('common.cancel')}</DialogClose>
            <Button disabled={isPending} type="button" onClick={handleRun}>
              {isPending && <LoaderCircleIcon className="animate-spin" data-icon="inline-start" />}
              {isPending ? t('runs.running') : t('runs.run')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
