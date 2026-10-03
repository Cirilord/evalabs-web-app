export type AutomationSidebarItem = Readonly<{
  id: string;
  name: string;
}>;

export type WorkflowSidebarItem = Readonly<{
  id: string;
  name: string;
}>;

export type AppSidebarProps = Readonly<{
  automationItems: readonly AutomationSidebarItem[];
  workflowItems: readonly WorkflowSidebarItem[];
}>;

export type SidebarItemStatus = 'failed' | 'preparing' | 'running' | 'skipped' | 'succeeded';
