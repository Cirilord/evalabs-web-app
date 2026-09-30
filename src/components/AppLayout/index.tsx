import { AppSidebar } from '@/components/AppSidebar';
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/ui/sidebar';
import { TooltipProvider } from '@/ui/tooltip';

import { type AppLayoutProps } from './types';

export function AppLayout(props: AppLayoutProps) {
  const { children } = props;

  return (
    <TooltipProvider>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <header className="flex h-12 shrink-0 items-center border-b px-3">
            <SidebarTrigger />
          </header>
          <div className="min-h-0 flex-1 overflow-y-auto">{children}</div>
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  );
}
