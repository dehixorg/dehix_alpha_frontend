import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';

import { Badge } from '../ui/badge';

import { RootState } from '@/lib/store';

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

  return (
    <div className="flex items-center gap-1 mt-0">
      {Object.entries(reactions).map(([emoji, users]) => (
        <Badge
          key={emoji}
          onClick={() => handleEmojiClick(emoji)}
          className={`cursor-pointer ${
            Array.isArray(users) && users.includes(user.uid)
              ? 'bg-gray-400'
              : 'bg-green'
          } flex items-center px-1 py-0.5`}
        >
          <span
            className="inline-flex items-center justify-center rounded-full bg-transparent"
            style={{ width: '1.2em', height: '1.2em', fontSize: '1em', lineHeight: 1 }}
          >
            {emoji}
          </span>
          {users.length > 0 && (
            <span className="ml-1 text-xs">{users.length}</span>
          )}
        </Badge>
      ))}
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
