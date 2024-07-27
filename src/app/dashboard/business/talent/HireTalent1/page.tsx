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
import SidebarMenu from '@/components/menu/sidebarMenu';
import DropdownProfile from '@/components/shared/DropdownProfile';
import CollapsibleSidebarMenu from '@/components/menu/collapsibleSidebarMenu';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import InterviewCard from '@/components/shared/interviewCard';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { axiosInstance } from '@/lib/axiosinstance';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Switch } from '@/components/ui/switch';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

interface Skill {
  _id: string;
  label: string;
}

interface Domain {
  _id: string;
  label: string;
}

interface SkillDomainData {
  label: string;
  experience: string;
  description: string;
  status: string;
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
  const [skills, setSkills] = useState<Skill[]>([]);
  const [domains, setDomains] = useState<Domain[]>([]);
  const [skillDomainData, setSkillDomainData] = useState<SkillDomainData[]>([]);
  const [selectedSkill, setSelectedSkill] = useState<string | null>(null);
  const [selectedDomain, setSelectedDomain] = useState<string | null>(null);
  const [description, setDescription] = useState<string>('');
  const [experience, setExperience] = useState<number | string>('');
  const [isSkillDialogOpen, setIsSkillDialogOpen] = useState(false);
  const [isDomainDialogOpen, setIsDomainDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('All');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const skillsResponse = await axiosInstance.get('/skills/all');
        console.log('Skills API Response get:', skillsResponse.data.data);
        const transformedSkills = skillsResponse.data.data.map(
          (skill: Skill) => ({
            value: skill.label,
            label: skill.label,
          }),
        );
        setSkills(transformedSkills);

        const domainResponse = await axiosInstance.get('/domain/all');
        console.log('Domain API Response get:', domainResponse.data.data);
        const transformedDomain = domainResponse.data.data.map(
          (skill: Domain) => ({
            value: skill.label,
            label: skill.label,
          }),
        );
        setDomains(transformedDomain);
      } catch (error) {
        console.error('API Error:', error);
      }
    };

    fetchData();
  }, []);

  const handleAddSkill = () => {
    if (selectedSkill && description && experience) {
      const newSkillDomainData = {
        label: selectedSkill,
        experience: experience.toString(),
        description,
        status: 'Active',
      };

      console.log('Adding Skill:', newSkillDomainData);

      setSkillDomainData((prevData) => [...prevData, newSkillDomainData]);

      setSelectedSkill(null);
      setDescription('');
      setExperience('');

      setIsSkillDialogOpen(false);
    }
  };

  const handleAddDomain = () => {
    if (selectedDomain && description && experience) {
      const newSkillDomainData = {
        label: selectedDomain,
        experience: experience.toString(),
        description,
        status: 'Active',
      };

      console.log('Adding Domain:', newSkillDomainData);

      setSkillDomainData((prevData) => [...prevData, newSkillDomainData]);

      setSelectedDomain(null);
      setDescription('');
      setExperience('');

      setIsDomainDialogOpen(false);
    }
  };

  const filteredData = skillDomainData.filter((item) => {
    if (activeTab === 'All') return true;
    if (activeTab === 'Skills')
      return skills.some((skill) => skill.label === item.label);
    if (activeTab === 'Domain')
      return domains.some((domain) => domain.label === item.label);
    return false;
  });

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <SidebarMenu
        menuItemsTop={menuItemsTop}
        menuItemsBottom={menuItemsBottom}
        active="Dehix Talent"
      />
      <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
          <CollapsibleSidebarMenu
            menuItemsTop={menuItemsTop}
            menuItemsBottom={menuItemsBottom}
            active="Dehix Talent"
          />
          <Breadcrumb
            items={[
              { label: 'Business', link: '/dashboard/business' },
              { label: 'HireTalent', link: '#' },
            ]}
          />
          <div className="relative ml-auto flex-1 md:grow-0">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search..."
              className="w-full rounded-lg bg-background pl-8 md:w-[200px] lg:w-[336px]"
            />
          </div>
          <DropdownProfile />
        </header>
        <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8 lg:grid-cols-3 xl:grid-cols-3">
          <div className="grid auto-rows-max items-start gap-4 md:gap-8 lg:col-span-2">
            <h2 className="scroll-m-20 text-3xl font-semibold tracking-tight transition-colors first:mt-0">
              Dehix Hire Talent
            </h2>
            <div className="mb-4 mt-3">
              <h2 className="text-xl font-semibold">Talent</h2>
              <Dialog
                open={isSkillDialogOpen}
                onOpenChange={setIsSkillDialogOpen}
              >
                <DialogTrigger asChild>
                  <Button className="mr-2 mt-2">
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
                  <Select onValueChange={(value) => setSelectedSkill(value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a Skill" />
                    </SelectTrigger>
                    <SelectContent>
                      {skills.map((skill) => (
                        <SelectItem key={skill._id} value={skill.label}>
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
                      value={description}
                      onChange={(e) => setDescription(e.target.value)} // Changed: Set description state
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      placeholder="  Describe the talent..."
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
                      value={experience}
                      onChange={(e) => setExperience(e.target.value)} // Changed: Set experience state
                      className="mt-1 block w-full h-[30px] rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      placeholder="  Years of experience"
                    />
                  </div>
                  <Button onClick={handleAddSkill} className="mt-4">
                    Add Talent
                  </Button>
                </DialogContent>
              </Dialog>
              <Dialog
                open={isDomainDialogOpen}
                onOpenChange={setIsDomainDialogOpen}
              >
                <DialogTrigger asChild>
                  <Button className="mt-2">
                    <Plus className="mr-1 h-4 w-4" /> Add your Talent by Domain
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add Talent by Domain</DialogTitle>
                    <DialogDescription>
                      Select your Domain, Description, and Experience.
                    </DialogDescription>
                  </DialogHeader>
                  <Select onValueChange={(value) => setSelectedDomain(value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a Domain" />
                    </SelectTrigger>
                    <SelectContent>
                      {domains.map((domain) => (
                        <SelectItem key={domain._id} value={domain.label}>
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
                      value={description}
                      onChange={(e) => setDescription(e.target.value)} // Changed: Set description state
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      placeholder="  Describe the talent..."
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
                      value={experience}
                      onChange={(e) => setExperience(e.target.value)} // Changed: Set experience state
                      className="mt-1 block w-full h-[30px] rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      placeholder="  Years of experience"
                    />
                  </div>
                  <Button onClick={handleAddDomain} className="mt-4">
                    Add Talent
                  </Button>
                </DialogContent>
              </Dialog>
            </div>
            <Tabs defaultValue="All" onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="All">All</TabsTrigger>
                <TabsTrigger value="Skills">Skills</TabsTrigger>
                <TabsTrigger value="Domain">Domain</TabsTrigger>
              </TabsList>
              <TabsContent value="All">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Label</TableHead>
                      <TableHead>Experience</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Activity</TableHead>
                      <TableHead>More</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredData.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell>{item.label}</TableCell>
                        <TableCell>{item.experience}</TableCell>
                        <TableCell>{item.status}</TableCell>
                        <TableCell>
                          <Switch />
                        </TableCell>
                        <TableCell>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button variant="outline">click</Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-80">
                              <div className="grid gap-4">
                                <div className="space-y-2">
                                  <h4 className="font-medium leading-none">
                                    Description
                                  </h4>
                                  <p className="text-sm text-muted-foreground">
                                    {item.description}
                                  </p>
                                </div>
                              </div>
                            </PopoverContent>
                          </Popover>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TabsContent>
              <TabsContent value="Skills">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Label</TableHead>
                      <TableHead>Experience</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Activity</TableHead>
                      <TableHead>More</TableHead>
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {filteredData.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell>{item.label}</TableCell>
                        <TableCell>{item.experience}</TableCell>
                        <TableCell>{item.status}</TableCell>
                        <TableCell>
                          <Switch />
                        </TableCell>
                        <TableCell>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button variant="outline">click</Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-80">
                              <div className="grid gap-4">
                                <div className="space-y-2">
                                  <h4 className="font-medium leading-none">
                                    Description
                                  </h4>
                                  <p className="text-sm text-muted-foreground">
                                    {item.description}
                                  </p>
                                </div>
                              </div>
                            </PopoverContent>
                          </Popover>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TabsContent>
              <TabsContent value="Domain">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Label</TableHead>
                      <TableHead>Experience</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Activity</TableHead>
                      <TableHead>More</TableHead>
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {filteredData.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell>{item.label}</TableCell>
                        <TableCell>{item.experience}</TableCell>
                        <TableCell>{item.status}</TableCell>
                        <TableCell>
                          <Switch />
                        </TableCell>
                        <TableCell>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button variant="outline">click</Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-80">
                              <div className="grid gap-4">
                                <div className="space-y-2">
                                  <h4 className="font-medium leading-none">
                                    Description
                                  </h4>
                                  <p className="text-sm text-muted-foreground">
                                    {item.description}
                                  </p>
                                </div>
                              </div>
                            </PopoverContent>
                          </Popover>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TabsContent>
            </Tabs>
          </div>
          <div className="sticky top-14 hidden flex-col gap-4 md:flex">
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
