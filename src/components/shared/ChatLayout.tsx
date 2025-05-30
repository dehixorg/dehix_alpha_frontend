import React from 'react';
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import { cn } from '@/lib/utils';

interface ChatLayoutProps {
  chatListComponent: React.ReactNode;
  chatWindowComponent: React.ReactNode;
  isChatAreaExpanded?: boolean;
}

const ChatLayout: React.FC<ChatLayoutProps> = ({ chatListComponent, chatWindowComponent, isChatAreaExpanded }) => {
  // If chat area is expanded, only render the chat window component
  if (isChatAreaExpanded) {
    return (
      <main aria-label="Main Chat Area" className="flex-1 h-full bg-[hsl(var(--background))] p-4 overflow-y-auto">
        {/* The CardsChat component (chatWindowComponent) should manage its own internal scrolling and height if it's the direct child.
            The p-4 and overflow-y-auto here are fallbacks if chatWindowComponent itself doesn't fill height and provide padding.
            Given previous changes to CardsChat, it should be h-full and manage its own padding/scroll for content.
            So, p-4 and overflow-y-auto might be removed from this <main> if CardsChat is self-contained.
            For now, keeping p-4 for consistency if CardsChat expects parent padding.
         */}
        {chatWindowComponent}
      </main>
    );
  }

  return (
    // PanelGroup should be the direct child of the flex container that has h-screen
    // The parent div of PanelGroup in page.tsx's main section might need flex-1 if ChatLayout is not directly filling screen height.
    // Assuming ChatLayout's parent div (the <main> in page.tsx) is already flex-1 and provides height context.
    <PanelGroup direction="horizontal" className="flex-1 h-full">
      <Panel defaultSize={25} minSize={20} maxSize={40} collapsible={true} collapsedSize={0} id="chat-sidebar-panel" className="h-full">
        <aside
          className={cn(
            "h-full bg-[hsl(var(--card))] p-4 overflow-y-auto shadow-md dark:shadow-none", // Added shadow for light mode
            // Original responsive hiding logic is no longer needed here as Panel can be collapsed.
            // Or, if we want to hide it by default on small screens even when not "expanded":
            // "hidden md:flex flex-col h-full"
            // For now, let Panel manage visibility based on its props and user interaction.
            // The `collapsible` and `collapsedSize` props handle this.
            // The `isChatAreaExpanded` logic now prevents this PanelGroup from rendering at all.
          )}
          aria-label="Chat List Sidebar"
        >
          {chatListComponent}
        </aside>
      </Panel>
      <PanelResizeHandle
        className="w-1 bg-[hsl(var(--border))] hover:bg-[hsl(var(--primary))] dark:hover:bg-[hsl(var(--primary))] transition-colors duration-200 data-[resize-handle-active]:bg-[hsl(var(--primary))] dark:data-[resize-handle-active]:bg-[hsl(var(--primary))]"
        aria-label="Resize chat sidebar"
      />
      <Panel defaultSize={75} minSize={60} id="chat-main-panel" className="h-full">
        <main className="h-full bg-[hsl(var(--background))] p-4" aria-label="Main Chat Area">
          {/* CardsChat (chatWindowComponent) is h-full and manages its own internal scrolling and padding for its content.
              So this <main> just provides the background and overall padding from the resizer edge.
              No overflow-y-auto needed here.
          */}
          {chatWindowComponent}
        </main>
      </Panel>
    </PanelGroup>
  );
};

export default ChatLayout;
