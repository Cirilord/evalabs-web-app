'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import {
  CheckIcon,
  CopyIcon,
  FileIcon,
  PlusIcon,
  SparklesIcon,
  Trash2Icon,
  XIcon,
} from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { Controller, useFieldArray, useForm, useWatch } from 'react-hook-form';

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
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/ui/select';
import { Textarea } from '@/ui/textarea';

import { type CreateAutomationViewProps, type CreateAutomationViewValues } from './types';
import { createAutomation } from '../../action';
import { createAutomationSchema } from '../../schema/create-automation.schema';

const DEFAULT_SCRIPT = `def main():\n  # Add your automation logic here.\n  pass\n`;
const PORT_TYPES = ['text', 'file', 'number', 'boolean'] as const;
const PORT_TYPE_ITEMS = PORT_TYPES.map((type) => ({ label: type, value: type }));
const SCRIPT_SOURCE_ITEMS = [
  { label: 'Write script', value: 'inline' },
  { label: 'Choose Python file', value: 'file' },
];
const LIBRARIES = [
  'beautifulsoup4',
  'httpx',
  'numpy',
  'openpyxl',
  'pandas',
  'pydantic',
  'requests',
];

export function CreateAutomationView(props: CreateAutomationViewProps) {
  void props;
  const [isPromptOpen, setIsPromptOpen] = useState(false);
  const [libraryQuery, setLibraryQuery] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copyState, setCopyState] = useState<'copied' | 'error' | 'idle'>('idle');
  const {
    control,
    formState: { errors },
    getValues,
    handleSubmit,
    register,
    setError,
    setValue,
    trigger,
  } = useForm<CreateAutomationViewValues>({
    defaultValues: {
      description: '',
      inputs: [],
      libraries: [],
      name: '',
      outputs: [],
      script: DEFAULT_SCRIPT,
      scriptMode: 'inline',
      scriptPath: null,
    },
    resolver: zodResolver(createAutomationSchema),
  });
  const { append, fields, remove } = useFieldArray({ control, name: 'inputs' });
  const {
    append: appendOutput,
    fields: outputFields,
    remove: removeOutput,
  } = useFieldArray({ control, name: 'outputs' });
  const libraries = useWatch({ control, name: 'libraries' });
  const scriptMode = useWatch({ control, name: 'scriptMode' });
  const query = libraryQuery.trim();
  const suggestions = LIBRARIES.filter(
    (name) =>
      name.includes(query.toLowerCase()) && !libraries.some((library) => library.name === name)
  );

  function synchronizeMainInputs(inputCount: number) {
    const script = getValues('script');
    const mainFunction = script.match(/\bdef\s+main\s*\([^)]*\)/)?.[0];
    if (mainFunction)
      setValue(
        'script',
        script.replace(mainFunction, `def main(${inputCount ? 'inputs: dict' : ''})`)
      );
  }
  function addLibrary(name: string) {
    if (name && !libraries.some((library) => library.name.toLowerCase() === name.toLowerCase()))
      setValue('libraries', [...libraries, { name, version: 'latest' }]);
    setLibraryQuery('');
  }
  function prompt() {
    const values = getValues();
    return `Write a Python automation named "${values.name || 'Untitled automation'}".\n\nDescription: ${values.description || 'No description'}\n\nImplementation contract:\n- Respond with only complete Python code.\n- Define ${values.inputs.length ? 'main(inputs: dict)' : 'main()'}.\n- Use print() for execution logs when useful.\n- Never call input() or require interactive user input.\n\nInputs:\n${values.inputs.length ? values.inputs.map((input) => `- ${input.name || '<name>'} (${input.type}): ${input.description}`).join('\n') : '- No inputs'}\n\nLibraries:\n${values.libraries.length ? values.libraries.map((library) => `- ${library.name} (${library.version})`).join('\n') : '- No libraries'}\n\nOutputs:\n${values.outputs.length ? values.outputs.map((output) => `- ${output.name || '<name>'} (${output.type}): ${output.description}`).join('\n') : '- {}'}`;
  }
  async function submit(data: CreateAutomationViewValues) {
    setIsSubmitting(true);
    try {
      const result = await createAutomation(data);

      if (result.serverError) {
        setError('root', { message: result.serverError });
        setIsSubmitting(false);
      } else if (result.validationErrors) {
        setError('root', { message: 'Check the form fields and try again.' });
        setIsSubmitting(false);
      }
    } catch (error) {
      setError('root', { message: error instanceof Error ? error.message : String(error) });
      setIsSubmitting(false);
    }
  }
  async function chooseFile(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.currentTarget.files?.[0];
    if (!file) return;
    setValue('script', await file.text());
    setValue('scriptPath', file.name, { shouldValidate: true });
  }
  function portEditor(kind: 'inputs' | 'outputs', field: { id: string }, index: number) {
    const input = kind === 'inputs';
    const path = input ? (`inputs.${index}` as const) : (`outputs.${index}` as const);
    const removePort = () => {
      if (input) {
        synchronizeMainInputs(fields.length - 1);
        remove(index);
        void trigger('script');
      } else removeOutput(index);
    };
    return (
      <div key={field.id} className="rounded-lg border bg-background p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="grid flex-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor={`${kind}-name-${field.id}`}>Name</Label>
              <Input
                {...register(`${path}.name`)}
                id={`${kind}-name-${field.id}`}
                placeholder={input ? 'file_path' : 'report_file'}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor={`${kind}-type-${field.id}`}>{input ? 'Input' : 'Output'} type</Label>
              <Controller
                control={control}
                name={`${path}.type`}
                render={({ field: typeField }) => (
                  <Select
                    items={PORT_TYPE_ITEMS}
                    value={typeField.value}
                    onValueChange={typeField.onChange}
                  >
                    <SelectTrigger id={`${kind}-type-${field.id}`} className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>{input ? 'Input' : 'Output'} type</SelectLabel>
                        {PORT_TYPES.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor={`${kind}-description-${field.id}`}>Description</Label>
              <Input
                {...register(`${path}.description`)}
                id={`${kind}-description-${field.id}`}
                placeholder={
                  input ? 'Describe the value this automation needs' : 'Describe the returned value'
                }
              />
            </div>
          </div>
          <Button
            aria-label={`Remove ${kind}`}
            size="icon"
            type="button"
            variant="ghost"
            onClick={removePort}
          >
            <Trash2Icon />
          </Button>
        </div>
        {input && (
          <label className="mt-4 flex items-center gap-2 text-sm font-medium">
            <Controller
              control={control}
              name={`inputs.${index}.required`}
              render={({ field: requiredField }) => (
                <Checkbox checked={requiredField.value} onCheckedChange={requiredField.onChange} />
              )}
            />
            Required
          </label>
        )}
      </div>
    );
  }
  return (
    <main className="flex-1 p-6 sm:p-10">
      <div className="w-full">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Create automation</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Start with a name, a short description, and the script that runs the automation.
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setCopyState('idle');
              setIsPromptOpen(true);
            }}
          >
            <SparklesIcon data-icon="inline-start" />
            Generate AI prompt
          </Button>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit(submit)}>
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              {...register('name')}
              autoFocus
              id="name"
              placeholder="Merge monthly spreadsheets"
            />
            {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              {...register('description')}
              id="description"
              placeholder="Describe what this automation does"
              rows={5}
            />
          </div>
          <section className="flex flex-col gap-2">
            <div>
              <h2 className="text-base font-medium">Libraries</h2>
              <p className="text-sm text-muted-foreground">
                Choose the PyPI packages this automation needs. Each package uses the latest release
                by default.
              </p>
            </div>
            <div className="rounded-md border p-2">
              <div className="flex gap-2">
                <Input
                  value={libraryQuery}
                  placeholder="Search or add a PyPI package..."
                  onChange={(event) => setLibraryQuery(event.target.value)}
                />
                <Button
                  disabled={!query}
                  type="button"
                  variant="outline"
                  onClick={() => addLibrary(query)}
                >
                  <PlusIcon data-icon="inline-start" />
                  Add
                </Button>
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                {suggestions.map((name) => (
                  <Button
                    key={name}
                    size="sm"
                    type="button"
                    variant="ghost"
                    onClick={() => addLibrary(name)}
                  >
                    <PlusIcon data-icon="inline-start" />
                    {name}
                  </Button>
                ))}
              </div>
            </div>
            {libraries.map((library) => (
              <div
                key={library.name}
                className="flex items-center gap-2 rounded-md border bg-muted p-2"
              >
                <span className="flex-1 text-sm">
                  <CheckIcon className="mr-1 inline size-3" />
                  {library.name}
                </span>
                <Input
                  className="h-7 w-28"
                  value={library.version}
                  onChange={(event) =>
                    setValue(
                      'libraries',
                      libraries.map((item) =>
                        item.name === library.name ? { ...item, version: event.target.value } : item
                      )
                    )
                  }
                />
                <Button
                  aria-label={`Remove ${library.name}`}
                  size="icon-xs"
                  type="button"
                  variant="ghost"
                  onClick={() =>
                    setValue(
                      'libraries',
                      libraries.filter((item) => item.name !== library.name)
                    )
                  }
                >
                  <XIcon />
                </Button>
              </div>
            ))}
          </section>
          <section className="flex flex-col gap-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-base font-medium">Inputs</h2>
                <p className="text-sm text-muted-foreground">
                  Define the values this automation receives when it runs.
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  synchronizeMainInputs(fields.length + 1);
                  append({ description: '', name: '', required: false, type: 'text' });
                }}
              >
                <PlusIcon data-icon="inline-start" />
                Add input
              </Button>
            </div>
            {fields.length ? (
              fields.map((field, index) => portEditor('inputs', field, index))
            ) : (
              <p className="rounded-md border border-dashed px-4 py-6 text-sm text-muted-foreground">
                This automation does not require any inputs yet.
              </p>
            )}
          </section>
          <section className="flex flex-col gap-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-base font-medium">Outputs</h2>
                <p className="text-sm text-muted-foreground">
                  Declare the values returned by main as a dictionary.
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={() => appendOutput({ description: '', name: '', type: 'text' })}
              >
                <PlusIcon data-icon="inline-start" />
                Add output
              </Button>
            </div>
            {outputFields.length ? (
              outputFields.map((field, index) => portEditor('outputs', field, index))
            ) : (
              <p className="rounded-md border border-dashed px-4 py-6 text-sm text-muted-foreground">
                This automation does not return outputs yet.
              </p>
            )}
          </section>
          <div className="space-y-2">
            <Label htmlFor="script-mode">Script source</Label>
            <Controller
              control={control}
              name="scriptMode"
              render={({ field }) => (
                <Select
                  items={SCRIPT_SOURCE_ITEMS}
                  value={field.value}
                  onValueChange={field.onChange}
                >
                  <SelectTrigger id="script-mode" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Script source</SelectLabel>
                      <SelectItem value="inline">Write script</SelectItem>
                      <SelectItem value="file">Choose Python file</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              )}
            />
          </div>
          {scriptMode === 'inline' ? (
            <div className="space-y-2">
              <Label htmlFor="script">Script</Label>
              <p className="text-sm text-muted-foreground">
                Define main() when there are no inputs, or main(inputs) otherwise. Use print for
                logs; input() is not supported.
              </p>
              <Textarea
                {...register('script')}
                className="min-h-80 font-mono text-xs"
                id="script"
              />
            </div>
          ) : (
            <div className="space-y-2">
              <Label htmlFor="script-file">Choose Python file</Label>
              <div className="flex gap-2">
                <Input
                  readOnly
                  value={getValues('scriptPath') ?? ''}
                  placeholder="No Python file selected"
                />
                <Button
                  nativeButton={false}
                  render={<label htmlFor="script-file" />}
                  type="button"
                  variant="outline"
                >
                  <FileIcon data-icon="inline-start" />
                  File
                </Button>
                <Input
                  accept=".py"
                  className="sr-only"
                  id="script-file"
                  type="file"
                  onChange={chooseFile}
                />
              </div>
            </div>
          )}
          {errors.root && <p className="text-sm text-destructive">{errors.root.message}</p>}
          <div className="flex justify-end gap-3">
            <Button nativeButton={false} render={<Link href="/" />} type="button" variant="outline">
              Cancel
            </Button>
            <Button disabled={isSubmitting} type="submit">
              {isSubmitting ? 'Creating...' : 'Create automation'}
            </Button>
          </div>
        </form>
      </div>
      <Dialog open={isPromptOpen} onOpenChange={setIsPromptOpen}>
        <DialogContent className="flex max-h-[calc(100svh-2rem)] max-w-3xl flex-col gap-0 p-0">
          <DialogHeader className="border-b px-6 py-5">
            <DialogTitle>Generate script with AI</DialogTitle>
            <DialogDescription>
              Copy this prompt into your preferred AI assistant to generate the Python script.
            </DialogDescription>
          </DialogHeader>
          <div className="p-6">
            <Textarea
              className="min-h-80 resize-none font-mono text-xs"
              readOnly
              value={prompt()}
            />
          </div>
          <DialogFooter className="items-center justify-between border-t px-6 py-4">
            <p className="text-sm text-destructive">
              {copyState === 'error' && 'Could not copy the prompt. Select and copy it manually.'}
            </p>
            <div className="flex gap-3">
              <DialogClose>Close</DialogClose>
              <Button
                type="button"
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(prompt());
                    setCopyState('copied');
                  } catch {
                    setCopyState('error');
                  }
                }}
              >
                {copyState === 'copied' ? (
                  <CheckIcon data-icon="inline-start" />
                ) : (
                  <CopyIcon data-icon="inline-start" />
                )}
                {copyState === 'copied' ? 'Copied' : 'Copy prompt'}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}
