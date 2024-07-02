import React from 'react';
import PersonalInfoCard from './oracle/page';

const userData = [
  {
    title: 'John Doe',
    email: 'john.doe@example.com',
    phoneno: 1234567890,
    github: 'johndoe',
    location: 'New York, USA',
    avatarUrl: 'https://example.com/avatar1.png',
  },
  {
    title: 'Jane Smith',
    email: 'jane.smith@example.com',
    phoneno: 2345678901,
    github: 'janesmith',
    location: 'Los Angeles, USA',
    avatarUrl: 'https://example.com/avatar2.png',
  },
  {
    title: 'Alice Johnson',
    email: 'alice.johnson@example.com',
    phoneno: 3456789012,
    github: 'alicejohnson',
    location: 'Chicago, USA',
    avatarUrl: 'https://example.com/avatar3.png',
  },
];

const App = () => {
  return (
    <div className="flex flex-wrap justify-center items-center space-x-2">
      {userData.map((user, index) => (
        <PersonalInfoCard key={index} {...user} />
      ))}
    </div>
  );
};

export default App;
