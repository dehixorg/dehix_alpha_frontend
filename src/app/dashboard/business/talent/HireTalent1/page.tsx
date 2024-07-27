'use client';
// eslint-disable-next-line import/order
import React, { useEffect, useState } from 'react'; // Import 'react' first

// Lucid icons
// eslint-disable-next-line import/order
import {
  Boxes,
  Eye,
  FilePenLine,
  Home,
  Lightbulb,
  LineChart,
  ListFilter,
  Package,
  Plus,
  Search,
  Settings,
  Trash2,
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
  DialogFooter,
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  menuItemsBottom,
  menuItemsTop,
} from '@/config/menuItems/business/dashboardMenuItems';
// Menu components
import SidebarMenu, { MenuItem } from '@/components/menu/sidebarMenu';
import DropdownProfile from '@/components/shared/DropdownProfile';
import CollapsibleSidebarMenu from '@/components/menu/collapsibleSidebarMenu';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import InterviewCard from '@/components/shared/interviewCard';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { axiosInstance } from '@/lib/axiosinstance';
import { TabsContent } from '@radix-ui/react-tabs';
import { Switch } from "@/components/ui/switch"
import { Label } from '@radix-ui/react-label';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Textarea } from "@/components/ui/textarea";

import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

new Date('2023-11-23T10:30:00Z');

interface Skill {
  _id: string;
  label: string;
}

interface Domain {
  _id: string;
  label: string;
}

interface DomainData {
  domainName: string;
  experience: string;
  status: string;
  visible: string;
}

interface SkillData {
  skillName: string;
  experience: string;
  status: string;
  visible: string;
}

const sampleInterview = {
  interviewer: 'John Doe',
  interviewee: 'Jane Smith',
  skill: 'React Development',
  interviewDate: new Date('2023-11-23T10:30:00Z'),
  rating: 4.5,
  comments: 'Great communication skills and technical expertise.',
};

const domainDummyData:DomainData[] = [
  {
    domainName: "Frontend Development",
    experience: "5 years",
    status: "Added",
    visible: "Inactive",
  },
  {
    domainName: "Backend Development",
    experience: "3 years",
    status: "Added",
    visible: "Inactive",
  }
];
const skillDummyData:SkillData[] = [
  {
    skillName: "JavaScript",
    experience: "4 years",
    status: "Added",
    visible: "Inactive",
  },
  {
    skillName: "React",
    experience: "2 years",
    status: "Added",
    visible: "Inactive",
  }
];

const skillFormSchema = z.object({
  skillName: z.string({
    required_error: "Skill must be selected"
  }),
  description: z.string({
    required_error: "Description Must be Added"
  }),
  experience: z.string({
    required_error: "Description Must be Added"
  })
})

const domainFormSchema = z.object({
  domainName: z.string({
    required_error: "Skill must be selected"
  }),
  description: z.string({
    required_error: "Description Must be Added"
  }),
  experience: z.string({
    required_error: "Description Must be Added"
  })
})

export default function Dashboard() {
  const skillForm = useForm<z.infer<typeof skillFormSchema>>({
    resolver: zodResolver(skillFormSchema),
  });
  function onSkillSubmit(values: z.infer<typeof skillFormSchema>) {
    console.log(values);
    skillForm.reset();
  }

  const domainForm = useForm<z.infer<typeof domainFormSchema>>({
    resolver: zodResolver(domainFormSchema),
  });
  function onDomainSubmit(values: z.infer<typeof domainFormSchema>) {
    console.log(values);
    domainForm.reset();
  }

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

  const [domainVisibility, setDomainVisibility] = useState(domainDummyData);
  const [selectedDomain, setSelectedDomain] = useState<DomainData | null>(null);
  const handleDomainToggle = (index: number) => {
    console.log('Before Toggle:', domainVisibility); // Debugging line
    setDomainVisibility(prevDomainVisibility => {
      const updatedDomainVisibility = prevDomainVisibility.map((item, i) =>
        i === index ? { ...item, visible: item.visible === 'Active' ? 'Inactive' : 'Active' } : item
      );
      console.log('After Toggle:', updatedDomainVisibility); // Debugging line
      return updatedDomainVisibility;
    });
  };
  const handleViewDomain = (index:number) => {
    setSelectedDomain(domainVisibility[index]);
  };
  useEffect(() => {
    console.log(selectedDomain);
  }, [selectedDomain]);
  const handleDeleteDomain = (index: number) => {
    console.log('Before Deletion:', domainVisibility); // Debugging line
    setDomainVisibility(prevDomainVisibility => {
      const updatedDomainVisibility = prevDomainVisibility.filter((_, i) => i !== index);
      console.log('After Deletion:', updatedDomainVisibility); // Debugging line
      return updatedDomainVisibility;
    });
  };

  const [skillVisibility, setSkillVisibility] = useState(skillDummyData);
  const [selectedSkill, setSelectedSkill] = useState<SkillData | null>(null);
  const handleSkillToggle = (index: number) => {
    console.log('Before Toggle:', skillVisibility); // Debugging line
    setSkillVisibility(prevSkillVisibility => {
      const updatedSkillVisibility = prevSkillVisibility.map((item, i) =>
        i === index ? { ...item, visible: item.visible === 'Active' ? 'Inactive' : 'Active' } : item
      );
      console.log('After Toggle:', updatedSkillVisibility); // Debugging line
      return updatedSkillVisibility;
    });
  };
  const handleViewSkill = (index:number) => {
    setSelectedSkill(skillVisibility[index]);
  };
  useEffect(() => {
    console.log(selectedSkill);
  }, [selectedSkill]);
  const handleDeleteSkill = (index: number) => {
    console.log('Before Deletion:', skillVisibility); // Debugging line
    setSkillVisibility(prevSkillVisibility => {
      const updatedSkillVisibility = prevSkillVisibility.filter((_, i) => i !== index);
      console.log('After Deletion:', updatedSkillVisibility); // Debugging line
      return updatedSkillVisibility;
    });
  };

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
              <h2 className="text-2xl font-semibold">Get Talent</h2>

              <Dialog>
                <DialogTrigger asChild>
                  <Button className="w-full sm:w-auto mr-2 mt-4">
                    <Plus className="mr-1 h-4 w-4" /> Get Talent by Skill
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Get Talent by Skill</DialogTitle>
                    <DialogDescription>
                      Select your Skill, Description, and Experience.
                    </DialogDescription>
                  </DialogHeader>

                  <Form {...skillForm}>
                    <form onSubmit={skillForm.handleSubmit(onSkillSubmit)} className="space-y-8">
                        <FormField
                          control={skillForm.control}
                          name="skillName"
                          render={({  field: { onChange, value, }}) => (
                            <FormItem>
                              <FormLabel>Skill</FormLabel>
                              <FormControl>
                                <Select onValueChange={onChange} value={value}>
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
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={skillForm.control}
                          name="description"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Description</FormLabel>
                              <FormControl>
                                <Textarea placeholder="Describe the talent..." {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={skillForm.control}
                          name="experience"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Experience</FormLabel>
                              <FormControl>
                                <Input placeholder="Years of experience" {...field} type='number'/>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <Button type="submit" className='w-full'>Get Talent by Skill</Button>
                      </form>
                  </Form>
                </DialogContent>
              </Dialog>

              <Dialog>
                <DialogTrigger asChild>
                  <Button className="w-full sm:w-auto mr-2 mt-2">
                    <Plus className="mr-1 h-4 w-4" /> Get Talent by Domain
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Get Talent by Domain</DialogTitle>
                    <DialogDescription>
                      Select your Domain, Description, and Experience.
                    </DialogDescription>
                  </DialogHeader>

                  <Form {...domainForm}>
                    <form onSubmit={domainForm.handleSubmit(onDomainSubmit)} className="space-y-8">
                        <FormField
                          control={domainForm.control}
                          name="domainName"
                          render={({  field: { onChange, value, }}) => (
                            <FormItem>
                              <FormLabel>Domain</FormLabel>
                              <FormControl>
                                <Select onValueChange={onChange} value={value}>
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
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={domainForm.control}
                          name="description"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Description</FormLabel>
                              <FormControl>
                                <Textarea placeholder="Describe the talent..." {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={domainForm.control}
                          name="experience"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Experience</FormLabel>
                              <FormControl>
                                <Input placeholder="Years of experience" {...field} type='number'/>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <Button type="submit" className='w-full'>Get Talent By Domain</Button>
                      </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          <div className="grid auto-rows-max items-start gap-4 md:gap-8 lg:col-span-2 -mt-2">
            <div className="">
                <Tabs defaultValue="Domain">
                  <div className="w-fit">
                    <TabsList className="flex items-center space-x-4">
                      <TabsTrigger value="Domain">Domain</TabsTrigger>
                      <TabsTrigger value="Skills">Skills</TabsTrigger>
                    </TabsList>
                  </div>

                  <TabsContent value="Domain">
                    <div className='mt-6 w-[397px] md:w-full lg:w-full'>
                      <Card className="sm:col-span-2 flex flex-col h-full">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-2xl mb-3">Domain</CardTitle>
                        </CardHeader>

                        <CardContent>
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Domain Name</TableHead>
                                <TableHead>Experience</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Visible</TableHead>
                                <TableHead>More</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {domainVisibility.map((item, index) => (
                                <TableRow key={index} className="bg-muted/20">
                                  <TableCell>
                                    {item.domainName}
                                  </TableCell>

                                  <TableCell>
                                    {item.experience}
                                  </TableCell>

                                  <TableCell>
                                    {item.status}
                                  </TableCell>

                                  <TableCell>
                                    <div className="flex items-center space-x-2">
                                      <Switch id="domainStatus" onClick={() => handleDomainToggle(index)}/>
                                      <Label htmlFor="domainStatus">{item.visible === 'Active' ? 'Active' : 'Inactive'}</Label>
                                    </div>
                                  </TableCell>

                                  <TableCell>
                                    <div className="flex items-center space-x-2">
                                      <Dialog>
                                        <DialogTrigger asChild>
                                          <Button variant="outline" className='hover:text-blue-500' onClick={() => handleViewDomain(index)}>
                                            <Eye />
                                          </Button>
                                        </DialogTrigger>

                                        <DialogContent className="sm:max-w-[425px]">
                                          <DialogHeader>
                                            <DialogTitle>Talent by Domain</DialogTitle>
                                            <DialogDescription>
                                              Talent Summary
                                            </DialogDescription>
                                          </DialogHeader>
                                          <div className="grid gap-4 py-4">
                                            <div className="grid grid-cols-4 items-center gap-24">
                                                <Label htmlFor="name" className="text-nowrap">
                                                  Domain Name:
                                                </Label>
                                                <div className="col-span-3">{selectedDomain?.domainName}</div>
                                              </div>
                                              <div className="grid grid-cols-4 items-center gap-24">
                                                <Label htmlFor="description" className="text-nowrap">
                                                  Description:
                                                </Label>
                                                <div className="col-span-3">{selectedDomain?.experience}</div>
                                              </div>
                                              <div className="grid grid-cols-4 items-center gap-24">
                                                <Label htmlFor="visibility" className="text-nowrap">
                                                  Status:
                                                </Label>
                                                <div className="col-span-3">{selectedDomain?.status}</div>
                                              </div>
                                          </div>
                                          <DialogFooter>
                                            <Button>
                                              <div className="flex items-center space-x-2">
                                                <FilePenLine />
                                                <Label htmlFor='edit'>Edit</Label>
                                              </div>
                                            </Button>
                                          </DialogFooter>
                                        </DialogContent>
                                      </Dialog>

                                      <TooltipProvider>
                                        <Tooltip>
                                          <TooltipTrigger asChild>
                                            <Button variant="outline" className='hover:text-red-500' onClick={() => handleDeleteDomain(index)}>
                                              <Trash2 />
                                            </Button>
                                          </TooltipTrigger>
                                          <TooltipContent>
                                            <p>Delete Domain</p>
                                          </TooltipContent>
                                        </Tooltip>
                                      </TooltipProvider>
                                    </div>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </CardContent>
                        <CardFooter className=" grid gap-4 grid-cols-4"></CardFooter>
                      </Card>
                    </div>
                  </TabsContent>

                  <TabsContent value='Skills'>
                    <div className='mt-6 w-[397px] md:w-full lg:w-full'>
                      <Card className="sm:col-span-2 flex flex-col h-full">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-2xl mb-3">Skills</CardTitle>
                        </CardHeader>

                        <CardContent>
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Skill Name</TableHead>
                                <TableHead>Experience</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Visible</TableHead>
                                <TableHead>More</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {skillVisibility.map((item, index) => (
                                <TableRow key={index} className="bg-muted/25">
                                  <TableCell>
                                    {item.skillName}
                                  </TableCell>
                                  <TableCell>
                                    {item.experience}
                                  </TableCell>
                                  <TableCell>
                                    {item.status}
                                  </TableCell>
                                  <TableCell>
                                    <div className="flex items-center space-x-2">
                                      <Switch id="skillStatus" onClick={() => handleSkillToggle(index)}/>
                                      <Label htmlFor="skillStatus">{item.visible === 'Active' ? 'Active' : 'Inactive'}</Label>
                                    </div>
                                  </TableCell>
                                  <TableCell>
                                    <div className="flex items-center space-x-2">
                                      <Dialog>
                                        <DialogTrigger asChild>
                                          <Button variant="outline" className='hover:text-blue-500' onClick={() => handleViewSkill(index)}>
                                            <Eye />
                                          </Button>
                                        </DialogTrigger>

                                        <DialogContent className="sm:max-w-[425px]">
                                          <DialogHeader>
                                            <DialogTitle>Talent by Skill</DialogTitle>
                                            <DialogDescription>
                                              Talent Summary
                                            </DialogDescription>
                                          </DialogHeader>
                                          <div className="grid gap-4 py-4">
                                            <div className="grid grid-cols-4 items-center gap-10">
                                                <Label htmlFor="name" className="text-nowrap">
                                                  Skill Name:
                                                </Label>
                                                <div className="col-span-3">{selectedSkill?.skillName}</div>
                                              </div>
                                              <div className="grid grid-cols-4 items-center gap-10">
                                                <Label htmlFor="description" className="text-nowrap">
                                                  Description:
                                                </Label>
                                                <div className="col-span-3">{selectedSkill?.experience}</div>
                                              </div>
                                              <div className="grid grid-cols-4 items-center gap-10">
                                                <Label htmlFor="visibility" className="text-nowrap">
                                                  Status:
                                                </Label>
                                                <div className="col-span-3">{selectedSkill?.status}</div>
                                              </div>
                                          </div>
                                          <DialogFooter>
                                            <Button>
                                              <div className="flex items-center space-x-2">
                                                <FilePenLine />
                                                <Label htmlFor='edit'>Edit</Label>
                                              </div>
                                            </Button>
                                          </DialogFooter>
                                        </DialogContent>
                                      </Dialog>

                                      <TooltipProvider>
                                        <Tooltip>
                                          <TooltipTrigger asChild>
                                            <Button variant="outline" className='hover:text-red-500' onClick={() => handleDeleteSkill(index)}>
                                              <Trash2 />
                                            </Button>
                                          </TooltipTrigger>
                                          <TooltipContent>
                                            <p>Delete Skill</p>
                                          </TooltipContent>
                                        </Tooltip>
                                      </TooltipProvider>
                                    </div>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </CardContent>
                        <CardFooter className=" grid gap-4 grid-cols-4"></CardFooter>
                      </Card>
                    </div>
                  </TabsContent>
                </Tabs>
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
