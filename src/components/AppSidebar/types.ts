export type AutomationSidebarItem = Readonly<{
  id: string;
  name: string;
}>;

export type AppSidebarProps = Readonly<{
  automationItems: readonly AutomationSidebarItem[];
}>;

export type SidebarItemStatus = 'failed' | 'preparing' | 'running' | 'skipped' | 'succeeded';
