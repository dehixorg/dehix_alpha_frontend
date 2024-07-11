import React from 'react';

import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface ProfileCardProps {
  name: string;
  email: string;
}

const ProfileCard: React.FC<ProfileCardProps> = ({ name, email }) => {
  return (
    <div className="flex justify-center p-4 rounded-md">
      <Card className="w-full md:max-w-sm rounded-lg shadow-md bg-white">
        <CardHeader className="px-4 py-3 flex justify-between items-center">
          <CardTitle className="text-gray-600">Profile</CardTitle>
          <Button className="text-gray-600">Edit</Button>
        </CardHeader>
        <div className="p-4">
          <div className="mb-2 font-bold text-gray-600">{name}</div>
          <div className="mb-4 text-gray-600">{email}</div>
          <div className="font-bold text-gray-600 mb-2">Skills</div>
          <div className="flex space-x-2">
            <Badge variant="outline" className="text-gray-600">
              UI/UX
            </Badge>
            <Badge variant="outline" className="text-gray-600">
              Branding
            </Badge>
            <Badge variant="outline" className="text-gray-600">
              Web Development
            </Badge>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ProfileCard;
