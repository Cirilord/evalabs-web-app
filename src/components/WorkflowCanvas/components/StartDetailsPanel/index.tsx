'use client';

import { ArrowLeftIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { type WorkflowGraph } from '@/lib/workflows';
import { Button } from '@/ui/button';

import { PortEditor } from '../PortEditor';
import { type StartDetailsPanelProps } from './types';

export function StartDetailsPanel(props: StartDetailsPanelProps) {
  const { graph, onClose, onInputsChange } = props;
  const { t } = useTranslation();

  return (
    <aside
      aria-label={t('workflow.startDetails')}
      className="absolute inset-y-0 right-0 z-20 flex w-96 flex-col gap-4 overflow-auto border-l bg-background p-4 shadow-lg"
    >
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-medium">{t('workflow.start')}</h2>
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
      <p>{t('workflow.startDetailsDescription')}</p>
      <div className="flex flex-col gap-2">
        <h3>{t('workflow.inputs')}</h3>
        <PortEditor
          inputs
          ports={graph.inputs}
          onChange={(ports) => onInputsChange(ports as WorkflowGraph['inputs'])}
        />
      </div>
    </aside>
  );
}
