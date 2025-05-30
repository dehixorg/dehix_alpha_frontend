import React from 'react';

import dummyData from '@/dummydata.json';
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
function ProjectDetailCard() {
  return (
    <div>
      <Card className="">
        <CardHeader className="pb-3">
          <CardTitle>Project Name</CardTitle>
          <CardDescription className="">
            <div className="mt-4 grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8 lg:grid-cols-4 xl:grid-cols-4">
              <div className="grid auto-rows-max items-start gap-4 md:gap-8 lg:col-span-3 border-r-2 pr-6 border-gray-300">
                {dummyData.businessProjectDetailCard.description}
                <div className=" ml-4">
                  <ul className="flex flex-wrap gap-4">
                    <li className="min-w-[45%] ">
                      <span className="text-gray-700 font-semibold ">
                        Email-{' '}
                      </span>{' '}
                      {dummyData.businessProjectDetailCard.email}
                    </li>
                    <li className="min-w-[45%] ">
                      <span className="text-gray-700 font-semibold ">
                        Staus-{' '}
                      </span>{' '}
                      {dummyData.businessProjectDetailCard.status}
                    </li>
                    <li className="min-w-[45%] ">
                      <span className="text-gray-700 font-semibold ">
                        Start Date-{' '}
                      </span>{' '}
                      {dummyData.businessProjectDetailCard.startDate}
                    </li>
                    <li className="min-w-[45%] ">
                      <span className="text-gray-700 font-semibold ">
                        End date-{' '}
                      </span>{' '}
                      {dummyData.businessProjectDetailCard.endDate}
                    </li>
                  </ul>
                </div>
              </div>
              <div className=" ">
                <div className="my-4">
                  <h4 className="text-center scroll-m-20 text-xl font-semibold tracking-tight transition-colors first:mt-0">
                    Project Domains
                  </h4>
                  <div className="flex flex-wrap gap-x-4 gap-y-2 my-2">
                    {dummyData.businessprojectCardDomains.map(
                      (domain, index) => (
                        <Badge key={index}>{domain}</Badge>
                      ),
                    )}
                  </div>
                </div>
                <div className="pt-4">
                  <h4 className="text-center scroll-m-20 text-xl font-semibold tracking-tight transition-colors first:mt-0">
                    Skills
                  </h4>
                  <div className="flex flex-wrap gap-x-4 gap-y-2 my-2">
                    {dummyData.businessprojectCardSkills.map((skill, index) => (
                      <Badge key={index}>{skill}</Badge>
                    ))}
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

export default ProjectDetailCard;
