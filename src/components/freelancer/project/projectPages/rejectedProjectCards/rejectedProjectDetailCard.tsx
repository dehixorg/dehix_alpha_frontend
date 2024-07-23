import React from 'react';

import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import dummyData from '@/dummydata.json';

function RejectProjectDetailCard() {
  return (
    <div>
      <Card className="">
        <CardHeader className="pb-3">
          <CardTitle>{dummyData.projectRejectedCard.companyName}</CardTitle>
          <CardDescription className="">
            <div className="mt-4 grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8 lg:grid-cols-4 xl:grid-cols-4">
              <div className="grid auto-rows-max items-start gap-4 md:gap-8 lg:col-span-3 border-r-2 pr-6 border-gray-300">
                {dummyData.projectRejectCardPage.description}
                <div className="ml-4">
                  <ul className="flex flex-wrap gap-4">
                    <li className="min-w-[45%]">
                      <span className="text-gray-700 font-semibold">
                        Email-{' '}
                      </span>
                      {dummyData.projectRejectedCard.email}
                    </li>
                    <li className="min-w-[45%]">
                      <span className="text-gray-700 font-semibold">
                        Status-{' '}
                      </span>
                      Rejected
                    </li>
                    <li className="min-w-[45%]">
                      <span className="text-gray-700 font-semibold">
                        Start Date-{' '}
                      </span>
                      {dummyData.projectRejectedCard.start}
                    </li>
                  </ul>
                </div>
              </div>
              <div>
                <div className="pt-4">
                  <h4 className="text-center scroll-m-20 text-xl font-semibold tracking-tight transition-colors first:mt-0">
                    Skills
                  </h4>
                  <div className="flex flex-wrap gap-x-4 gap-y-2 my-4">
                    {dummyData.projectRejectedCard.skillsRequired.map(
                      (skill) => (
                        <Badge key={skill}>{skill}</Badge>
                      ),
                    )}
                  </div>
                </div>
              </div>
            </div>
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}

export default RejectProjectDetailCard;
