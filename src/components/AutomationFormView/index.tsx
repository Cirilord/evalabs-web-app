'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient } from '@tanstack/react-query';
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
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Controller, useFieldArray, useForm, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { PythonCodeEditor } from '@/components/PythonCodeEditor';
import { queryKeys } from '@/lib/query-keys';
import { createAutomation } from '@/services/automations/client/create-automation';
import { updateAutomation } from '@/services/automations/client/update-automation';
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

import { createAutomationSchema } from './schema/automation-form.schema';
import { type AutomationFormViewProps, type AutomationFormViewValues } from './types';

const DEFAULT_SCRIPT = `def main():\n  # Add your automation logic here.\n  pass\n`;
const PORT_TYPES = ['text', 'file', 'number', 'boolean'] as const;
const PORT_TYPE_ITEMS = PORT_TYPES.map((type) => ({ label: type, value: type }));
const LIBRARIES = [
  'beautifulsoup4',
  'httpx',
  'numpy',
  'openpyxl',
  'pandas',
  'pydantic',
  'requests',
];

export function AutomationFormView(props: AutomationFormViewProps) {
  const { automation } = props;
  const cancelHref = automation ? `/automations/${automation.id}` : '/';
  const isEditing = Boolean(automation);
  const queryClient = useQueryClient();
  const router = useRouter();
  const { t } = useTranslation();
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
  } = useForm<AutomationFormViewValues>({
    defaultValues: {
      description: automation?.description ?? '',
      inputs: automation?.inputs ?? [],
      libraries: automation?.libraries ?? [],
      name: automation?.name ?? '',
      outputs: automation?.outputs ?? [],
      script: automation?.script ?? DEFAULT_SCRIPT,
      scriptMode: automation?.scriptSource === 'file' ? 'file' : 'inline',
      scriptPath: automation?.scriptPath ?? null,
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
    return t('aiPrompt.template', {
      description: values.description || t('aiPrompt.noDescription'),
      inputContract: values.inputs.length
        ? t('aiPrompt.mainWithInputs')
        : t('aiPrompt.mainWithoutInputs'),
      inputs: values.inputs.length
        ? values.inputs
            .map((input) => `- ${input.name || '<name>'} (${input.type}): ${input.description}`)
            .join('\n')
        : t('aiPrompt.noInputs'),
      libraries: values.libraries.length
        ? values.libraries.map((library) => `- ${library.name} (${library.version})`).join('\n')
        : t('aiPrompt.noLibraries'),
      name: values.name || t('aiPrompt.untitledAutomation'),
      outputs: values.outputs.length
        ? values.outputs
            .map((output) => `- ${output.name || '<name>'} (${output.type}): ${output.description}`)
            .join('\n')
        : '{}',
    });
  }
  async function submit(data: AutomationFormViewValues) {
    setIsSubmitting(true);
    try {
      if (!automation) {
        await createAutomation(data);
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: queryKeys.automations }),
          queryClient.invalidateQueries({ queryKey: queryKeys.workflowCatalog }),
        ]);
        router.push('/');

        return;
      }

      const updatedAutomation = await updateAutomation({ ...data, id: automation.id });

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.automation(automation.id) }),
        queryClient.invalidateQueries({ queryKey: queryKeys.automations }),
        queryClient.invalidateQueries({ queryKey: queryKeys.workflowCatalog }),
      ]);
      router.push(`/automations/${updatedAutomation.id}`);
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
    const fieldId = `${kind}-${index}`;
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
              <Label htmlFor={`${fieldId}-name`}>{t('create.name')}</Label>
              <Input
                {...register(`${path}.name`)}
                id={`${fieldId}-name`}
                placeholder={input ? 'file_path' : 'report_file'}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor={`${fieldId}-type`}>
                {input ? t('create.inputType') : t('web.outputType')}
              </Label>
              <Controller
                control={control}
                name={`${path}.type`}
                render={({ field: typeField }) => (
                  <Select
                    items={PORT_TYPE_ITEMS}
                    value={typeField.value}
                    onValueChange={typeField.onChange}
                  >
                    <SelectTrigger id={`${fieldId}-type`} className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>
                          {input ? t('create.inputType') : t('web.outputType')}
                        </SelectLabel>
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
              <Label htmlFor={`${fieldId}-description`}>{t('create.description')}</Label>
              <Input
                {...register(`${path}.description`)}
                id={`${fieldId}-description`}
                placeholder={input ? t('create.inputDescription') : t('web.outputDescription')}
              />
            </div>
          </div>
          <Button
            aria-label={t('common.remove')}
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
            {t('create.required')}
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
            <h1 className="text-2xl font-semibold tracking-tight">
              {isEditing ? t('create.editAutomation') : t('create.createAutomation')}
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              {isEditing ? t('create.editDescription') : t('create.startDescription')}
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
            {t('web.generatePrompt')}
          </Button>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit(submit)}>
          <div className="space-y-2">
            <Label htmlFor="name">{t('create.name')}</Label>
            <Input
              {...register('name')}
              autoFocus
              id="name"
              placeholder={t('create.namePlaceholder')}
            />
            {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">{t('create.description')}</Label>
            <Textarea
              {...register('description')}
              id="description"
              placeholder={t('create.descriptionPlaceholder')}
              rows={5}
            />
          </div>
          <section className="flex flex-col gap-2">
            <div>
              <h2 className="text-base font-medium">{t('create.libraries')}</h2>
              <p className="text-sm text-muted-foreground">{t('create.librariesDescription')}</p>
            </div>
            <div className="rounded-md border p-2">
              <div className="flex gap-2">
                <Input
                  value={libraryQuery}
                  placeholder={t('web.librarySearch')}
                  onChange={(event) => setLibraryQuery(event.target.value)}
                />
                <Button
                  disabled={!query}
                  type="button"
                  variant="outline"
                  onClick={() => addLibrary(query)}
                >
                  <PlusIcon data-icon="inline-start" />
                  {t('common.add')}
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
                  aria-label={t('common.remove')}
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
                <h2 className="text-base font-medium">{t('create.inputs')}</h2>
                <p className="text-sm text-muted-foreground">{t('create.inputsDescription')}</p>
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
                {t('create.addInput')}
              </Button>
            </div>
            {fields.length ? (
              fields.map((field, index) => portEditor('inputs', field, index))
            ) : (
              <p className="rounded-md border border-dashed px-4 py-6 text-sm text-muted-foreground">
                {t('create.noInputs')}
              </p>
            )}
          </section>
          <section className="flex flex-col gap-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-base font-medium">{t('web.outputs')}</h2>
                <p className="text-sm text-muted-foreground">{t('web.outputsDescription')}</p>
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={() => appendOutput({ description: '', name: '', type: 'text' })}
              >
                <PlusIcon data-icon="inline-start" />
                {t('workflow.addOutput')}
              </Button>
            </div>
            {outputFields.length ? (
              outputFields.map((field, index) => portEditor('outputs', field, index))
            ) : (
              <p className="rounded-md border border-dashed px-4 py-6 text-sm text-muted-foreground">
                {t('web.noOutputs')}
              </p>
            )}
          </section>
          <div className="space-y-2">
            <Label htmlFor="script-mode">{t('create.scriptSource')}</Label>
            <Controller
              control={control}
              name="scriptMode"
              render={({ field }) => (
                <Select
                  items={[
                    { label: t('create.scriptSourceInline'), value: 'inline' },
                    { label: t('create.scriptSourceFile'), value: 'file' },
                  ]}
                  value={field.value}
                  onValueChange={field.onChange}
                >
                  <SelectTrigger id="script-mode" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>{t('create.scriptSource')}</SelectLabel>
                      <SelectItem value="inline">{t('create.scriptSourceInline')}</SelectItem>
                      <SelectItem value="file">{t('create.scriptSourceFile')}</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              )}
            />
          </div>
          {scriptMode === 'inline' ? (
            <div className="space-y-2">
              <Label htmlFor="script">{t('create.script')}</Label>
              <p className="text-sm text-muted-foreground">{t('create.scriptHint')}</p>
              <Controller
                control={control}
                name="script"
                render={({ field: scriptField }) => (
                  <PythonCodeEditor
                    ariaLabel={t('create.script')}
                    id="script"
                    value={scriptField.value}
                    onChange={scriptField.onChange}
                  />
                )}
              />
            </div>
          ) : (
            <div className="space-y-2">
              <Label htmlFor="script-file">{t('create.choosePythonFile')}</Label>
              <div className="flex gap-2">
                <Input
                  readOnly
                  value={getValues('scriptPath') ?? ''}
                  placeholder={t('create.noPythonFile')}
                />
                <Button
                  nativeButton={false}
                  render={<label htmlFor="script-file" />}
                  type="button"
                  variant="outline"
                >
                  <FileIcon data-icon="inline-start" />
                  {t('common.file')}
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
            <Button
              nativeButton={false}
              render={<Link href={cancelHref} />}
              type="button"
              variant="outline"
            >
              {t('common.cancel')}
            </Button>
            <Button disabled={isSubmitting} type="submit">
              {isSubmitting
                ? isEditing
                  ? t('create.saving')
                  : t('create.creating')
                : isEditing
                  ? t('common.saveChanges')
                  : t('create.createAutomation')}
            </Button>
          </div>
        </form>
      </div>
      <Dialog open={isPromptOpen} onOpenChange={setIsPromptOpen}>
        <DialogContent className="flex max-h-[calc(100svh-2rem)] max-w-3xl flex-col gap-0 p-0">
          <DialogHeader className="border-b px-6 py-5">
            <DialogTitle>{t('web.generatePromptTitle')}</DialogTitle>
            <DialogDescription>{t('web.generatePromptDescription')}</DialogDescription>
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
              {copyState === 'error' && t('web.copyError')}
            </p>
            <div className="flex gap-3">
              <DialogClose>{t('common.close')}</DialogClose>
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
                {copyState === 'copied' ? t('web.copied') : t('web.copyPrompt')}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}
