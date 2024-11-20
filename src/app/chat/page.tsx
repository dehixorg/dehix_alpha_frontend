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

const HomePage = () => {
  return (
    <>
      <CardsChat initialMessages={[]} conversationId="1" />
    </>
  );
};

export default HomePage;
