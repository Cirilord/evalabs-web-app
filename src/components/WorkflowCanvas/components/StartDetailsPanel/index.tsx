'use client';

import { useTranslation } from 'react-i18next';

import { type WorkflowGraph } from '@/lib/workflows';

import { PortEditor } from '../PortEditor';
import { type StartDetailsPanelProps } from './types';

export function StartDetailsPanel(props: StartDetailsPanelProps) {
  const { graph, onInputsChange } = props;
  const { t } = useTranslation();

  return (
    <aside
      aria-label={t('workflow.startDetails')}
      className="absolute inset-y-0 right-0 z-20 flex w-[32rem] flex-col gap-4 overflow-auto border-l bg-background p-4 shadow-lg"
    >
      <h2>{t('workflow.start')}</h2>
      <p>{t('workflow.startDetailsDescription')}</p>
      <fieldset className="flex flex-col gap-3">
        <legend>{t('workflow.inputs')}</legend>
        <PortEditor
          inputs
          ports={graph.inputs}
          onChange={(ports) => onInputsChange(ports as WorkflowGraph['inputs'])}
        />
      </fieldset>
    </aside>
  );
}
