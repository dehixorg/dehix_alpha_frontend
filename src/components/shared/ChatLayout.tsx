import React, { useEffect, useRef, useState } from 'react';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
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
  const [defaultSidebarSize, setDefaultSidebarSize] = useState(25);

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 640px) and (max-width: 1024px)');
    const handler = () => setDefaultSidebarSize(mq.matches ? 22 : 25);
    handler();
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  useEffect(() => {
    const panel = sidebarPanelRef.current;
    if (panel) {
      if (isChatAreaExpanded) {
        panel.collapse();
      } else {
        panel.expand();
        panel.resize(defaultSidebarSize);
      }
    }
  }, [isChatAreaExpanded, defaultSidebarSize]);

  return (
    <PanelGroup direction="horizontal" className="flex-1 h-full bg-background">
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
            'h-full bg-card border-r border-border overflow-y-auto shadow-sm',
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
        className="w-1 bg-border hover:bg-primary transition-colors duration-200 data-[resize-handle-active]:bg-primary"
        aria-label="Resize chat sidebar"
      />
      <Panel
        defaultSize={100 - defaultSidebarSize}
        minSize={60}
        id="chat-main-panel"
        className="h-full min-w-0 flex-1"
        order={2}
      >
        <main
          className="h-full w-full min-w-0 bg-background text-foreground px-2 py-2 sm:px-3"
          aria-label="Main Chat Area"
        >
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
