'use client';
// eslint-disable-next-line import/order
import React, { useEffect, useState } from 'react'; // Import 'react' first

// Lucid icons
// eslint-disable-next-line import/order
import {
  Boxes,
  Home,
  Lightbulb,
  LineChart,
  ListFilter,
  Package,
  Plus,
  Search,
  Settings,
  Users2,
} from 'lucide-react';

// Shared components
// eslint-disable-next-line import/order
import Breadcrumb from '@/components/shared/breadcrumbList';

// UI components
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
// eslint-disable-next-line import/order
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  menuItemsBottom,
  menuItemsTop,
} from '@/config/menuItems/business/dashboardMenuItems';
// Menu components
import SidebarMenu, { MenuItem } from '@/components/menu/sidebarMenu';
import DropdownProfile from '@/components/shared/DropdownProfile';
import CollapsibleSidebarMenu from '@/components/menu/collapsibleSidebarMenu';
import { Card, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import InterviewCard from '@/components/shared/interviewCard';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { axiosInstance } from '@/lib/axiosinstance';

new Date('2023-11-23T10:30:00Z');

interface Skill {
  _id: string;
  label: string;
}

interface Domain {
  _id: string;
  label: string;
}

const sampleInterview = {
  interviewer: 'John Doe',
  interviewee: 'Jane Smith',
  skill: 'React Development',
  interviewDate: new Date('2023-11-23T10:30:00Z'),
  rating: 4.5,
  comments: 'Great communication skills and technical expertise.',
};

export default function Dashboard() {
  const [skills, setSkills] = useState<string[]>([]);
  const [domains, setDomains] = useState<string[]>([]);
  useEffect(() => {
    const fetchData = async () => {
      try {
        const skillsResponse = await axiosInstance.get('/skills/all');
        console.log('Skills API Response get:', skillsResponse.data.data);
        const transformedSkills = skillsResponse.data.data.map(
          (skill: Skill) => ({
            value: skill.label, // Set the value to label
            label: skill.label, // Set the label to label
          }),
        );
        setSkills(transformedSkills);

        const domainResponse = await axiosInstance.get('/domain/all');
        console.log('Domain API Response get:', domainResponse.data.data);
        const transformedDomain = domainResponse.data.data.map(
          (skill: Domain) => ({
            value: skill.label, // Set the value to label
            label: skill.label, // Set the label to label
          }),
        );
        setDomains(transformedDomain);
      } catch (error) {
        console.error('API Error:', error);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <SidebarMenu
        menuItemsTop={menuItemsTop}
        menuItemsBottom={menuItemsBottom}
        active="Dehix Talent"
      />
      <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
          {/* CollapsibleSidebarMenu component */}
          <CollapsibleSidebarMenu
            menuItemsTop={menuItemsTop}
            menuItemsBottom={menuItemsBottom}
            active="Dehix Talent"
          />

          {/* Breadcrumb component */}
          <Breadcrumb
            items={[
              { label: 'Business', link: '/dashboard/business' },
              { label: 'HireTalent', link: '#' },
            ]}
          />

          {/* Search and Input components */}
          <div className="relative ml-auto flex-1 md:grow-0">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search..."
              className="w-full rounded-lg bg-background pl-8 md:w-[200px] lg:w-[336px]"
            />
          </div>

          {/* DropdownMenu component */}
          <DropdownProfile />
        </header>
        <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8 lg:grid-cols-3 xl:grid-cols-3">
          <div className="grid auto-rows-max items-start gap-4 md:gap-8 lg:col-span-2">
            {/* Dialog component */}
            <div className="mb-4 mt-3">
              <h2 className="text-2xl font-semibold">Add Talent</h2>

              <Dialog>
                <DialogTrigger asChild>
                  <Button className="w-full sm:w-auto mr-2 mt-4">
                    <Plus className="mr-1 h-4 w-4" /> Add your Talent by Skill
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add Talent by Skill</DialogTitle>
                    <DialogDescription>
                      Select your Skill, Description, and Experience.
                    </DialogDescription>
                  </DialogHeader>

                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a Skill" />
                    </SelectTrigger>
                    <SelectContent>
                      {skills.map((skill: any, index: number) => (
                        <SelectItem key={index} value={skill.label}>
                          {skill.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <div className="mt-2">
                    <label
                      htmlFor="description"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Description
                    </label>
                    <textarea
                      id="description"
                      rows={2}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      placeholder="Describe the talent..."
                    ></textarea>
                  </div>
                  <div className="mt-2">
                    <label
                      htmlFor="experience"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Experience
                    </label>
                    <input
                      type="number"
                      id="experience"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      placeholder="Years of experience"
                    />
                  </div>
                </DialogContent>
              </Dialog>

              <Dialog>
                <DialogTrigger asChild>
                  <Button className="w-full sm:w-auto mr-2 mt-2">
                    <Plus className="mr-1 h-4 w-4" /> Add your Talent by Skill
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add Talent by Domain</DialogTitle>
                    <DialogDescription>
                      Select your Domain, Description, and Experience.
                    </DialogDescription>
                  </DialogHeader>

                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a Domain" />
                    </SelectTrigger>
                    <SelectContent>
                      {domains.map((domain: any, index: number) => (
                        <SelectItem key={index} value={domain.label}>
                          {domain.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <div className="mt-2">
                    <label
                      htmlFor="description"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Description
                    </label>
                    <textarea
                      id="description"
                      rows={2}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      placeholder="Describe the talent..."
                    ></textarea>
                  </div>
                  <div className="mt-2">
                    <label
                      htmlFor="experience"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Experience
                    </label>
                    <input
                      type="number"
                      id="experience"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      placeholder="Years of experience"
                    />
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          <div className="grid auto-rows-max items-start gap-4 md:gap-8 lg:col-span-2 -mt-2">
            <div className="w-fit">
              <Tabs defaultValue="active">
                <TabsList className="flex items-center space-x-4">
                  <TabsTrigger value="active">Domain</TabsTrigger>
                  <TabsTrigger value="pending">Skills</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
            <div>
              <Card className="sm:col-span-2 flex flex-col h-full">
                <CardHeader className="pb-3">
                  <CardTitle className="text-2xl mb-3">Skill/Domain</CardTitle>
                </CardHeader>
                <CardFooter className=" grid gap-4 grid-cols-4"></CardFooter>
              </Card>
            </div>
          </div>
          <div className="space-y-6 lg:-mt-32">
            <CardTitle className="group flex items-center gap-2 text-2xl lg:-mt-4">
              Talent
            </CardTitle>
            <InterviewCard {...sampleInterview} />
          </div>

          {/* DropdownMenu component */}
          <div className="absolute right-0 px-8">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-9 w-auto px-4 gap-1 text-sm"
                >
                  <ListFilter className="h-3.5 w-3.5" />
                  <span className="sr-only sm:not-sr-only">Filter</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Filter by</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuCheckboxItem>All</DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem>Current</DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem>Completed</DropdownMenuCheckboxItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </main>
      </div>
    </div>
  );
}
