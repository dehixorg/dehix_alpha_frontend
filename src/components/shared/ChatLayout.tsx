import React from 'react';

interface ChatLayoutProps {
  chatListComponent: React.ReactNode;
  chatWindowComponent: React.ReactNode;
}

const ChatLayout: React.FC<ChatLayoutProps> = ({ chatListComponent, chatWindowComponent }) => {
  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <aside className="w-1/4 bg-gray-100 dark:bg-gray-800 p-4 overflow-y-auto hidden md:block" aria-label="Chat List Sidebar">
        {chatListComponent}
      </aside>

      {/* Main Chat Area */}
      <main className="flex-1 bg-white dark:bg-gray-900 p-4 overflow-y-auto" aria-label="Main Chat Area">
        {chatWindowComponent}
      </main>

      {/* Basic responsive handling for smaller screens (e.g., show chat list and then chat window) */}
      {/* This section might need a different approach for true accessibility on mobile,
          as just rendering both might not be ideal depending on how visibility is controlled.
          For now, focusing on desktop layout's semantic structure. */}
      <div className="md:hidden w-full">
        {/* On smaller screens, you might want a different way to navigate,
            but for now, we can stack them or provide a toggle.
            This example just shows one or the other for simplicity,
            a real app would need a toggle or different layout strategy.
        */}
        {/* This is a placeholder for mobile view; actual implementation might differ
            based on how navigation between chat list and chat window is handled on mobile.
            For now, it might be better to focus on the desktop layout and refine mobile later.
            Let's assume for now the chatList is accessible via a menu button on mobile,
            and this layout primarily serves the desktop view.
        */}
         {/* <div className="w-full bg-gray-100 dark:bg-gray-800 p-4">{chatListComponent}</div> */}
         {/* <div className="w-full bg-white dark:bg-gray-900 p-4">{chatWindowComponent}</div> */}
      </div>
    </div>
  );
};

export default ChatLayout;
