'use client';

import { useQueryClient } from '@tanstack/react-query';
import { Trash2Icon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { queryKeys } from '@/lib/query-keys';
import { deleteWorkflow } from '@/services/workflows/client/delete-workflow';
import { Button } from '@/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/ui/dialog';

import { type DeleteWorkflowButtonProps } from './types';

export function DeleteWorkflowButton(props: DeleteWorkflowButtonProps) {
  const { workflowId } = props;
  const { t } = useTranslation();
  const [isPending, setIsPending] = useState(false);
  const queryClient = useQueryClient();
  const router = useRouter();

  async function handleDelete() {
    setIsPending(true);
    await deleteWorkflow({ workflowId });
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: queryKeys.workflows }),
      queryClient.invalidateQueries({ queryKey: queryKeys.workflowCatalog }),
    ]);
    router.push('/');
  }

  return (
    <Dialog>
      <DialogTrigger render={<Button variant="destructive" />}>
        <Trash2Icon data-icon="inline-start" />
        {t('runs.deleteAutomation')}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('workflow.deleteWorkflow')}</DialogTitle>
          <DialogDescription>{t('workflow.deleteDescription')}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose disabled={isPending}>{t('common.cancel')}</DialogClose>
          <Button
            disabled={isPending}
            type="button"
            variant="destructive"
            onClick={() => void handleDelete()}
          >
            {t('runs.deleteAutomation')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
