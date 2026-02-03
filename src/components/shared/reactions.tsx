import React from 'react';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';

import { RootState } from '@/lib/store';
import { cn } from '@/lib/utils';

// Define the types for reactions and messages
type MessageReaction = Record<string, string[]>; // Maps emoji to user IDs

interface ReactionProps {
  messageId: string;
  reactions: MessageReaction;
  toggleReaction: (messageId: string, emoji: string) => void;
  alignRight?: boolean;
}

const Reactions: React.FC<ReactionProps> = ({
  messageId,
  reactions,
  toggleReaction,
  alignRight = false,
}) => {
  const user = useSelector((state: RootState) => state.user);

  const handleEmojiClick = (emoji: string) => {
    toggleReaction(messageId, emoji);
  };

  const sorted = Object.entries(reactions).sort(
    (a, b) => (b[1]?.length || 0) - (a[1]?.length || 0),
  );

  if (sorted.length === 0) return null;

  return (
    <div
      className={cn(
        'flex items-center gap-0.5 flex-wrap',
        alignRight ? 'justify-end' : 'justify-start',
      )}
    >
      {sorted.map(([emoji, users]) => {
        const uid = user?.uid as string | undefined;
        const selected =
          Array.isArray(users) && uid ? users.includes(uid) : false;
        const count = Array.isArray(users) ? users.length : 0;
        return (
          <button
            key={emoji}
            type="button"
            tabIndex={0}
            aria-pressed={selected}
            title={
              selected ? 'You reacted – click to remove' : 'Click to react'
            }
            onClick={() => handleEmojiClick(emoji)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleEmojiClick(emoji);
              }
            }}
            className={cn(
              'inline-flex items-center gap-1 h-6 min-w-0 px-2.5 rounded-full cursor-pointer select-none transition-colors outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))] focus-visible:ring-offset-1',
              'bg-[hsl(var(--muted)_/_0.8)] dark:bg-[hsl(var(--accent)_/_0.5)] border border-[hsl(var(--border)_/_0.6)] dark:border-[hsl(var(--border)_/_0.4)]',
              'hover:bg-[hsl(var(--accent)_/_0.6)] dark:hover:bg-[hsl(var(--accent)_/_0.7)]',
              selected &&
                'ring-1 ring-[hsl(var(--primary)_/_0.6)] dark:ring-[hsl(var(--primary)_/_0.5)] border-[hsl(var(--primary)_/_0.4)]',
            )}
          >
            <span
              className="inline-flex items-center justify-center leading-none text-[15px]"
              style={{ fontSize: '15px' }}
            >
              {emoji}
            </span>
            {count > 0 && (
              <span className="text-[11px] leading-none font-medium text-[hsl(var(--muted-foreground))] tabular-nums">
                {count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};

Reactions.propTypes = {
  messageId: PropTypes.string.isRequired,
  reactions: PropTypes.any.isRequired,
  toggleReaction: PropTypes.func.isRequired,
  alignRight: PropTypes.bool,
};

export default Reactions;
