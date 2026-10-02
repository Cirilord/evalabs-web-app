'use client';

import { PlusIcon } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from '@/ui/sidebar';

import { SettingsDialog } from './components/SettingsDialog';
import { useAutomationStatuses } from './hooks/useAutomationStatuses';
import { type AppSidebarProps, type SidebarItemStatus } from './types';

const workflowItems: readonly Readonly<{
  id: string;
  name: string;
  status: SidebarItemStatus;
}>[] = [
  { id: 'customer-onboarding', name: 'Customer onboarding', status: 'succeeded' },
  { id: 'lead-qualification', name: 'Lead qualification', status: 'running' },
  { id: 'monthly-close', name: 'Monthly close', status: 'failed' },
];

function getRunIndicator(status: SidebarItemStatus | undefined, t: (key: string) => string) {
  switch (status) {
    case 'preparing':
      return {
        className: 'animate-pulse fill-current text-warning',
        label: t('workflow.installing'),
      };
    case 'running':
      return {
        className: 'animate-pulse fill-current text-sidebar-primary',
        label: t('sidebar.running'),
      };
    case 'succeeded':
      return { className: 'fill-current text-success', label: t('workflow.succeeded') };
    case 'failed':
      return { className: 'fill-current text-destructive', label: t('sidebar.failed') };
    case 'skipped':
      return { className: 'fill-current text-muted-foreground', label: t('workflow.skipped') };
    default:
      return { className: 'text-muted-foreground', label: t('sidebar.noRuns') };
  }
}

export function AppSidebar(props: AppSidebarProps) {
  const { automationItems } = props;
  const { t } = useTranslation();
  const { data: automationStatuses = [] } = useAutomationStatuses();
  const statusByAutomation = new Map(
    automationStatuses.map((automationStatus) => [
      automationStatus.automationId,
      automationStatus.status,
    ])
  );

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="h-12 justify-center border-b border-sidebar-border px-2 py-0">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton render={<Link href="/" />} size="lg" tooltip="EVA Labs">
              <Image
                alt=""
                aria-hidden="true"
                className="size-8 rounded-md"
                height={32}
                src="/logo.svg"
                width={32}
              />
              <span className="font-semibold">EVA Labs</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>{t('sidebar.automations')}</SidebarGroupLabel>
          <SidebarGroupAction
            aria-label={t('sidebar.createAutomation')}
            render={<Link href="/automations/new" />}
          >
            <PlusIcon />
          </SidebarGroupAction>
          <SidebarGroupContent>
            <SidebarMenu>
              {automationItems.map((automation) => {
                const indicator = getRunIndicator(
                  statusByAutomation.get(automation.id) ?? undefined,
                  t
                );

                return (
                  <SidebarMenuItem key={automation.id}>
                    <SidebarMenuButton
                      render={<Link href={`/automations/${automation.id}`} />}
                      tooltip={`${automation.name}: ${indicator.label}`}
                    >
                      <span
                        aria-hidden="true"
                        className={`flex size-4 shrink-0 items-center justify-center rounded-full border-2 border-current ${indicator.className}`}
                      >
                        <span className="size-1.5 rounded-full bg-current" />
                      </span>
                      <span>{automation.name}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>{t('sidebar.workflows')}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {workflowItems.map((workflow) => {
                const indicator = getRunIndicator(workflow.status, t);

                return (
                  <SidebarMenuItem key={workflow.id}>
                    <SidebarMenuButton
                      tooltip={`${workflow.name}: ${indicator.label}`}
                      type="button"
                    >
                      <span
                        aria-hidden="true"
                        className={`flex size-4 shrink-0 items-center justify-center rounded-full border-2 border-current ${indicator.className}`}
                      >
                        <span className="size-1.5 rounded-full bg-current" />
                      </span>
                      <span>{workflow.name}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SettingsDialog />
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
