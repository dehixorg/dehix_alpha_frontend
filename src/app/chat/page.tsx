'use client';
import { CardsChat } from '@/components/shared/chat';
const primaryUser = {
  name: 'Sofia Davis',
  email: 'm@example.com',
  avatar: '/avatars/01.png',
};

const users = [
  { name: 'Olivia Martin', email: 'm@example.com', avatar: '/avatars/01.png' },
  {
    name: 'Isabella Nguyen',
    email: 'isabella.nguyen@email.com',
    avatar: '/avatars/03.png',
  },
];

const initialMessages = [
  { role: 'agent', content: 'Hi, how can I help you today?' },
  { role: 'user', content: "I'm having trouble with my account." },
];
const HomePage = () => {
  return (
    <>
      <CardsChat
        primaryUser={primaryUser}
        initialMessages={initialMessages}
        users={users}
      />
    </>
  );
};

export default HomePage;
