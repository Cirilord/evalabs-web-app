export type AppSidebarProps = Readonly<Record<string, never>>;

export type SidebarItemStatus = 'completed' | 'failed' | 'queued' | 'running';

export type SidebarItem = Readonly<{
  id: string;
  name: string;
  status: SidebarItemStatus;
}>;
