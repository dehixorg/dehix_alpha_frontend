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

  return (
    <div className="flex items-center gap-2 mt-2">
      {Object.entries(reactions).map(([emoji, users]) => (
        <Badge
          key={emoji}
          onClick={() => toggleReaction(messageId, emoji)} // Handle click to toggle reaction
          className={`cursor-pointer ${users.includes(user.uid) ? 'bg-green' : 'bg-white'}`}
        >
          <span className="flex items-center">
            {emoji} {/* Display emoji */}
            {users.length > 0 && (
              <span className="ml-2">{users.length}</span>
            )}{' '}
            {/* Display user count */}
          </span>
        </Badge>
      ))}
    </div>
  );
};

// Add PropTypes validation
Reactions.propTypes = {
  messageId: PropTypes.string.isRequired, // The messageId is now required
  reactions: PropTypes.any, // Reactions are required
  toggleReaction: PropTypes.func.isRequired, // Function to toggle reactions is required
};

export default Reactions;
