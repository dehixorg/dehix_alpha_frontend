// src/components/ProjectSidebar.tsx

import * as React from 'react';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';

const ProjectSidebar: React.FC = () => {
  return (
    <Card className="w-[350px]">
      <CardHeader>
        <CardTitle className="pb-2">User-bid</CardTitle>

        <div className="mt-2">
          <Separator />
        </div>
      </CardHeader>

      <CardContent>
        <form>
          <div className="grid w-full items-center gap-4">
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="bitAmt">your bid amount:</Label>
              <Input id="bitAmt" placeholder="Enter your bid amount" />
            </div>
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="coverLetter">Cover letter:</Label>
              <Textarea
                id="coverLetter"
                placeholder="Write your cover letter"
              />
            </div>
          </div>
        </form>
      </CardContent>
      <CardFooter className="flex justify-center ">
        <Button className="py-3 px-6 w-full">Apply</Button>
      </CardFooter>
    </Card>
  );
};

export default ProjectSidebar;
