// src/components/OtherBits.tsx

import * as React from 'react';
import { CircleUserRound } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';

interface OtherBitsProps {
  usernames: { username: string; bitAmount: number }[];
}

const OtherBits: React.FC<OtherBitsProps> = ({ usernames }) => {
  return (
    <Card className="w-[350px]">
      <CardHeader>
        <CardTitle className="pb-2">Other-bids</CardTitle>

        <div className="mt-2">
          <Separator />
        </div>
      </CardHeader>

      <CardContent>
        <div>
          {usernames.map((user, index) => (
            <div key={index} className="grid w-full items-center gap-4">
              <div className="flex items-center space-x-2 mb-3">
                <CircleUserRound className="w-6 h-5" />
                <Label>
                  {user.username} = {user.bitAmount}
                </Label>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default OtherBits;
