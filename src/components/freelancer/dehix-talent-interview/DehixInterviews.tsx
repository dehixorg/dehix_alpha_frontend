'use client';
import React from 'react';
import { Briefcase, Calendar, DollarSign } from 'lucide-react';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

const DehixInterviews = ({
  filter,
  isTableView,
  searchQuery,
  skillData,
  domainData,
}: any) => {
  const filteredData = () => {
    const data =
      filter === 'All'
        ? [...skillData, ...domainData]
        : filter === 'Skills'
          ? skillData
          : filter === 'Domain'
            ? domainData
            : [];

    return searchQuery
      ? data.filter(({ talentType }: any) =>
          talentType?.toLowerCase().includes(searchQuery.toLowerCase()),
        )
      : data;
  };

  const getRemainingDays = (dateString: string | undefined): string => {
    if (!dateString) return 'N/A';

    const today = new Date().getTime(); // Get timestamp in milliseconds
    const scheduledDate = new Date(dateString).getTime(); // Convert to timestamp

    const diffTime = scheduledDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays > 0 ? `${diffDays}d` : 'Today';
  };

  return (
    <div className="p-6 w-full">
      <div className="mb-8  ml-0 md:ml-5 ">
        <h1 className="text-2xl font-bold">Dehix-talent interview</h1>
      </div>
      <div className=" p-0 md:p-6 flex flex-col gap-4  sm:px-6 sm:py-0 md:gap-8  pt-2 pl-0 sm:pt-4 sm:pl-6 md:pt-6 md:pl-8  relative">
        <div>
          {filteredData().length === 0 ? (
            <div className="text-center text-gray-500 py-6">
              No related data found.
            </div>
          ) : isTableView ? (
            <div className="w-full bg-card  mx-auto px-4 md:px-10 py-6 border border-gray-200 rounded-xl shadow-md">
              <Table>
                <TableHeader>
                  <TableRow className=" hover:bg-[#09090B">
                    <TableHead className="w-[180px] text-center font-medium">
                      Interviwer
                    </TableHead>
                    <TableHead className="w-[180px] text-center font-medium">
                      Talent Name
                    </TableHead>
                    <TableHead className=" font-medium text-center ">
                      Experience
                    </TableHead>
                    <TableHead className=" font-medium text-center">
                      Interview Fees
                    </TableHead>
                    <TableHead className=" font-medium text-center">
                      Level
                    </TableHead>
                    <TableHead className=" font-medium text-center">
                      Status
                    </TableHead>
                    <TableHead className="  font-medium text-center">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredData()!.map((interview: any) =>
                    Object.values(interview?.interviewBids || {})
                      .filter((bid: any) => bid?.status === 'ACCEPTED')
                      .map((bid: any) => (
                        <TableRow key={interview._id} className=" transition">
                          <TableCell className="py-3 text-center">
                            {bid?.interviewer?.userName || 'Unknown'}
                          </TableCell>
                          <TableCell className="py-3 text-center">
                            {interview.talentType}
                          </TableCell>
                          <TableCell className="py-3 text-center">
                            {bid?.interviewer?.workExperience}
                          </TableCell>
                          <TableCell className="py-3 text-center">
                            {bid?.fee}
                          </TableCell>
                          <TableCell className="py-3 text-center">
                            {interview.level}
                          </TableCell>
                          <TableCell className="py-3 text-center">
                            <Badge
                              variant={'default'}
                              className="px-1 py-1 text-xs"
                            >
                              {interview?.InterviewStatus}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right py-3">
                            <Button
                              variant="outline"
                              size="sm"
                              className="mr-3"
                            >
                              Edit
                            </Button>
                            <Button size="sm">View</Button>
                          </TableCell>
                        </TableRow>
                      )),
                  )}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredData()!.map((interview: any) =>
                Object.values(interview?.interviewBids || {})
                  .filter((bid: any) => bid?.status === 'ACCEPTED') // Filter only accepted bids
                  .map((bid: any) => (
                    <Card
                      key={bid?._id}
                      className="p-6 relative rounded-2xl shadow-xl border border-gray-300 hover:shadow-2xl "
                    >
                      <CardHeader className="p-4 border-b  rounded-t-2xl">
                        <CardTitle className="text-xl font-semibold ">
                          {bid?.interviewer?.userName || 'Unknown'}
                        </CardTitle>
                        <CardDescription className="text-sm ">
                          {interview?.level}
                        </CardDescription>
                        <p className="text-sm absolute top-1 right-3 flex items-center gap-2">
                          <Badge
                            variant={'default'}
                            className="px-1 py-1 text-xs"
                          >
                            {interview?.InterviewStatus}
                          </Badge>
                        </p>
                      </CardHeader>
                      <CardContent className="p-4 space-y-3">
                        <p className="text-sm flex items-center gap-2">
                          <Briefcase size={16} className="" />
                          <span className="font-medium">Experience :</span>
                          {bid?.interviewer?.workExperience} years
                        </p>
                        <p className="text-sm flex items-center gap-2">
                          <DollarSign size={16} className="" />
                          <span className="font-medium">Interview Fees :</span>₹
                          {bid?.fee}
                        </p>
                        <p className="text-sm flex items-center whitespace-nowrap gap-2">
                          <Calendar size={16} className="" />
                          <span className="font-medium">Schedule Date :</span>
                          {new Date(bid?.suggestedDateTime).toLocaleDateString(
                            'en-US',
                            {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                            },
                          )}
                        </p>
                      </CardContent>
                      <CardFooter className="flex  justify-between p-4 border-t  rounded-b-2xl">
                        <Button variant="outline" size="sm" className="">
                          Edit
                        </Button>
                        <Button size="sm" className="">
                          View
                        </Button>
                        <span className="absolute bottom-3 right-4 text-xs font-medium text-gray-600  px-2 py-1 rounded-md">
                          {getRemainingDays(bid?.suggestedDateTime)}
                        </span>
                      </CardFooter>
                    </Card>
                  )),
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DehixInterviews;
