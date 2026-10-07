'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Button } from '@/ui/button';
import { Checkbox } from '@/ui/checkbox';
import { Field, FieldGroup, FieldLabel } from '@/ui/field';
import { Input } from '@/ui/input';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/ui/sheet';

import { type RunWorkflowDialogProps } from './types';

export function RunWorkflowDialog(props: RunWorkflowDialogProps) {
  const { inputs, isRunning, onRun } = props;
  const { t } = useTranslation();
  const [error, setError] = useState('');
  const [files, setFiles] = useState<Record<string, File>>({});
  const [isOpen, setIsOpen] = useState(false);
  const [values, setValues] = useState<Record<string, boolean | number | string>>({});

  function resetValues() {
    setError('');
    setFiles({});
    setValues(
      Object.fromEntries(inputs.map((input) => [input.name, input.type === 'boolean' ? false : '']))
    );
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

    setError('');
    setIsOpen(false);

    try {
      await onRun(values, files);
    } catch (runError) {
      setError(runError instanceof Error ? runError.message : String(runError));
    }
  }

  return (
    <Sheet
      open={isOpen}
      onOpenChange={(open) => {
        setIsOpen(open);
        if (open) {
          resetValues();
        }
      }}
    >
      <SheetTrigger render={<Button disabled={isRunning} type="button" />}>
        {t('workflow.run')}
      </SheetTrigger>
      <SheetContent className="gap-0 overflow-y-auto p-0" side="right">
        <SheetHeader className="shrink-0 border-b px-6 py-5">
          <SheetTitle>{t('workflow.run')}</SheetTitle>
          <SheetDescription>{t('workflow.runDescription')}</SheetDescription>
        </SheetHeader>
        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
          {inputs.length === 0 ? (
            <p className="text-sm text-muted-foreground">{t('workflow.runNoInputs')}</p>
          ) : (
            <FieldGroup>
              {inputs.map((input) => {
                const inputId = `workflow-run-input-${input.name}`;

                return (
                  <Field key={input.name}>
                    {input.type === 'boolean' ? (
                      <div className="flex items-center gap-2">
                        <Checkbox
                          checked={Boolean(values[input.name])}
                          id={inputId}
                          onCheckedChange={(checked) =>
                            setValues({ ...values, [input.name]: checked === true })
                          }
                        />
                        <FieldLabel htmlFor={inputId}>
                          {input.name}
                          {input.required ? ' *' : ''}
                        </FieldLabel>
                      </div>
                    ) : input.type === 'file' ? (
                      <>
                        <FieldLabel htmlFor={inputId}>
                          {input.name}
                          {input.required ? ' *' : ''}
                        </FieldLabel>
                        <Input
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
                      </>
                    ) : (
                      <>
                        <FieldLabel htmlFor={inputId}>
                          {input.name}
                          {input.required ? ' *' : ''}
                        </FieldLabel>
                        <Input
                          id={inputId}
                          type={input.type}
                          value={String(values[input.name] ?? '')}
                          onChange={(event) =>
                            setValues({ ...values, [input.name]: event.target.value })
                          }
                        />
                      </>
                    )}
                    {input.description && (
                      <p className="text-sm text-muted-foreground">{input.description}</p>
                    )}
                  </Field>
                );
              })}
            </FieldGroup>
          )}
          {error && <p className="mt-4 text-sm text-destructive">{error}</p>}
        </div>
        <SheetFooter className="shrink-0 border-t px-6 py-4">
          <Button disabled={isRunning} type="button" onClick={() => void handleRun()}>
            {isRunning ? t('runs.running') : t('workflow.run')}
          </Button>
          <Button
            disabled={isRunning}
            type="button"
            variant="outline"
            onClick={() => setIsOpen(false)}
          >
            {t('common.cancel')}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
