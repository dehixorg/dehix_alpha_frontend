'use client';
import Image from 'next/image';
// eslint-disable-next-line import/order
import React, { useState } from 'react'; // 'react' should be imported first

// Import components from '@/components/shared'
import { Search } from 'lucide-react';
import { useSelector } from 'react-redux';

import Breadcrumb from '@/components/shared/breadcrumbList';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RootState } from '@/lib/store';
import InterviewCard from '@/components/shared/interviewCard';
import TalentSidebar from '@/components/TalentSidebar';

// Import Lucid icons and Redux hooks

// Import components that were not used in this file (commented out)
// import InterviewCard from '@/components/shared/interviewCard';
// import ProjectDetailCard from '@/components/business/project/projectDetailCard';
// import { ProjectProfileDetailCard } from '@/components/business/project/projectProfileDetailCard';
// import SidebarMenu, { MenuItem } from '@/components/menu/sidebarMenu';
// import CollapsibleSidebarMenu from '@/components/menu/collapsibleSidebarMenu';
// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogHeader,
//   DialogTitle,
//   DialogTrigger,
// } from '@/components/ui/dialog';
new Date('2023-11-23T10:30:00Z');

const sampleInterview = {
  interviewer: 'John Doe',
  interviewee: 'Jane Smith',
  skill: 'React Development',
  interviewDate: new Date('2023-11-23T10:30:00Z'),
  rating: 4.5,
  comments: 'Great communication skills and technical expertise.',
};

export default function Dashboard() {
  const user = useSelector((state: RootState) => state.user); // Adjusted RootState to state
  const [activeTab, setActiveTab] = useState('active');

  const DoimanDummyData = [
    {
      skill: 'Frontend Development',
      experience: '3 years',
      monthlyPay: '$5000',
      status: 'Active',
    },
    {
      skill: 'Backend Development',
      experience: '2 years',
      monthlyPay: '$6000',
      status: 'Pending',
    },
    {
      skill: 'Graphic Designing',
      experience: '4 years',
      monthlyPay: '$5500',
      status: 'Active',
    },
  ];

  const SkillDummyData = [
    {
      skill: 'Python',
      experience: '5 years',
      monthlyPay: '$7000',
      status: 'Active',
    },
    {
      skill: 'Django',
      experience: '3 years',
      monthlyPay: '$6000',
      status: 'Pending',
    },
    {
      skill: 'Flask',
      experience: '2 years',
      monthlyPay: '$5500',
      status: 'Active',
    },
  ];

  return (
    <div className="flex min-h-screen w-full flex-col bg-gray-100 bg-opacity-40">
      <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-white px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
          <TalentSidebar />

          {/* Breadcrumbs */}
          <Breadcrumb
            items={[
              { label: 'Business', link: '/dashboard/business' },
              { label: 'HireTalent', link: '#' },
            ]}
          />

          {/* Search */}
          <div className="relative ml-auto flex-1 md:grow-0">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              type="search"
              placeholder="Search..."
              className="w-full rounded-lg bg-white pl-8 md:w-[200px] lg:w-[336px]"
            />
          </div>

          {/* Profile Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="overflow-hidden rounded-full"
              >
                <Image
                  src="/placeholder-user.jpg"
                  width={36}
                  height={36}
                  alt="Avatar"
                  className="overflow-hidden rounded-full"
                />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>{user.email}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Settings</DropdownMenuItem>
              <DropdownMenuItem>Support</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Logout</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>

        <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8 lg:grid-cols-3 xl:grid-cols-3">
          <div className="grid auto-rows-max items-start gap-4 md:gap-8 lg:col-span-2">
            <div>
              <h2 className="text-3xl font-semibold mb-4">Dehix Hire Talent</h2>

              <div className="w-48">
                <Tabs
                  defaultValue="active"
                  onValueChange={(value) => setActiveTab(value)}
                >
                  <TabsList className="flex items-center space-x-4">
                    <TabsTrigger value="active">Domain</TabsTrigger>
                    <TabsTrigger value="pending">Skills</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </div>
            {activeTab === 'active' && (
              <Card className="sm:col-span-2 flex flex-col h-full">
                <CardHeader className="pb-3">
                  <CardTitle className="text-4xl mb-1">Domain</CardTitle>
                  <CardDescription>Your Domain</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Skill
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Experience
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Monthly Pay
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {DoimanDummyData.map((item, index) => (
                          <tr key={index}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">
                                {item.skill}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-500">
                                {item.experience}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-500">
                                {item.monthlyPay}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span
                                className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${item.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}
                              >
                                {item.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
                <CardFooter className="grid gap-4 grid-cols-4"></CardFooter>
              </Card>
            )}

            {activeTab === 'pending' && (
              <Card className="sm:col-span-2 flex flex-col h-full">
                <CardHeader className="pb-3">
                  <CardTitle className="text-4xl mb-1">Skill</CardTitle>
                  <CardDescription>Your Skill</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Skill
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Experience
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Monthly Pay
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {SkillDummyData.map((item, index) => (
                          <tr key={index}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">
                                {item.skill}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-500">
                                {item.experience}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-500">
                                {item.monthlyPay}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span
                                className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${item.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}
                              >
                                {item.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
                <CardFooter className="grid gap-4 grid-cols-4"></CardFooter>
              </Card>
            )}
          </div>
          <div className="space-y-6">
            <CardTitle className="group flex items-center gap-2 text-2xl">
              Talent
            </CardTitle>
            <InterviewCard {...sampleInterview} />
          </div>
        </main>
      </div>
    </div>
  );
}
