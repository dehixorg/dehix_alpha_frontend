import React, { useState, useEffect } from 'react';
import { Avatar } from '@radix-ui/react-avatar';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton'; // Import the Skeleton component

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
  const [loading, setLoading] = useState(true);

  // Simulate a loading effect
  useEffect(() => {
    const timeout = setTimeout(() => {
      setLoading(false);
    }, 2000); // Mock 2 seconds loading
    return () => clearTimeout(timeout);
  }, []);

  if (loading) {
    return (
      <div className="w-full mb-4 max-w-4xl">
        <Card className="flex justify-between mt-5  shadow-lg shadow-gray-500/20">
          <div className="flex flex-col justify-between p-4">
            <CardHeader>
              <div className="flex gap-4">
                <Skeleton className="rounded-full w-20 h-20" />
                <div className="mt-2">
                  <Skeleton className="w-32 h-8" />
                </div>
              </div>
            </CardHeader>

            <CardContent>
            <div className="flex flex-wrap gap-2">
              <p className="font-medium">Experience:</p>
              <Skeleton className="w-16 h-6 " />
             </div>
             
              <div className="mt-2">
                <p className="font-medium">Skills:</p>
                <div className="flex flex-wrap gap-2">
                  <Skeleton className="w-16 h-6" />
                  <Skeleton className="w-16 h-6" />
                  <Skeleton className="w-16 h-6" />
                  <Skeleton className="w-16 h-6" />
                  <Skeleton className="w-16 h-6" />
                  <Skeleton className="w-16 h-6" />
                  <Skeleton className="w-16 h-6" />
                  <Skeleton className="w-16 h-6" />
                  <Skeleton className="w-16 h-6" />
                </div>
              </div>

              <div className="mt-2">
                <p className="font-medium">Domains:</p>
                <div className="flex flex-wrap gap-2">
                  <Skeleton className="w-16 h-6" />
                  <Skeleton className="w-16 h-6" />
                  <Skeleton className="w-16 h-6" />
                  <Skeleton className="w-16 h-6" />
                  <Skeleton className="w-16 h-6" />
                  <Skeleton className="w-16 h-6" />
                  <Skeleton className="w-16 h-6" />
                  <Skeleton className="w-16 h-6" />
                  <Skeleton className="w-16 h-6" />
                </div>
              </div>
            </CardContent>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className=" sm:mx-10 mb-3 max-w-3xl">
      <Card className="flex justify-between mt-5 shadow-2xl shadow-lg shadow-gray-500/20 mt-2 ">
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
                      className="bg-foreground text-background border border-white rounded-xl font-bold uppercase"
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
                      className="bg-foreground text-background border border-white rounded-xl font-bold uppercase"
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
