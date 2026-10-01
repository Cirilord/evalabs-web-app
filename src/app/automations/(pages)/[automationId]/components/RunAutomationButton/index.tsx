'use client';

import { FileIcon, LoaderCircleIcon, PlayIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

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

import { runAutomation } from './action';
import { type RunAutomationButtonProps } from './types';

export function RunAutomationButton(props: RunAutomationButtonProps) {
  const { automationId, automationName, inputs } = props;
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [values, setValues] = useState<Record<string, boolean | string>>({});
  const router = useRouter();

  function openDialog() {
    setError(null);
    setValues(
      Object.fromEntries(inputs.map((input) => [input.name, input.type === 'boolean' ? false : '']))
    );
    setIsOpen(true);
  }

  async function handleRun() {
    const missingInput = inputs.find((input) => input.required && !values[input.name]);

    if (missingInput) {
      setError(`Enter a value for ${missingInput.name}.`);
      return;
    }

    setError(null);
    setIsPending(true);

    const normalizedInputs = Object.fromEntries(
      inputs.map((input) => [
        input.name,
        input.type === 'number' && values[input.name] !== ''
          ? Number(values[input.name])
          : values[input.name],
      ])
    );
    const result = await runAutomation({ automationId, inputs: normalizedInputs });

    if (result.serverError) {
      setError(result.serverError);
      setIsPending(false);
      return;
    }

    setIsOpen(false);
    router.refresh();
    setIsPending(false);
  }

  return (
    <div className="flex flex-col gap-2">
      <Button disabled={isPending} type="button" onClick={openDialog}>
        <PlayIcon data-icon="inline-start" />
        {isPending ? 'Starting...' : 'Run automation'}
      </Button>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <Dialog open={isOpen} onOpenChange={(open) => !isPending && setIsOpen(open)}>
        <DialogContent className="flex max-h-[calc(100svh-2rem)] max-w-lg flex-col gap-0 p-0">
          <DialogHeader className="shrink-0 border-b px-6 py-5">
            <DialogTitle>Run automation {automationName}</DialogTitle>
            <DialogDescription>
              Provide the inputs required to run this automation.
            </DialogDescription>
          </DialogHeader>
          <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
            {inputs.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                This automation does not require inputs.
              </p>
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
                          placeholder="No file selected"
                        />
                        <Button
                          render={<label htmlFor={inputId} />}
                          nativeButton={false}
                          type="button"
                          variant="outline"
                        >
                          <FileIcon data-icon="inline-start" />
                          File
                        </Button>
                        <Input
                          className="sr-only"
                          id={inputId}
                          type="file"
                          onChange={(event) =>
                            setValues({
                              ...values,
                              [input.name]: event.target.files?.[0]?.name ?? '',
                            })
                          }
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
            <DialogClose disabled={isPending}>Cancel</DialogClose>
            <Button disabled={isPending} type="button" onClick={handleRun}>
              {isPending && <LoaderCircleIcon className="animate-spin" data-icon="inline-start" />}
              {isPending ? 'Running...' : 'Run automation'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
