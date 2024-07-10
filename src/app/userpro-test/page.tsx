import React from 'react';

import UserForm from '@/components/form-test/userprofile/userprofile';

const userItems = [
  {
    fullName: 'John Doe',
    mobileNumber: '123-456-7890',
    emailAddress: 'john.doe@example.com',
    username: 'johndoe',
    github: 'johndoe123',
    instagram: 'johndoe_insta',
  },
];

const UserProfile = () => {
  return (
    <div>
      <h1>User Profile</h1>
      <UserForm items={userItems} />
    </div>
  );
};

export default UserProfile;
