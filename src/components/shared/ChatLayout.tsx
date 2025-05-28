import React from 'react';

interface ChatLayoutProps {
  sidebar: React.ReactNode;
  main: React.ReactNode;
}

/**
 * ChatLayout provides a two-column layout similar to Google Chat.
 * - Left: Sidebar (chat list)
 * - Right: Main chat area
 */
const ChatLayout: React.FC<ChatLayoutProps> = ({ sidebar, main }) => {
  return (
    <div className="flex h-screen px-20 py-3  bg-gray-50 dark:bg-[#09090b] gap-4 overflow-hidden">
      {/* Sidebar */}
      <div className="hidden md:flex w-full max-w-xs rounded-2xl bg-white dark:bg-[#27272a] shadow-md mr-4 flex-col p-4">
        {sidebar}
      </div>
      {/* Main Chat Area */}
      <div className="flex-1 rounded-2xl bg-white dark:bg-[#27272a] shadow-md flex flex-col max-w-full overflow-auto p-4">
        {main}
      </div>
    </div>
  );
};

export default ChatLayout; 