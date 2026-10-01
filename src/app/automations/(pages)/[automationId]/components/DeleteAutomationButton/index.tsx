'use client';

import { Trash2Icon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

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

import { deleteAutomation } from './action';
import { type DeleteAutomationButtonProps } from './types';

export function DeleteAutomationButton(props: DeleteAutomationButtonProps) {
  const { automationId, automationName } = props;
  const { t } = useTranslation();
  const [error, setError] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const router = useRouter();

  async function handleDelete() {
    setError(null);
    setIsPending(true);

    const result = await deleteAutomation({ automationId });

    if (result.serverError) {
      setError(result.serverError);
      setIsPending(false);
      return;
    }

    setIsOpen(false);
    router.push('/');
    router.refresh();
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger render={<Button variant="destructive" />}>
        <Trash2Icon data-icon="inline-start" />
        {t('runs.deleteAutomation')}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {t('runs.deleteAutomation')} {automationName}?
          </DialogTitle>
          <DialogDescription>{t('runs.deleteDescription')}</DialogDescription>
        </DialogHeader>
        {error && <p className="text-sm text-destructive">{error}</p>}
        <DialogFooter>
          <DialogClose disabled={isPending}>{t('common.cancel')}</DialogClose>
          <Button disabled={isPending} type="button" variant="destructive" onClick={handleDelete}>
            {isPending ? t('runs.deleting') : t('runs.deleteAutomation')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
