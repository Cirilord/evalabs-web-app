'use client';

import { CheckIcon } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useLocale } from '@/contexts/LocaleProvider';
import { useRunner } from '@/contexts/RunnerProvider';
import { useTelemetry } from '@/contexts/TelemetryProvider';
import { useTheme } from '@/contexts/ThemeProvider';
import {
  getPyodideRunner,
  getPyodideRunnerLabel,
  isPyodideRunnerId,
  PYODIDE_RUNNERS,
  type PyodideRunnerId,
} from '@/lib/runner';
import { Button } from '@/ui/button';
import { Checkbox } from '@/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/ui/select';

import { type OnboardingScreenProps } from './types';

const THEME_OPTIONS = [
  {
    descriptionKey: 'onboarding.systemDescription',
    labelKey: 'onboarding.system',
    value: 'system',
  },
  { descriptionKey: 'onboarding.lightDescription', labelKey: 'onboarding.light', value: 'light' },
  { descriptionKey: 'onboarding.darkDescription', labelKey: 'onboarding.dark', value: 'dark' },
] as const;

export function OnboardingScreen(props: Readonly<OnboardingScreenProps>) {
  const { onComplete } = props;
  const { t } = useTranslation();
  const { locale, setLocale } = useLocale();
  const { runnerId, setRunnerId } = useRunner();
  const { setTelemetry, telemetry } = useTelemetry();
  const { setTheme, theme } = useTheme();
  const [pendingRunnerId, setPendingRunnerId] = useState<PyodideRunnerId | null>(null);
  const selectedRunnerId = pendingRunnerId ?? runnerId;
  const selectedRunner = getPyodideRunner(selectedRunnerId);
  const isSelectedRunnerActive = selectedRunnerId === runnerId;
  const runnerActionLabel = isSelectedRunnerActive
    ? t('runner.pythonActive', { version: selectedRunner.pythonVersion })
    : t('runner.usePython', { version: selectedRunner.pythonVersion });

  return (
    <main className="flex min-h-svh items-center justify-center bg-muted/40 p-6">
      <section className="grid w-full max-w-5xl overflow-hidden rounded-2xl border bg-card shadow-2xl shadow-foreground/5 lg:grid-cols-[0.82fr_1.18fr]">
        <div className="flex flex-col justify-between bg-primary p-8 text-primary-foreground sm:p-10">
          <div>
            <Image
              alt="EVA Labs"
              className="size-10 brightness-0 invert"
              height={40}
              src="/logo.svg"
              width={40}
            />
            <p className="mt-12 text-sm font-medium tracking-[0.2em] uppercase opacity-70">
              {t('onboarding.welcome')}
            </p>
            <h1 className="mt-3 max-w-sm text-4xl font-semibold tracking-tight">
              {t('onboarding.welcomeDescription')}
            </h1>
          </div>
          <p className="mt-12 max-w-xs text-sm leading-6 opacity-75">
            {t('onboarding.welcomeHint')}
          </p>
        </div>

        <div className="flex min-h-[34rem] flex-col p-8 sm:p-10">
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              {t('onboarding.quickSetup')}
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight">{t('onboarding.title')}</h2>
          </div>

          <div className="mt-8 flex flex-col gap-8">
            <section>
              <div>
                <h3 className="font-medium">{t('onboarding.appearance')}</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {t('onboarding.appearanceDescription')}
                </p>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-2" role="group">
                {THEME_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    className="rounded-lg border bg-background px-3 py-3 text-left text-sm outline-none transition-colors hover:bg-muted focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 data-[active=true]:border-primary data-[active=true]:bg-primary data-[active=true]:text-primary-foreground"
                    data-active={theme === option.value}
                    type="button"
                    onClick={() => setTheme(option.value)}
                  >
                    <span className="block font-medium">{t(option.labelKey)}</span>
                    <span className="mt-1 block text-xs opacity-70">
                      {t(option.descriptionKey)}
                    </span>
                  </button>
                ))}
              </div>
            </section>

            <section>
              <div>
                <h3 className="font-medium">{t('onboarding.language')}</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {t('onboarding.languageDescription')}
                </p>
              </div>
              <Select
                items={[
                  { label: t('language.english'), value: 'en-US' },
                  { label: t('language.portuguese'), value: 'pt-BR' },
                ]}
                value={locale}
                onValueChange={(value) => {
                  if (value === 'en-US' || value === 'pt-BR') setLocale(value);
                }}
              >
                <SelectTrigger className="mt-4 h-10 w-full bg-background px-3 shadow-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="en-US">{t('language.english')}</SelectItem>
                    <SelectItem value="pt-BR">{t('language.portuguese')}</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </section>

            <section>
              <div>
                <h3 className="font-medium">{t('onboarding.pythonRunner')}</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {t('onboarding.pythonRunnerDescription')}
                </p>
              </div>
              <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                <Select
                  items={PYODIDE_RUNNERS.map((runner) => ({
                    label: getPyodideRunnerLabel(runner.id),
                    value: runner.id,
                  }))}
                  value={selectedRunnerId}
                  onValueChange={(value) => {
                    if (value && isPyodideRunnerId(value)) setPendingRunnerId(value);
                  }}
                >
                  <SelectTrigger className="h-10 flex-1 bg-background px-3 shadow-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>{t('onboarding.pythonRunner')}</SelectLabel>
                      {PYODIDE_RUNNERS.map((runner) => (
                        <SelectItem key={runner.id} value={runner.id}>
                          {getPyodideRunnerLabel(runner.id)}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
                <Button
                  disabled={isSelectedRunnerActive}
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setRunnerId(selectedRunnerId);
                    setPendingRunnerId(null);
                  }}
                >
                  <CheckIcon data-icon="inline-start" />
                  {runnerActionLabel}
                </Button>
              </div>
              <p className="mt-3 text-sm text-muted-foreground">
                {t('onboarding.pythonRunnerReady')}
              </p>
            </section>

            <section className="border-t pt-6">
              <div className="flex items-start gap-3">
                <Checkbox
                  checked={telemetry === 'enabled'}
                  className="mt-0.5"
                  id="telemetry"
                  onCheckedChange={(checked) =>
                    setTelemetry(checked === true ? 'enabled' : 'disabled')
                  }
                />
                <label className="cursor-pointer text-sm" htmlFor="telemetry">
                  <span className="font-medium">{t('onboarding.telemetry')}</span>
                  <span className="mt-1 block text-muted-foreground">
                    {t('onboarding.telemetryDescription')}
                  </span>
                </label>
              </div>
            </section>
          </div>

          <div className="mt-auto flex justify-end pt-10">
            <Button size="lg" type="button" onClick={onComplete}>
              {t('onboarding.startAutomating')}
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
}
