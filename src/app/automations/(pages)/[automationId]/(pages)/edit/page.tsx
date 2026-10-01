import { notFound } from 'next/navigation';

import { AutomationFormView } from '@/components/AutomationFormView';
import { prisma } from '@/lib/prisma';

import { type EditAutomationPageProps } from './types';

export default async function EditAutomationPage(props: EditAutomationPageProps) {
  const { params } = props;
  const { automationId } = await params;
  const automation = await prisma.automation.findUnique({ where: { id: automationId } });

  if (!automation) {
    notFound();
  }

  return (
    <AutomationFormView
      automation={{
        description: automation.description,
        id: automation.id,
        inputs: automation.inputsJson as never,
        libraries: automation.librariesJson as never,
        name: automation.name,
        outputs: automation.outputsJson as never,
        script: automation.script,
        scriptPath: automation.scriptPath,
        scriptSource: automation.scriptSource,
      }}
    />
  );
}
