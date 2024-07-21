// FreelancerCard.tsx

import React from 'react';

import { Card, CardContent, CardTitle, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface FreelancerCardProps {
  name: string;
  skills: string[];
  domains: string[];
  experience: string;
}

const FreelancerCard: React.FC<FreelancerCardProps> = ({
  name,
  skills,
  domains,
  experience,
}) => {
  console.log({
    name,
    skills,
    domains,
    experience,
  });
  return (
    <Card className="w-full max-w-4xl">
      <CardHeader className="pb-3">
        <CardTitle className="text-2xl font-bold">{name}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mt-4">
          <div className="flex items-center">
            <span className="font-medium text-gray-400">Experience:</span>
            <span className="ml-1">{experience}</span>
          </div>
          {skills && skills.length && (
            <div className="mt-2">
              <p className="font-medium">Skills:</p>
              {skills?.map((skill: any, index) => (
                <Badge key={index} className="mr-2 mb-2 uppercase">
                  {skill.name}
                </Badge>
              ))}
            </div>
          )}
          {domains && domains.length && (
            <div className="mt-2">
              <p className="font-medium">Domains:</p>
              {domains?.map((domain: any, index) => (
                <Badge key={index} className="mr-2 mb-2 uppercase">
                  {domain.name}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default FreelancerCard;
