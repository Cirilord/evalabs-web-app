'use client';

import { python } from '@codemirror/lang-python';
import { oneDark } from '@codemirror/theme-one-dark';
import CodeMirror from '@uiw/react-codemirror';
import { BotIcon, Code2Icon, LogInIcon, LogOutIcon, WorkflowIcon } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Button } from '@/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/ui/dialog';

import { type OnboardingTutorialProps } from './types';

const SLIDES = [
  {
    descriptionKey: 'tutorial.automationDescription',
    icon: BotIcon,
    preview: 'automation',
    stepKeys: ['tutorial.automationStepOne', 'tutorial.automationStepTwo'],
    titleKey: 'tutorial.automationTitle',
  },
  {
    descriptionKey: 'tutorial.inputsDescription',
    icon: LogInIcon,
    preview: 'inputs',
    stepKeys: ['tutorial.inputsStepOne', 'tutorial.inputsStepTwo'],
    titleKey: 'tutorial.inputsTitle',
  },
  {
    descriptionKey: 'tutorial.outputsDescription',
    icon: LogOutIcon,
    preview: 'outputs',
    stepKeys: ['tutorial.outputsStepOne', 'tutorial.outputsStepTwo'],
    titleKey: 'tutorial.outputsTitle',
  },
  {
    descriptionKey: 'tutorial.workflowDescription',
    icon: WorkflowIcon,
    preview: 'workflow',
    stepKeys: ['tutorial.workflowStepOne', 'tutorial.workflowStepTwo'],
    titleKey: 'tutorial.workflowTitle',
  },
  {
    descriptionKey: 'tutorial.pythonDescription',
    icon: Code2Icon,
    preview: 'python',
    stepKeys: ['tutorial.pythonStepOne', 'tutorial.pythonStepTwo'],
    titleKey: 'tutorial.pythonTitle',
  },
] as const;

const PYTHON_EXAMPLE = `from eva import Inputs, Outputs

def main(inputs: Inputs):
    # report is the value created by this automation
    report = create_report(inputs.get('search'))

    outputs = Outputs()
    outputs.add('report', report)
    return outputs`;

function renderTutorialPreview(
  kind: (typeof SLIDES)[number]['preview'],
  t: (key: string) => string
) {
  if (kind === 'automation') {
    return (
      <div className="rounded-xl border bg-background p-4 text-foreground shadow-sm">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">{t('tutorial.previewAutomation')}</span>
          <span className="rounded bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
            {t('tutorial.previewPython')}
          </span>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
          <div className="rounded-md border bg-muted/50 p-2.5">
            <p className="text-muted-foreground">{t('tutorial.previewInput')}</p>
            <p className="mt-1 font-medium">search</p>
          </div>
          <div className="rounded-md border bg-muted/50 p-2.5">
            <p className="text-muted-foreground">{t('tutorial.previewOutput')}</p>
            <p className="mt-1 font-medium">report.csv</p>
          </div>
        </div>
      </div>
    );
  }

  if (kind === 'workflow') {
    return (
      <div className="flex items-center gap-2 rounded-xl border bg-background p-4 text-foreground shadow-sm">
        <div className="rounded-md border bg-muted px-3 py-2 text-xs font-medium">
          {t('tutorial.previewStart')}
        </div>
        <span className="h-px flex-1 bg-primary" />
        <div className="rounded-md border border-primary/50 bg-primary/10 px-3 py-2 text-xs font-medium">
          {t('tutorial.previewAutomation')}
        </div>
        <span className="h-px flex-1 bg-primary" />
        <div className="rounded-md border bg-muted px-3 py-2 text-xs font-medium">
          {t('tutorial.previewEnd')}
        </div>
      </div>
    );
  }

  if (kind === 'inputs') {
    return (
      <div className="rounded-xl border bg-background p-4 text-foreground shadow-sm">
        <p className="text-sm font-medium">{t('tutorial.previewInputs')}</p>
        <div className="mt-3 space-y-2">
          <div className="flex items-center justify-between rounded-md border bg-muted/50 px-3 py-2 text-xs">
            <span className="font-medium">{t('tutorial.previewText')}</span>
            <span className="text-muted-foreground">{t('tutorial.inputTextValue')}</span>
          </div>
          <div className="flex items-center justify-between rounded-md border bg-muted/50 px-3 py-2 text-xs">
            <span className="font-medium">{t('tutorial.previewNumber')}</span>
            <span className="text-muted-foreground">{t('tutorial.inputNumberValue')}</span>
          </div>
          <div className="flex items-center justify-between rounded-md border bg-muted/50 px-3 py-2 text-xs">
            <span className="font-medium">{t('tutorial.previewBoolean')}</span>
            <span className="text-muted-foreground">{t('tutorial.inputBooleanValue')}</span>
          </div>
          <div className="flex items-center justify-between rounded-md border bg-muted/50 px-3 py-2 text-xs">
            <span className="font-medium">{t('tutorial.previewFile')}</span>
            <span className="text-muted-foreground">{t('tutorial.inputFileValue')}</span>
          </div>
        </div>
      </div>
    );
  }

  if (kind === 'outputs') {
    return (
      <div className="rounded-xl border bg-background p-4 text-foreground shadow-sm">
        <p className="text-sm font-medium">{t('tutorial.previewOutputs')}</p>
        <div className="mt-3 space-y-2">
          <div className="flex items-center justify-between rounded-md border bg-muted/50 px-3 py-2 text-xs">
            <span className="font-medium">{t('tutorial.previewText')}</span>
            <span className="text-muted-foreground">{t('tutorial.outputTextValue')}</span>
          </div>
          <div className="flex items-center justify-between rounded-md border bg-muted/50 px-3 py-2 text-xs">
            <span className="font-medium">{t('tutorial.previewNumber')}</span>
            <span className="text-muted-foreground">{t('tutorial.outputNumberValue')}</span>
          </div>
          <div className="flex items-center justify-between rounded-md border bg-muted/50 px-3 py-2 text-xs">
            <span className="font-medium">{t('tutorial.previewBoolean')}</span>
            <span className="text-muted-foreground">{t('tutorial.outputBooleanValue')}</span>
          </div>
          <div className="flex items-center justify-between rounded-md border bg-muted/50 px-3 py-2 text-xs">
            <span className="font-medium">{t('tutorial.previewFile')}</span>
            <span className="text-muted-foreground">{t('tutorial.outputFileValue')}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <CodeMirror
      aria-label={t('tutorial.pythonTitle')}
      className="overflow-hidden rounded-xl border shadow-sm"
      editable={false}
      extensions={[python()]}
      height="15rem"
      id="tutorial-python-example"
      theme={oneDark}
      value={PYTHON_EXAMPLE}
      onChange={(value) => void value}
    />
  );
}

export function OnboardingTutorial(props: OnboardingTutorialProps) {
  const { onComplete } = props;
  const { t } = useTranslation();
  const [slideIndex, setSlideIndex] = useState(0);
  const slide = SLIDES[slideIndex]!;
  const Icon = slide.icon;
  const isLastSlide = slideIndex === SLIDES.length - 1;

  function goToPreviousSlide() {
    setSlideIndex((currentSlideIndex) => Math.max(0, currentSlideIndex - 1));
  }

  function goToNextSlide() {
    if (isLastSlide) {
      onComplete();
      return;
    }

    setSlideIndex((currentSlideIndex) => currentSlideIndex + 1);
  }

  return (
    <Dialog open>
      <DialogContent className="overflow-hidden p-0 sm:max-w-xl">
        <div className="bg-primary p-8 text-primary-foreground">
          <div className="flex size-12 items-center justify-center rounded-xl bg-primary-foreground/15">
            <Icon className="size-6" />
          </div>
          <p className="mt-8 text-sm font-medium tracking-[0.2em] uppercase opacity-70">
            {t('tutorial.welcome')}
          </p>
          <DialogHeader className="mt-3">
            <DialogTitle className="text-3xl text-primary-foreground">
              {t(slide.titleKey)}
            </DialogTitle>
            <DialogDescription className="text-base leading-7 text-primary-foreground/75">
              {t(slide.descriptionKey)}
            </DialogDescription>
          </DialogHeader>
        </div>
        <div className="space-y-5 px-6 py-6">
          {renderTutorialPreview(slide.preview, t)}
          <ul className="space-y-2 text-sm text-muted-foreground">
            {slide.stepKeys.map((stepKey) => (
              <li className="flex gap-2" key={stepKey}>
                <span className="mt-2 size-1.5 shrink-0 rounded-full bg-primary" />
                <span>{t(stepKey)}</span>
              </li>
            ))}
          </ul>
        </div>
        <DialogFooter className="flex-row items-center justify-between px-6 py-5 sm:justify-between">
          <div className="flex gap-1.5" aria-label={t('tutorial.progress')}>
            {SLIDES.map((item, index) => (
              <span
                className={
                  index === slideIndex
                    ? 'h-1.5 w-5 rounded-full bg-primary'
                    : 'size-1.5 rounded-full bg-muted-foreground/30'
                }
                key={item.titleKey}
              />
            ))}
          </div>
          <div className="flex gap-2">
            {slideIndex > 0 && (
              <Button type="button" variant="outline" onClick={goToPreviousSlide}>
                {t('tutorial.back')}
              </Button>
            )}
            <Button type="button" onClick={goToNextSlide}>
              {isLastSlide ? t('tutorial.finish') : t('tutorial.next')}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
