import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';

import { Badge } from '../ui/badge';

import { RootState } from '@/lib/store';
import { cn } from '@/lib/utils';

// Define the types for reactions and messages
type MessageReaction = Record<string, string[]>; // Maps emoji to user IDs

interface ReactionProps {
  messageId: string; // The message ID is passed separately
  reactions: MessageReaction; // The reactions are passed separately
  toggleReaction: (messageId: string, emoji: string) => void;
}

const Reactions: React.FC<ReactionProps> = ({
  messageId,
  reactions,
  toggleReaction,
}) => {
  const user = useSelector((state: RootState) => state.user);

  const handleEmojiClick = (emoji: string) => {
    toggleReaction(messageId, emoji);
  };

  const sorted = Object.entries(reactions).sort(
    (a, b) => (b[1]?.length || 0) - (a[1]?.length || 0),
  );

  return (
    <div className="flex items-center gap-1 mt-0">
      {sorted.map(([emoji, users]) => {
        const selected = Array.isArray(users) && users.includes(user.uid);
        return (
          <Badge
            key={emoji}
            role="button"
            tabIndex={0}
            aria-pressed={selected}
            title={selected ? 'You reacted' : 'Add reaction'}
            onClick={() => handleEmojiClick(emoji)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleEmojiClick(emoji);
              }
            }}
            className={cn(
              'flex items-center px-1.5 py-0.5 rounded-full cursor-pointer select-none border text-xs transition-colors outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[hsl(var(--ring))]',
              selected
                ? 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] border-[hsl(var(--primary))]'
                : 'bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))] border-[hsl(var(--border))] hover:bg-[hsl(var(--accent))] hover:text-[hsl(var(--accent-foreground))]',
            )}
          >
            <span
              className="inline-flex items-center justify-center"
              style={{
                width: '1.1em',
                height: '1.1em',
                fontSize: '1em',
                lineHeight: 1,
              }}
            >
              {emoji}
            </span>
            {Array.isArray(users) && users.length > 0 && (
              <span
                className={cn(
                  'ml-1 leading-none',
                  selected ? 'opacity-95' : 'opacity-80',
                )}
              >
                {users.length}
              </span>
            )}
          </Badge>
        );
      })}
    </div>
  );
};

// Add PropTypes validation
Reactions.propTypes = {
  messageId: PropTypes.string.isRequired, // The messageId is now required
  reactions: PropTypes.any.isRequired, // Reactions are required
  toggleReaction: PropTypes.func.isRequired, // Function to toggle reactions is required
};

export default Reactions;
