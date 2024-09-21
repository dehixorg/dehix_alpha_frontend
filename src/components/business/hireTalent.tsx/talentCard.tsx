'use client';

import React, { useEffect, useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { axiosInstance } from '@/lib/axiosinstance';

interface DehixTalent {
  _id: string;
  skillName?: string;
  domainName?: string;
  experience: string;
  monthlyPay: string;
  status: string;
  activeStatus: boolean;
}

interface Talent {
  _id: string;
  dehixTalent: Record<string, DehixTalent>;
}

const TalentCard: React.FC = () => {
  const [talents, setTalents] = useState<Talent[]>([]);

  useEffect(() => {
    // Fetch the talent data from the API
    const fetchTalentData = async () => {
      try {
        const response = await axiosInstance.get('/freelancer/dehixTalent'); // Adjust API endpoint
        setTalents(response.data.data); // Assuming API gives data in `data` field
      } catch (error) {
        console.error('Error fetching talent data', error);
      }
    };

    fetchTalentData();
  }, []);

  return (
    <div className="flex flex-wrap justify-center gap-4">
      {talents.map((talent) =>
        Object.keys(talent.dehixTalent).map((key) => {
          const talentEntry = talent.dehixTalent[key];

          // Check if it's a skill or domain and set appropriate label and value
          const label = talentEntry.skillName ? 'Skill' : 'Domain';
          const value =
            talentEntry.skillName || talentEntry.domainName || 'N/A'; // Fallback if both are missing

          return (
            <Card
              key={`${talent._id}-${key}`}
              className="w-full sm:w-[350px] lg:w-[450px]"
            >
              <CardHeader className="flex flex-row items-center gap-4">
                <Avatar className="h-14 w-14">
                  <AvatarImage
                    src="/placeholder.svg?height=80&width=80"
                    alt="Profile picture"
                  />
                  <AvatarFallback>JD</AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <CardTitle>{value}</CardTitle>{' '}
                  {/* Display skillName or domainName as the card title */}
                  <p className="text-sm text-muted-foreground">
                    Software Engineer
                  </p>
                </div>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <div className="flex justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold">{label}</span>
                      <Badge>{value}</Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold">Experience</span>
                      <Badge>{talentEntry.experience} years</Badge>
                    </div>
                  </div>
                  <div className="flex justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold">Monthly Pay</span>
                      <Badge>{talentEntry.monthlyPay} USD</Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm text-muted-foreground mt-2">
                        Status: {talentEntry.status}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        }),
      )}
    </div>
  );
};

export default TalentCard;
