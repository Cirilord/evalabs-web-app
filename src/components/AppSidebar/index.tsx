import { SettingsIcon } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from '@/ui/sidebar';

import { type AppSidebarProps, type SidebarItem, type SidebarItemStatus } from './types';

const automationItems: readonly SidebarItem[] = [
  { id: 'daily-sales-report', name: 'Daily sales report', status: 'running' },
  { id: 'customer-sync', name: 'Customer synchronization', status: 'completed' },
  { id: 'invoice-processing', name: 'Invoice processing', status: 'queued' },
];

const workflowItems: readonly SidebarItem[] = [
  { id: 'customer-onboarding', name: 'Customer onboarding', status: 'completed' },
  { id: 'lead-qualification', name: 'Lead qualification', status: 'running' },
  { id: 'monthly-close', name: 'Monthly close', status: 'failed' },
];

function getStatusClassName(status: SidebarItemStatus) {
  switch (status) {
    case 'completed':
      return 'fill-current text-success';
    case 'failed':
      return 'fill-current text-destructive';
    case 'running':
      return 'animate-pulse fill-current text-primary';
    default:
      return 'animate-pulse fill-current text-warning';
  }
}

export function AppSidebar(props: AppSidebarProps) {
  void props;

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
          <SidebarGroupLabel>Automations</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {automationItems.map((automation) => (
                <SidebarMenuItem key={automation.id}>
                  <SidebarMenuButton tooltip={automation.name} type="button">
                    <span
                      aria-hidden="true"
                      className={`flex size-4 shrink-0 items-center justify-center rounded-full border-2 border-current ${getStatusClassName(automation.status)}`}
                    >
                      <span className="size-1.5 rounded-full bg-current" />
                    </span>
                    <span>{automation.name}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>Workflows</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {workflowItems.map((workflow) => (
                <SidebarMenuItem key={workflow.id}>
                  <SidebarMenuButton tooltip={workflow.name} type="button">
                    <span
                      aria-hidden="true"
                      className={`flex size-4 shrink-0 items-center justify-center rounded-full border-2 border-current ${getStatusClassName(workflow.status)}`}
                    >
                      <span className="size-1.5 rounded-full bg-current" />
                    </span>
                    <span>{workflow.name}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton disabled tooltip="Settings">
              <SettingsIcon />
              <span>Settings</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
