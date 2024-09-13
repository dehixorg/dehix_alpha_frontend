import * as React from 'react';
import { Avatar } from '@radix-ui/react-avatar';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface FreelancerCardProps {
  name: string;
  contact: string;
  role: string;
  bio: string;
  experience: string;
  company1: string;
  company2: string;
  rating: number;
  sessionsCompleted: number;
  skills: any;
}

const FreelancerCard: React.FC<FreelancerCardProps> = ({
  name,
  contact,
  role,
  bio,
  experience,
  company1,
  company2,
  rating,
  sessionsCompleted,
  skills,
}) => {
  console.log({
    name,
    contact,
    role,
    bio,
    experience,
    company1,
    company2,
    rating,
    sessionsCompleted,
    skills,
  });

  return (
    <div className="w-full mb-4 max-w-3xl ">
      <Card className="flex justify-between mt-5 shadow-2xl shadow-lg shadow-gray-500/20">
        <div className="flex flex-col justify-between p-4">
          <CardHeader>
            <div className="flex gap-4">
              <Avatar className="rounded-full w-20 h-20 object-cover border-2 border-gray-400 mb-4" />
              <div className="mt-2">
                <CardTitle className="text-xl font-bold">{name}</CardTitle>
                <p className="text-sm text-gray-400">@codeacks</p>
                <p className="text-sm text-blue-600 font-semibold">
                  SDE2 @ Amazon
                </p>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            <p className="text-sm text-gray-400">
              SDE 2 @Amazon | Founder @codedecks🚀
            </p>
            <p className="text-sm">
              <span className="font-bold">{}6+ Years of Experience </span> at{' '}
              <span className="text-blue-600 font-semibold">{}Amazon|</span>{' '}
              <span className="text-blue-600 font-semibold">
                IBM Software Labs
              </span>
            </p>
            <div className="flex items-center gap-2">
              <p className="text-sm text-yellow-900">⭐⭐⭐⭐</p>
              <p className="px-3 py-1 text-xs text-white bg-green-600 rounded-lg font-bold shadow-md">
                {sessionsCompleted} Sessions Completed
              </p>
            </div>

            {skills && skills.length && (
              <div className="mt-2">
                <p className="font-medium"></p>
                <div className="flex flex-wrap gap-2">
                  {skills?.map(
                    (skill: any, index: React.Key | null | undefined) => (
                      <Badge
                        key={index}
                        className=" bg-foreground text-background border border-white rounded-xl font-bold "
                      >
                        {skill.name}
                      </Badge>
                    ),
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </div>
      </Card>
    </div>
  );
};

export default FreelancerCard;
