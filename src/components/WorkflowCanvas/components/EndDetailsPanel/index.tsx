'use client';

import { ArrowLeftIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { type WorkflowGraph } from '@/lib/workflows';
import { Button } from '@/ui/button';
import { Field, FieldLabel } from '@/ui/field';
import { Input } from '@/ui/input';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/ui/select';

import { PortEditor } from '../PortEditor';
import { type EndDetailsPanelProps } from './types';

export function EndDetailsPanel(props: EndDetailsPanelProps) {
  const { catalog, graph, onClose, onFixedOutputsChange, onOutputBindingsChange, onOutputsChange } =
    props;
  const { t } = useTranslation();

  return (
    <aside
      aria-label={t('workflow.endDetails')}
      className="absolute inset-y-0 right-0 z-20 flex w-96 flex-col gap-4 overflow-auto border-l bg-background p-4 shadow-lg"
    >
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-medium">{t('workflow.end')}</h2>
        <Button
          aria-label={t('common.close')}
          size="icon"
          type="button"
          variant="ghost"
          onClick={onClose}
        >
          <ArrowLeftIcon />
        </Button>
      </div>
      <p>{t('workflow.endDetailsDescription')}</p>
      <div className="flex flex-col gap-2">
        <h3>{t('workflow.workflowOutputs')}</h3>
        <PortEditor
          inputs={false}
          ports={graph.outputs}
          onChange={(ports) => onOutputsChange(ports as WorkflowGraph['outputs'])}
          renderPortDetails={(port) => {
            const sourceOptions = graph.output.sources.flatMap((sourceId) => {
              const sourceNode = graph.nodes.find((node) => node.id === sourceId);
              const runnable = sourceNode
                ? catalog.find(
                    (item) =>
                      item.id === sourceNode.runnableId && item.type === sourceNode.runnableType
                  )
                : undefined;

              return (runnable?.outputs ?? [])
                .filter((output) => output.type === port.type)
                .map((output) => ({
                  label: `${runnable?.name ?? t('workflow.missingRunnable')} · ${output.name}`,
                  value: JSON.stringify({ nodeId: sourceId, outputName: output.name }),
                }));
            });
            const options = Array.from(
              new Map(sourceOptions.map((option) => [option.value, option])).values()
            );
            const fixedValue = graph.output.fixedOutputs[port.name];
            const outputMode = Object.hasOwn(graph.output.fixedOutputs, port.name)
              ? 'fixed'
              : 'connection';
            const connectedValue = graph.outputBindings[port.name]
              ? JSON.stringify(graph.outputBindings[port.name])
              : null;

            return (
              <Field className="mt-4">
                <div className="flex flex-col gap-3">
                  <div className="grid gap-2">
                    <FieldLabel>{t('workflow.valueSource')}</FieldLabel>
                    <Select
                      items={[
                        { label: t('workflow.connectionInput'), value: 'connection' },
                        { label: t('workflow.fixedValue'), value: 'fixed' },
                      ]}
                      value={outputMode}
                      onValueChange={(nextValue) => {
                        const outputBindings = { ...graph.outputBindings };
                        const fixedOutputs = { ...graph.output.fixedOutputs };

                        delete outputBindings[port.name];
                        delete fixedOutputs[port.name];

                        if (nextValue === 'fixed') {
                          fixedOutputs[port.name] =
                            port.type === 'boolean' ? false : port.type === 'number' ? 0 : '';
                        }

                        onOutputBindingsChange(outputBindings);
                        onFixedOutputsChange(fixedOutputs);
                      }}
                    >
                      <SelectTrigger
                        aria-label={t('workflow.sourceForOutput', { name: port.name })}
                        className="h-9 w-full"
                      >
                        <SelectValue placeholder={t('workflow.selectOutput')} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectItem value="connection">
                            {t('workflow.connectionInput')}
                          </SelectItem>
                          <SelectItem value="fixed">{t('workflow.fixedValue')}</SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <FieldLabel>
                      {t(outputMode === 'fixed' ? 'workflow.value' : 'workflow.connectedOutput')}
                    </FieldLabel>
                    {outputMode === 'fixed' ? (
                      port.type === 'boolean' ? (
                        <Select
                          items={[
                            { label: t('workflow.true'), value: 'true' },
                            { label: t('workflow.false'), value: 'false' },
                          ]}
                          value={String(fixedValue)}
                          onValueChange={(nextValue) => {
                            onFixedOutputsChange({
                              ...graph.output.fixedOutputs,
                              [port.name]: nextValue === 'true',
                            });
                          }}
                        >
                          <SelectTrigger aria-label={port.name} className="h-9 w-full">
                            <SelectValue placeholder={t('workflow.selectValue')} />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectGroup>
                              <SelectItem value="true">{t('workflow.true')}</SelectItem>
                              <SelectItem value="false">{t('workflow.false')}</SelectItem>
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                      ) : (
                        <Input
                          aria-label={port.name}
                          step={port.type === 'number' ? 'any' : undefined}
                          type={port.type === 'number' ? 'number' : 'text'}
                          value={
                            typeof fixedValue === 'string' || typeof fixedValue === 'number'
                              ? fixedValue
                              : ''
                          }
                          onChange={(event) => {
                            const nextValue =
                              port.type === 'number'
                                ? event.target.value === ''
                                  ? ''
                                  : Number(event.target.value)
                                : event.target.value;

                            onFixedOutputsChange({
                              ...graph.output.fixedOutputs,
                              [port.name]: nextValue,
                            });
                          }}
                        />
                      )
                    ) : (
                      <Select
                        items={options}
                        value={connectedValue}
                        onValueChange={(nextValue) => {
                          const outputBindings = { ...graph.outputBindings };

                          if (nextValue) {
                            outputBindings[port.name] = JSON.parse(
                              nextValue
                            ) as WorkflowGraph['outputBindings'][string];
                          } else {
                            delete outputBindings[port.name];
                          }

                          onOutputBindingsChange(outputBindings);
                        }}
                      >
                        <SelectTrigger
                          aria-label={t('workflow.sourceForOutput', { name: port.name })}
                          className="h-9 w-full"
                        >
                          <SelectValue placeholder={t('workflow.selectOutput')} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            {options.map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                            {options.length === 0 && (
                              <p className="px-2 py-1.5 text-sm text-muted-foreground">
                                {t('workflow.noCompatibleOutputs')}
                              </p>
                            )}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    )}
                  </div>
                </div>
              </Field>
            );
          }}
        />
      </div>
    </aside>
  );
}
