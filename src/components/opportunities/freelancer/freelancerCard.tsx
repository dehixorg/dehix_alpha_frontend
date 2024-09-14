import React from 'react';
import { Avatar } from '@radix-ui/react-avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
  return (
    <div className="w-full mb-4 max-w-4xl">
      <Card className="flex justify-between mt-5 shadow-2xl shadow-lg shadow-gray-500/20">
        <div className="flex flex-col justify-between p-4">
          <CardHeader>
            <div className="flex gap-4">
              <Avatar className="rounded-full w-20 h-20 object-cover border-2 border-gray-400 mb-4" />
              <div className="mt-2">
                <CardTitle className="text-xl font-bold">{name}</CardTitle>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            <p className="text-sm">
              <span className="font-medium text-gray-400">Experience:</span>
              <span className="font-bold">{experience} </span>
            </p>

            {/* Skills Section */}
            {skills && skills.length && (
              <div className="mt-2">
                <p className="font-medium">Skills:</p>
                <div className="flex flex-wrap gap-2">
                  {skills?.map((skill: any, index) => (
                    <Badge
                      key={index}
                      className="bg-foreground text-background border border-white rounded-xl font-bold"
                    >
                      {skill.name}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Domains Section */}
            {domains && domains.length && (
              <div className="mt-2">
                <p className="font-medium">Domains:</p>
                <div className="flex flex-wrap gap-2">
                  {domains?.map((domain: any, index) => (
                    <Badge
                      key={index}
                      className="bg-foreground text-background border border-white rounded-xl font-bold"
                    >
                      {domain.name}
                    </Badge>
                  ))}
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
