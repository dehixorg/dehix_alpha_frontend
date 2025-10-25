'use client';

import { Toaster } from '@/components/ui/toaster';
import { ThemeProvider } from '@/components/theme-provider';
import { TooltipProvider } from '@/components/ui/tooltip';
import SidebarMenu from '@/components/menu/sidebarMenu';
import {
  menuItemsBottom,
  menuItemsTop,
} from '@/config/menuItems/business/dashboardMenuItems';
import Header from '@/components/header/header';

// Client component wrapper
function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <TooltipProvider>
        <div className="min-h-screen w-full bg-background text-foreground transition-colors duration-200 flex">
          {/* Sidebar */}
          <aside className="fixed inset-y-0 left-0 z-20 border-r border-border">
            <SidebarMenu
              menuItemsTop={menuItemsTop}
              menuItemsBottom={menuItemsBottom}
              active="Dehix Talent"
            />
          </aside>

          {/* Main content area */}
          <div className="flex-1 flex flex-col ml-14">
            {/* Header */}
            <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b border-border">
              <div>
                <Header
                  menuItemsTop={menuItemsTop}
                  menuItemsBottom={menuItemsBottom}
                  activeMenu="Dehix Talent"
                  breadcrumbItems={[
                    { label: 'Business', link: '/dashboard/business' },
                    { label: 'Hire Talent', link: '/business/talent' },
                    { label: 'Manage', link: '#' },
                  ]}
                />
              </div>
            </header>

            {/* Page content */}
            <main className="flex-1 overflow-y-auto p-6">{children}</main>
          </div>

          <Toaster />
        </div>
      </TooltipProvider>
    </ThemeProvider>
  );
}

export default function ManageTalentsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ClientLayout>{children}</ClientLayout>;
}
