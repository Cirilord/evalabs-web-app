'use client';

import { Trash2Icon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

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
        Delete automation
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete automation {automationName}?</DialogTitle>
          <DialogDescription>
            This action cannot be undone. The automation and its run history will be permanently
            deleted.
          </DialogDescription>
        </DialogHeader>
        {error && <p className="text-sm text-destructive">{error}</p>}
        <DialogFooter>
          <DialogClose disabled={isPending}>Cancel</DialogClose>
          <Button disabled={isPending} type="button" variant="destructive" onClick={handleDelete}>
            {isPending ? 'Deleting...' : 'Delete automation'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
