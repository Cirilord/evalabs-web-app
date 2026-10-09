import { PencilIcon } from 'lucide-react';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';

import { Button } from '@/ui/button';

import { type EditWorkflowButtonProps } from './types';

export function EditWorkflowButton(props: EditWorkflowButtonProps) {
  const { workflowId } = props;
  const { t } = useTranslation();

  return (
    <Button
      nativeButton={false}
      render={<Link href={`/workflows/${workflowId}/edit`} />}
      type="button"
      variant="outline"
    >
      <PencilIcon data-icon="inline-start" />
      {t('workflow.edit')}
    </Button>
  );
}
