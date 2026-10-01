export type AutomationSidebarItem = Readonly<{
  id: string;
  name: string;
}>;

export type AppSidebarProps = Readonly<{
  automationItems: readonly AutomationSidebarItem[];
}>;

export type SidebarItemStatus = 'completed' | 'failed' | 'queued' | 'running';
