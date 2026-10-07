'use client';

import { SettingsIcon } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useLocale } from '@/contexts/LocaleProvider';
import { useRunner } from '@/contexts/RunnerProvider';
import { useTelemetry } from '@/contexts/TelemetryProvider';
import { useTheme } from '@/contexts/ThemeProvider';
import { getPyodideRunnerLabel, isPyodideRunnerId, PYODIDE_RUNNERS } from '@/lib/runner';
import { Checkbox } from '@/ui/checkbox';
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
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/ui/select';
import { SidebarMenuButton } from '@/ui/sidebar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/ui/tabs';

import { type SettingsDialogProps } from './types';

const THEME_ITEMS = [
  { labelKey: 'common.system', value: 'system' },
  { labelKey: 'onboarding.light', value: 'light' },
  { labelKey: 'onboarding.dark', value: 'dark' },
];

const LOCALE_ITEMS = [
  { labelKey: 'language.english', value: 'en-US' },
  { labelKey: 'language.portuguese', value: 'pt-BR' },
];

export function SettingsDialog(props: SettingsDialogProps) {
  void props;
  const [isOpen, setIsOpen] = useState(false);
  const { locale, setLocale } = useLocale();
  const { runnerId, setRunnerId } = useRunner();
  const { setTelemetry, telemetry } = useTelemetry();
  const { setTheme, theme } = useTheme();
  const { t } = useTranslation();

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger render={<SidebarMenuButton tooltip={t('sidebar.settings')} />}>
        <SettingsIcon />
        <span>{t('sidebar.settings')}</span>
      </DialogTrigger>
      <DialogContent className="flex max-h-[calc(100svh-2rem)] max-w-lg flex-col gap-0 p-0">
        <DialogHeader className="shrink-0 border-b px-6 py-5">
          <DialogTitle>{t('settings.settings')}</DialogTitle>
          <DialogDescription>{t('settings.settingsDescription')}</DialogDescription>
        </DialogHeader>
        <Tabs className="min-h-0 flex-1 gap-0" defaultValue="general">
          <div className="shrink-0 border-b px-6">
            <TabsList
              aria-label={t('settings.settingsSections')}
              className="!h-auto w-full justify-start gap-0 p-0"
              variant="line"
            >
              <TabsTrigger
                className="h-auto flex-none rounded-none border-b-2 border-transparent px-3 py-3 text-muted-foreground data-active:border-primary data-active:bg-transparent data-active:text-foreground after:hidden"
                value="general"
              >
                {t('settings.general')}
              </TabsTrigger>
              <TabsTrigger
                className="h-auto flex-none rounded-none border-b-2 border-transparent px-3 py-3 text-muted-foreground data-active:border-primary data-active:bg-transparent data-active:text-foreground after:hidden"
                value="runners"
              >
                {t('settings.runners')}
              </TabsTrigger>
            </TabsList>
          </div>
          <TabsContent className="min-h-0 flex-1 px-6 py-5" value="general">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="font-medium">{t('settings.appearance')}</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  {t('settings.appearanceDescription')}
                </p>
              </div>
              <Select
                items={THEME_ITEMS.map((item) => ({
                  label: t(item.labelKey),
                  value: item.value,
                }))}
                value={theme}
                onValueChange={(value) => {
                  if (value === 'dark' || value === 'light' || value === 'system') {
                    setTheme(value);
                  }
                }}
              >
                <SelectTrigger className="w-36 shrink-0">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>{t('settings.appearance')}</SelectLabel>
                    {THEME_ITEMS.map((item) => (
                      <SelectItem key={item.value} value={item.value}>
                        {t(item.labelKey)}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            <div className="mt-5 flex items-center justify-between gap-4 border-t pt-5">
              <div>
                <h2 className="font-medium">{t('settings.language')}</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  {t('settings.languageDescription')}
                </p>
              </div>
              <Select
                items={LOCALE_ITEMS.map((item) => ({
                  label: t(item.labelKey),
                  value: item.value,
                }))}
                value={locale}
                onValueChange={(value) => {
                  if (value === 'en-US' || value === 'pt-BR') {
                    setLocale(value);
                  }
                }}
              >
                <SelectTrigger className="w-44 shrink-0">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>{t('settings.language')}</SelectLabel>
                    {LOCALE_ITEMS.map((item) => (
                      <SelectItem key={item.value} value={item.value}>
                        {t(item.labelKey)}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            <div className="mt-5 flex items-start justify-between gap-4 border-t pt-5">
              <div>
                <h2 className="font-medium">{t('settings.telemetry')}</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  {t('settings.telemetryDescription')}
                </p>
              </div>
              <Checkbox
                aria-label={t('settings.telemetryLabel')}
                checked={telemetry === 'enabled'}
                className="mt-0.5 shrink-0"
                onCheckedChange={(checked) =>
                  setTelemetry(checked === true ? 'enabled' : 'disabled')
                }
              />
            </div>
          </TabsContent>
          <TabsContent className="min-h-0 flex-1 px-6 py-5" value="runners">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="font-medium">{t('settings.pythonRunner')}</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  {t('settings.pythonRunnerDescription')}
                </p>
              </div>
              <Select
                items={PYODIDE_RUNNERS.map((runner) => ({
                  label: getPyodideRunnerLabel(runner.id),
                  value: runner.id,
                }))}
                value={runnerId}
                onValueChange={(value) => {
                  if (value && isPyodideRunnerId(value)) {
                    setRunnerId(value);
                  }
                }}
              >
                <SelectTrigger className="w-64 shrink-0">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>{t('settings.pythonRunner')}</SelectLabel>
                    {PYODIDE_RUNNERS.map((runner) => (
                      <SelectItem key={runner.id} value={runner.id}>
                        {getPyodideRunnerLabel(runner.id)}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          </TabsContent>
        </Tabs>
        <DialogFooter className="shrink-0 border-t px-6 py-4">
          <DialogClose>{t('common.close')}</DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
