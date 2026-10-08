'use client';

import { PlusIcon, Trash2Icon } from 'lucide-react';
import { useId } from 'react';
import { useTranslation } from 'react-i18next';

import { type WorkflowInput, type WorkflowOutput, type WorkflowPortType } from '@/lib/workflows';
import { Button } from '@/ui/button';
import { Checkbox } from '@/ui/checkbox';
import { Field, FieldGroup, FieldLabel } from '@/ui/field';
import { Input } from '@/ui/input';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/ui/select';

import { type PortEditorProps } from './types';

type WorkflowPort = WorkflowInput | WorkflowOutput;

const PORT_TYPES: readonly WorkflowPortType[] = ['text', 'file', 'number', 'boolean'];

export function PortEditor(props: PortEditorProps) {
  const { inputs, onChange, ports, renderPortDetails } = props;
  const { t } = useTranslation();
  const id = useId();
  function updatePort(index: number, patch: Partial<WorkflowPort>) {
    onChange(
      ports.map((port, currentIndex) => (currentIndex === index ? { ...port, ...patch } : port))
    );
  }

  function addPort() {
    const port = inputs
      ? { description: '', name: '', required: false, type: 'text' as const }
      : { description: '', name: '', type: 'text' as const };

    onChange([...ports, port]);
  }

  return (
    <FieldGroup>
      {ports.map((port, index) => {
        const removePort = () =>
          onChange(ports.filter((_, currentIndex) => currentIndex !== index));

        return (
          <div key={index} className="rounded-lg border bg-card p-4">
            <div className="flex items-center justify-between gap-4 border-b border-border/50 pb-3">
              <p className="text-sm font-medium">
                {t(inputs ? 'workflow.input' : 'workflow.output')} {index + 1}
              </p>
              <Button
                aria-label={t('common.remove')}
                size="icon"
                type="button"
                variant="destructive"
                onClick={removePort}
              >
                <Trash2Icon />
              </Button>
            </div>
            <div className="mt-4 flex items-start justify-between gap-4">
              <div className="grid flex-1 gap-4 sm:grid-cols-2">
                <Field>
                  <FieldLabel htmlFor={`${id}-${index}-name`}>{t('workflow.name')}</FieldLabel>
                  <Input
                    id={`${id}-${index}-name`}
                    value={port.name}
                    onChange={(event) => updatePort(index, { name: event.target.value })}
                  />
                </Field>
                <Field>
                  <FieldLabel>{t('workflow.type')}</FieldLabel>
                  <Select
                    items={PORT_TYPES.map((type) => ({ label: type, value: type }))}
                    value={port.type}
                    onValueChange={(value) => {
                      if (
                        value === 'boolean' ||
                        value === 'file' ||
                        value === 'number' ||
                        value === 'text'
                      ) {
                        updatePort(index, { type: value });
                      }
                    }}
                  >
                    <SelectTrigger className="h-9 w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {PORT_TYPES.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </Field>
                <Field className="sm:col-span-2">
                  <FieldLabel htmlFor={`${id}-${index}-description`}>
                    {t('workflow.description')}
                  </FieldLabel>
                  <Input
                    id={`${id}-${index}-description`}
                    value={port.description}
                    onChange={(event) => updatePort(index, { description: event.target.value })}
                  />
                </Field>
              </div>
            </div>
            {inputs && 'required' in port && (
              <label className="mt-4 flex items-center gap-2 text-sm font-medium">
                <Checkbox
                  checked={port.required}
                  onCheckedChange={(checked) => updatePort(index, { required: checked === true })}
                />
                {t('workflow.required')}
              </label>
            )}
            {renderPortDetails?.(port, index)}
          </div>
        );
      })}
      <Button type="button" variant="outline" onClick={addPort}>
        <PlusIcon data-icon="inline-start" />
        {t(inputs ? 'workflow.addInput' : 'workflow.addOutput')}
      </Button>
    </FieldGroup>
  );
}
