import React, { useEffect, useRef } from 'react'; // Added useEffect, useRef
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels'; // Added PanelRef
import type { ImperativePanelHandle } from 'react-resizable-panels';

import { cn } from '@/lib/utils';

interface ChatLayoutProps {
  chatListComponent: React.ReactNode;
  chatWindowComponent: React.ReactNode;
  isChatAreaExpanded: boolean;
  onOpenProfileSidebar?: (
    id: string,
    type: 'user' | 'group',
    initialDetails?: { userName?: string; email?: string; profilePic?: string },
  ) => void;
}

const ChatLayout: React.FC<ChatLayoutProps> = ({
  chatListComponent,
  chatWindowComponent,
  isChatAreaExpanded,
  onOpenProfileSidebar,
}) => {
  const sidebarPanelRef = useRef<ImperativePanelHandle>(null);
  const defaultSidebarSize = 25;

  useEffect(() => {
    const panel = sidebarPanelRef.current;
    if (panel) {
      if (isChatAreaExpanded) {
        panel.collapse();
      } else {
        panel.expand();
        // Optional: If expand() doesn't restore to a specific size,
        // and you want it to reset to its default size when re-expanding:
        //
        // panel.resize(defaultSidebarSize);
      }
    } else {
      console.error(
        '[ChatLayout.tsx] sidebarPanelRef.current IS NULL or UNDEFINED.',
      );
    }
  }, [isChatAreaExpanded]);

  return (
    <PanelGroup direction="horizontal" className="flex-1 h-full">
      {' '}
      {/* Removed purple border */}
      <Panel
        ref={sidebarPanelRef}
        defaultSize={defaultSidebarSize}
        minSize={15}
        maxSize={40}
        collapsible={true}
        collapsedSize={0}
        id="chat-sidebar-panel"
        className="h-full"
        order={1}
      >
        <aside
          className={cn(
            'h-full bg-[hsl(var(--card))] p-4 overflow-y-auto shadow-xl dark:shadow-lg', // Removed lime border
          )}
          aria-label="Chat List Sidebar"
        >
          {/* Pass onOpenProfileSidebar to chatListComponent if it's a React element that can accept it */}
          {React.isValidElement(chatListComponent)
            ? React.cloneElement(chatListComponent as React.ReactElement<any>, {
                onOpenProfileSidebar,
              })
            : chatListComponent}
        </aside>
      </Panel>
      <PanelResizeHandle
        className="w-1 bg-[hsl(var(--border))] hover:bg-[hsl(var(--primary))] dark:hover:bg-[hsl(var(--primary))] transition-colors duration-200 data-[resize-handle-active]:bg-[hsl(var(--primary))] dark:data-[resize-handle-active]:bg-[hsl(var(--primary))]"
        aria-label="Resize chat sidebar"
      />
      <Panel
        defaultSize={100 - defaultSidebarSize}
        minSize={60}
        id="chat-main-panel"
        className="h-full"
        order={2}
      >
        <main
          className="h-full bg-[hsl(var(--background))] p-4"
          aria-label="Main Chat Area"
        >
          {' '}
          {/* Removed yellow border */}
          {/* Pass onOpenProfileSidebar to chatWindowComponent if it's a React element that can accept it */}
          {React.isValidElement(chatWindowComponent)
            ? React.cloneElement(
                chatWindowComponent as React.ReactElement<any>,
                { onOpenProfileSidebar },
              )
            : chatWindowComponent}
        </main>
      </Panel>
    </PanelGroup>
  );
};

export default ChatLayout;
