'use client';
import Link from 'next/link';
import { CheckCircle, Clock, PackageOpen, CalendarX2 } from 'lucide-react';
import { useSelector } from 'react-redux';
import { useEffect, useState } from 'react';

import SidebarMenu from '@/components/menu/sidebarMenu';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from '@/components/ui/carousel';
import { Separator } from '@/components/ui/separator';
import { RootState } from '@/lib/store';
import StatCard from '@/components/shared/statCard';
import { ProjectCard } from '@/components/cards/projectCard';
import {
  menuItemsBottom,
  menuItemsTop,
} from '@/config/menuItems/business/dashboardMenuItems';
import { axiosInstance } from '@/lib/axiosinstance';
import dummyData from '@/dummydata.json';
import { StatusEnum } from '@/utils/freelancer/enum';
import Header from '@/components/header/header';

export default function Dashboard() {
  const user = useSelector((state: RootState) => state.user);
  const [responseData, setResponseData] = useState<any>([]); // State to hold response data

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (user?.uid) {
          // Optional chaining to ensure `user` is defined
          const response = await axiosInstance.get(
            `/project/business`,
          );
          console.log(response);
          
          setResponseData(response.data.data); // Store response data in state
        }
      } catch (error) {
        console.error('API Error:', error);
      }
    };
    fetchData();
  }, [user.uid]);

  const completedProjects = responseData.filter(
    (project: any) => project.status == StatusEnum.COMPLETED,
  );
  const pendingProjects = responseData.filter(
    (project: any) => project.status !== StatusEnum.COMPLETED,
  );

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <SidebarMenu
        menuItemsTop={menuItemsTop}
        menuItemsBottom={menuItemsBottom}
        active="Dashboard"
      />
      <div className="flex flex-col sm:gap-8 sm:py-0 sm:pl-14">
        <Header
          menuItemsTop={menuItemsTop}
          menuItemsBottom={menuItemsBottom}
          activeMenu="Dashboard"
          breadcrumbItems={[
            { label: 'Dashboard', link: '/dashboard/business' },
            { label: 'Business', link: '#' },
          ]}
        />
        <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8 lg:grid-cols-3 xl:grid-cols-3">
          <div className="grid auto-rows-max items-start gap-4 md:gap-8 lg:col-span-2">
            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4">
              {/* Create project card */}
              <Card className="sm:col-span-2" x-chunk="dashboard-05-chunk-0">
                <CardHeader className="pb-3">
                  <CardTitle>Your Projects</CardTitle>
                  <CardDescription className="max-w-lg text-balance leading-relaxed">
                    Introducing Our Dynamic Projects Dashboard for Seamless
                    Management and Insightful Analysis.
                  </CardDescription>
                </CardHeader>
                <CardFooter>
                  {/* Wrap the Button with the Link component to make it clickable */}
                  <Link href="/business/add-project" passHref>
                    <Button className="w-full">
                      {' '}
                      {/* Ensure the Button takes up full width */}
                      Create New Project
                    </Button>
                  </Link>
                </CardFooter>
              </Card>

              <StatCard
                title="Completed Projects"
                value={completedProjects.length}
                icon={<CheckCircle className="h-6 w-6 text-success" />}
                additionalInfo={'Project stats will be here'}
              />

              <StatCard
                title="Pending Projects"
                value={pendingProjects.length}
                icon={<Clock className="h-6 w-6 text-warning" />}
                additionalInfo={'Pending project stats will be here'}
              />
            </div>
            <Separator className="my-1" />
            <h2 className="scroll-m-20 text-3xl font-semibold tracking-tight transition-colors first:mt-0">
              Current Projects {`(${pendingProjects.length})`}
            </h2>
            <div className="flex gap-4 overflow-x-scroll no-scrollbar pb-8 pt-5">
              <Carousel className="w-full relative">
                <CarouselContent className="flex mt-3 gap-4">
                  {pendingProjects.length > 0 ? (
                    pendingProjects.map((project: any, index: number) => (
                      <CarouselItem
                        key={index}
                        className="md:basis-1/2 lg:basis-1/2"
                      >
                        <ProjectCard
                          key={index}
                          cardClassName="min-w-[45%]"
                          project={project}
                        />
                      </CarouselItem>
                    ))
                  ) : (
                    <div className="text-center py-10 w-[100%] ">
                      <PackageOpen
                        className="mx-auto text-gray-500"
                        size="100"
                      />
                      <p className="text-gray-500">No projects available</p>
                    </div>
                  )}
                </CarouselContent>
                {pendingProjects.length > 2 && (
                  <>
                    <div className="flex">
                      <CarouselPrevious className="absolute left-0 top-1 transform -translate-y-1/2 p-2 shadow-md transition-colors">
                        Previous
                      </CarouselPrevious>
                      <CarouselNext className="absolute right-0 top-1 transform -translate-y-1/2 p-2 shadow-md transition-colors">
                        Next
                      </CarouselNext>
                    </div>
                  </>
                )}
              </Carousel>
            </div>

            <Separator className="my-1" />

            <h2 className="scroll-m-20 text-3xl font-semibold tracking-tight transition-colors first:mt-0">
              Completed Projects {`(${completedProjects.length})`}
            </h2>
            <div className="flex relative gap-4 overflow-x-scroll no-scrollbar pb-8 pt-5">
              <Carousel className="w-full relative pt-9">
                <CarouselContent className="flex gap-4">
                  {completedProjects.length > 2 ? (
                    completedProjects.map((project: any, index: number) => (
                      <CarouselItem
                        key={index}
                        className="md:basis-1/2 lg:basis-1/2"
                      >
                        <ProjectCard
                          cardClassName="min-w-full"
                          project={project}
                        />
                      </CarouselItem>
                    ))
                  ) : (
                    <div className="text-center py-10 w-full">
                      <PackageOpen
                        className="mx-auto text-gray-500"
                        size="100"
                      />
                      <p className="text-gray-500">No projects available</p>
                    </div>
                  )}
                </CarouselContent>
                {completedProjects.length > 2 && (
                  <>
                    <div className="flex">
                      <CarouselPrevious className="absolute left-0 top-1 transform -translate-y-1/2 p-2 shadow-md transition-colors">
                        Previous
                      </CarouselPrevious>
                      <CarouselNext className="absolute right-0 top-1 transform -translate-y-1/2 p-2 shadow-md transition-colors">
                        Next
                      </CarouselNext>
                    </div>
                  </>
                )}
              </Carousel>
            </div>
          </div>
          <div className="space-y-6">
            <CardTitle className="group flex items-center gap-2 text-2xl">
              Interviews
            </CardTitle>

            {dummyData?.freelancersampleInterview ? (
              // just reverse the condition while integrating the api
              <div className="text-center py-10">
                <CalendarX2 className="mx-auto mb-2 text-gray-500" size="100" />
                <p className="text-gray-500">No interviews scheduled</p>
              </div>
            ) : (
              <></>
              // <InterviewCard
              //   interviewer={sampleInterviewData.interviewer}
              //   interviewee={sampleInterviewData.interviewee}
              //   skill={sampleInterviewData.skill}
              //   interviewDate={new Date(sampleInterviewData.interviewDate)}
              //   rating={sampleInterviewData.rating}
              //   comments={sampleInterviewData.comments}
              // />
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
