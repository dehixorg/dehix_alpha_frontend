import React from 'react';

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface UserCardProps {
  title: string;
  email: string;
  phoneno: number;
  github: string;
  location: string;
  avatarUrl: string;
}

const PersonalInfoCard: React.FC<UserCardProps> = ({
  title,
  email,
  phoneno,
  github,
  location,
  avatarUrl,
}) => {
  return (
    <div className="flex justify-center p-4 rounded-md ">
      <Card className="w-full md:max-w-lg rounded-lg shadow-md bg-white">
        <CardHeader className="px-4 py-3 flex justify-between items-center">
          <div className="m-6 ">
            <div className="m-6">
              <Avatar>
                <AvatarImage src={avatarUrl} />
                <AvatarFallback>
                  {title.charAt(0)}
                  {title.split(' ')[1]?.charAt(0)}
                </AvatarFallback>
              </Avatar>
            </div>
            <div>
              <CardTitle className="font-bold text-gray-600 text-lg">
                {title}
              </CardTitle>
            </div>
            <div>
              <CardDescription className="text-gray-600">
                {email}
              </CardDescription>
            </div>
            <div>
              <CardDescription className="text-gray-600">
                {phoneno}
              </CardDescription>
            </div>
            <div>
              <a
                href={`https://github.com/${github}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <CardDescription className="text-blue-500 hover:underline">
                  GitHub Profile
                </CardDescription>
              </a>
            </div>
            <div>
              <CardDescription className="text-gray-600">
                {location}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>
    </div>
  );
};

export default PersonalInfoCard;
