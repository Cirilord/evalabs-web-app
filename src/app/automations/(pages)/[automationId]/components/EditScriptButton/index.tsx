'use client';

import { FilePenLineIcon } from 'lucide-react';
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
} from '@/ui/dialog';
import { Textarea } from '@/ui/textarea';

import { updateAutomationScript } from './action';
import { type EditScriptButtonProps } from './types';

export function EditScriptButton(props: EditScriptButtonProps) {
  const { automationId, script: initialScript } = props;
  const { t } = useTranslation();
  const [error, setError] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [script, setScript] = useState(initialScript);
  const router = useRouter();

  async function handleSave() {
    setError(null);
    setIsPending(true);

    const result = await updateAutomationScript({ automationId, script });

    if (result.serverError) {
      setError(result.serverError);
      setIsPending(false);
      return;
    }

    if (result.validationErrors) {
      setError(t('web.validScriptRequired'));
      setIsPending(false);
      return;
    }

    setIsOpen(false);
    router.refresh();
  }

  return (
    <>
      <Button type="button" variant="outline" onClick={() => setIsOpen(true)}>
        <FilePenLineIcon data-icon="inline-start" />
        {t('runs.editScript')}
      </Button>
      <Dialog open={isOpen} onOpenChange={(open) => !isPending && setIsOpen(open)}>
        <DialogContent className="flex max-h-[calc(100svh-2rem)] max-w-4xl flex-col gap-0 p-0">
          <DialogHeader className="shrink-0 border-b px-6 py-5">
            <DialogTitle>{t('runs.editScript')}</DialogTitle>
            <DialogDescription>{t('runs.editScriptDescription')}</DialogDescription>
          </DialogHeader>
          <div className="min-h-0 flex-1 p-6">
            <Textarea
              aria-label={t('web.automationScript')}
              className="min-h-96 resize-y font-mono text-xs"
              value={script}
              onChange={(event) => setScript(event.target.value)}
            />
            {error && <p className="mt-2 text-sm text-destructive">{error}</p>}
          </div>
          <DialogFooter className="shrink-0 border-t px-6 py-4">
            <DialogClose disabled={isPending}>{t('common.cancel')}</DialogClose>
            <Button disabled={isPending} type="button" onClick={handleSave}>
              {isPending ? t('runs.savingScript') : t('common.saveChanges')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
