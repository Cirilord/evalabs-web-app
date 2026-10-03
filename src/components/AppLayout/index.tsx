import { AppSidebar } from '@/components/AppSidebar';
import { prisma } from '@/lib/prisma';
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/ui/sidebar';
import { TooltipProvider } from '@/ui/tooltip';

import { type AppLayoutProps } from './types';

export async function AppLayout(props: AppLayoutProps) {
  const { children } = props;
  const [automationItems, workflowItems] = await Promise.all([
    prisma.automation.findMany({
      orderBy: { updatedAt: 'desc' },
      select: { id: true, name: true },
    }),
    prisma.workflow.findMany({
      orderBy: { updatedAt: 'desc' },
      select: { id: true, name: true },
    }),
  ]);

  return (
    <TooltipProvider>
      <SidebarProvider>
        <AppSidebar automationItems={automationItems} workflowItems={workflowItems} />
        <SidebarInset className="h-svh min-h-0 overflow-hidden">
          <header className="sticky top-0 z-30 flex h-12 shrink-0 items-center border-b bg-background px-3">
            <SidebarTrigger />
          </header>
          <div className="min-h-0 flex-1 overflow-y-auto">{children}</div>
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  );
}
