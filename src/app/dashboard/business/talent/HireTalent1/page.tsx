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
  PackageOpen,
  Plus,
  Search,
  Settings,
  Trash2,
  Users2,
} from 'lucide-react';

// Shared components
// eslint-disable-next-line import/order
import { TabsContent } from '@radix-ui/react-tabs';
import { Label } from '@radix-ui/react-label';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

// UI components
import Breadcrumb from '@/components/shared/breadcrumbList';
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
import SidebarMenu from '@/components/menu/sidebarMenu';
import DropdownProfile from '@/components/shared/DropdownProfile';
import CollapsibleSidebarMenu from '@/components/menu/collapsibleSidebarMenu';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import InterviewCard from '@/components/shared/interviewCard';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { axiosInstance } from '@/lib/axiosinstance';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

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

const domainDummyData: DomainData[] = [
  {
    domainName: 'Frontend Development',
    experience: '5 years',
    status: 'Added',
    visible: 'Inactive',
  },
  {
    domainName: 'Backend Development',
    experience: '3 years',
    status: 'Added',
    visible: 'Inactive',
  },
];
const skillDummyData: SkillData[] = [
  {
    skillName: 'JavaScript',
    experience: '4 years',
    status: 'Added',
    visible: 'Inactive',
  },
  {
    skillName: 'React',
    experience: '2 years',
    status: 'Added',
    visible: 'Inactive',
  },
];

const skillFormSchema = z.object({
  skillName: z.string({
    required_error: 'Skill must be selected',
  }),
  description: z.string({
    required_error: 'Description Must be Added',
  }),
  experience: z.string({
    required_error: 'Experience Must be Added',
  }),
});
const editSkillFormSchema = z.object({
  skillName: z.string({
    required_error: 'Skill must be added',
  }),
  experience: z.string({
    required_error: 'Experience Must be Added',
  }),
  status: z.string({
    required_error: 'Status Must be Added',
  }),
});

const domainFormSchema = z.object({
  domainName: z.string({
    required_error: 'Domain must be selected',
  }),
  description: z.string({
    required_error: 'Description Must be Added',
  }),
  experience: z.string({
    required_error: 'Experience Must be Added',
  }),
});
const editDomainFormSchema = z.object({
  domainName: z.string({
    required_error: 'Domain must be Addde',
  }),
  experience: z.string({
    required_error: 'Experience Must be Added',
  }),
  status: z.string({
    required_error: 'Status Must be Added',
  }),
});

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
  const [experienceError, setExperienceError] = useState<string>('');
  const [descriptionError, setDescriptionError] = useState<string>('');

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

  const validateInputs = () => {
    let valid = true;
    const expNumber = Number(experience);

    if (isNaN(expNumber) || expNumber <= 0) {
      setExperienceError('Experience should be a non-negative number');
      valid = false;
    } else {
      setExperienceError('');
    }

    if (description.length <= 4) {
      setDescriptionError(
        'Description should be greater than or equal to 4 characters',
      );
      valid = false;
    } else {
      setDescriptionError('');
    }

    return valid;
  };

  const handleAddSkill = () => {
    if (selectedSkill && description && experience) {
      if (!validateInputs()) return;

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
      if (!validateInputs()) return;
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
                      Select your Skill, Description, and Experience. Select
                      your Skill, Description, and Experience.
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
                    {descriptionError && (
                      <p className="mt-1 text-sm text-red-600">
                        {descriptionError}
                      </p>
                    )}
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
                    {experienceError && (
                      <p className="text-red-500">{experienceError}</p>
                    )}
                  </div>
                  <Button onClick={handleAddSkill} className="mt-4">
                    Add Talent
                  </Button>
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
                    {descriptionError && (
                      <p className="text-red-500">{descriptionError}</p>
                    )}
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
                    {experienceError && (
                      <p className="text-red-500">{experienceError}</p>
                    )}
                  </div>
                  <Button onClick={handleAddDomain} className="mt-4">
                    Add Talent
                  </Button>
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
                  <div className="mt-6 w-[397px] md:w-full lg:w-full">
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
                                <TableCell>{item.domainName}</TableCell>

                                <TableCell>{item.experience}</TableCell>

                                <TableCell>{item.status}</TableCell>

                                <TableCell>
                                  <div className="flex items-center space-x-2">
                                    <Switch
                                      id="domainStatus"
                                      onClick={() => handleDomainToggle(index)}
                                    />
                                    <Label htmlFor="domainStatus">
                                      {item.visible === 'Active'
                                        ? 'Active'
                                        : 'Inactive'}
                                    </Label>
                                  </div>
                                </TableCell>

                                <TableCell>
                                  <div className="flex items-center space-x-2">
                                    <Dialog
                                      open={isViewDomain}
                                      onOpenChange={setIsViewDomain}
                                    >
                                      <DialogTrigger asChild>
                                        <Button
                                          variant="outline"
                                          className="hover:text-blue-500"
                                          onClick={() =>
                                            handleViewDomain(index)
                                          }
                                        >
                                          <Eye />
                                        </Button>
                                      </DialogTrigger>

                                      <DialogContent className="sm:max-w-[425px]">
                                        <DialogHeader>
                                          <DialogTitle>
                                            {isEditDomain
                                              ? 'Edit Talent by Domain'
                                              : 'Talent by Domain'}
                                          </DialogTitle>
                                          <DialogDescription>
                                            {isEditDomain
                                              ? 'Edit Talent Summary'
                                              : 'Talent Summary'}
                                          </DialogDescription>
                                        </DialogHeader>
                                        {isEditDomain ? (
                                          <Form {...editDomainForm}>
                                            <form
                                              onSubmit={editDomainForm.handleSubmit(
                                                handleSaveDomain,
                                              )}
                                              className="grid gap-4 py-4"
                                            >
                                              <FormField
                                                control={editDomainForm.control}
                                                name="domainName"
                                                render={({ field }) => (
                                                  <FormItem className="grid grid-cols-3 gap-4 items-center">
                                                    <FormLabel className="col-span-1">
                                                      Domain Name:
                                                    </FormLabel>
                                                    <FormControl className="col-span-2">
                                                      <Input
                                                        className="w-fit"
                                                        id="domainName"
                                                        defaultValue={
                                                          selectedDomain?.domainName
                                                        }
                                                        {...field}
                                                      />
                                                    </FormControl>
                                                    <FormMessage />
                                                  </FormItem>
                                                )}
                                              />

                                              <FormField
                                                control={editDomainForm.control}
                                                name="experience"
                                                render={({ field }) => (
                                                  <FormItem className="grid grid-cols-3 gap-4 items-center">
                                                    <FormLabel className="col-span-1">
                                                      Experience:
                                                    </FormLabel>
                                                    <FormControl className="col-span-2">
                                                      <Input
                                                        className="w-fit"
                                                        id="experience"
                                                        defaultValue={
                                                          selectedDomain?.experience
                                                        }
                                                        {...field}
                                                      />
                                                    </FormControl>
                                                    <FormMessage />
                                                  </FormItem>
                                                )}
                                              />

                                              <FormField
                                                control={editDomainForm.control}
                                                name="status"
                                                render={({ field }) => (
                                                  <FormItem className="grid grid-cols-3 gap-4 items-center">
                                                    <FormLabel className="col-span-1">
                                                      Status:
                                                    </FormLabel>
                                                    <FormControl className="col-span-2">
                                                      <Input
                                                        className="w-fit"
                                                        id="status"
                                                        defaultValue={
                                                          selectedDomain?.status
                                                        }
                                                        {...field}
                                                      />
                                                    </FormControl>
                                                    <FormMessage />
                                                  </FormItem>
                                                )}
                                              />

                                              <Button
                                                type="submit"
                                                className="w-full"
                                              >
                                                Save
                                              </Button>
                                            </form>
                                          </Form>
                                        ) : (
                                          <div className="grid gap-4 py-4">
                                            <div className="grid grid-cols-4 items-center gap-24">
                                              <Label
                                                htmlFor="name"
                                                className="text-nowrap"
                                              >
                                                Domain Name:
                                              </Label>
                                              <div className="col-span-3">
                                                {selectedDomain?.domainName}
                                              </div>
                                            </div>
                                            <div className="grid grid-cols-4 items-center gap-24">
                                              <Label
                                                htmlFor="description"
                                                className="text-nowrap"
                                              >
                                                Experience:
                                              </Label>
                                              <div className="col-span-3">
                                                {selectedDomain?.experience}
                                              </div>
                                            </div>
                                            <div className="grid grid-cols-4 items-center gap-24">
                                              <Label
                                                htmlFor="visibility"
                                                className="text-nowrap"
                                              >
                                                Status:
                                              </Label>
                                              <div className="col-span-3">
                                                {selectedDomain?.status}
                                              </div>
                                            </div>
                                          </div>
                                        )}
                                        <DialogFooter>
                                          {!isEditDomain && (
                                            <Button onClick={handleEditDomain}>
                                              <div className="flex items-center space-x-2">
                                                <FilePenLine />
                                                <Label htmlFor="edit">
                                                  Edit
                                                </Label>
                                              </div>
                                            </Button>
                                          )}
                                        </DialogFooter>
                                      </DialogContent>
                                    </Dialog>

                                    <TooltipProvider>
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <Button
                                            variant="outline"
                                            className="hover:text-red-500"
                                            onClick={() =>
                                              handleDeleteDomain(index)
                                            }
                                          >
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

                <TabsContent value="Skills">
                  <div className="mt-6 w-[397px] md:w-full lg:w-full">
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
                                <TableCell>{item.skillName}</TableCell>
                                <TableCell>{item.experience}</TableCell>
                                <TableCell>{item.status}</TableCell>
                                <TableCell>
                                  <div className="flex items-center space-x-2">
                                    <Switch
                                      id="skillStatus"
                                      onClick={() => handleSkillToggle(index)}
                                    />
                                    <Label htmlFor="skillStatus">
                                      {item.visible === 'Active'
                                        ? 'Active'
                                        : 'Inactive'}
                                    </Label>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center space-x-2">
                                    <Dialog
                                      open={isViewDomain}
                                      onOpenChange={setIsViewDomain}
                                    >
                                      <DialogTrigger asChild>
                                        <Button
                                          variant="outline"
                                          className="hover:text-blue-500"
                                          onClick={() => handleViewSkill(index)}
                                        >
                                          <Eye />
                                        </Button>
                                      </DialogTrigger>

                                      <DialogContent className="sm:max-w-[425px]">
                                        <DialogHeader>
                                          <DialogTitle>
                                            {isEditSkill
                                              ? 'Edit Talent by Skill'
                                              : 'Talent by Skill'}
                                          </DialogTitle>
                                          <DialogDescription>
                                            {isEditSkill
                                              ? 'Edit Talent Summary'
                                              : 'Talent Summary'}
                                          </DialogDescription>
                                        </DialogHeader>
                                        {isEditSkill ? (
                                          <Form {...editSkillForm}>
                                            <form
                                              onSubmit={editSkillForm.handleSubmit(
                                                handleSaveSkill,
                                              )}
                                              className="grid gap-4 py-4"
                                            >
                                              <FormField
                                                control={editSkillForm.control}
                                                name="skillName"
                                                render={({ field }) => (
                                                  <FormItem className="grid grid-cols-3 gap-4 items-center">
                                                    <FormLabel className="col-span-1">
                                                      Skill Name:
                                                    </FormLabel>
                                                    <FormControl className="col-span-2">
                                                      <Input
                                                        className="w-fit"
                                                        id="domainName"
                                                        defaultValue={
                                                          selectedSkill?.skillName
                                                        }
                                                        {...field}
                                                      />
                                                    </FormControl>
                                                    <FormMessage />
                                                  </FormItem>
                                                )}
                                              />

                                              <FormField
                                                control={editSkillForm.control}
                                                name="experience"
                                                render={({ field }) => (
                                                  <FormItem className="grid grid-cols-3 gap-4 items-center">
                                                    <FormLabel className="col-span-1">
                                                      Experience:
                                                    </FormLabel>
                                                    <FormControl className="col-span-2">
                                                      <Input
                                                        className="w-fit"
                                                        id="experience"
                                                        defaultValue={
                                                          selectedSkill?.experience
                                                        }
                                                        {...field}
                                                      />
                                                    </FormControl>
                                                    <FormMessage />
                                                  </FormItem>
                                                )}
                                              />

                                              <FormField
                                                control={editSkillForm.control}
                                                name="status"
                                                render={({ field }) => (
                                                  <FormItem className="grid grid-cols-3 gap-4 items-center">
                                                    <FormLabel className="col-span-1">
                                                      Status:
                                                    </FormLabel>
                                                    <FormControl className="col-span-2">
                                                      <Input
                                                        className="w-fit"
                                                        id="status"
                                                        defaultValue={
                                                          selectedSkill?.status
                                                        }
                                                        {...field}
                                                      />
                                                    </FormControl>
                                                    <FormMessage />
                                                  </FormItem>
                                                )}
                                              />

                                              <Button
                                                type="submit"
                                                className="w-full"
                                              >
                                                Save
                                              </Button>
                                            </form>
                                          </Form>
                                        ) : (
                                          <div className="grid gap-4 py-4">
                                            <div className="grid grid-cols-4 items-center gap-24">
                                              <Label
                                                htmlFor="name"
                                                className="text-nowrap"
                                              >
                                                Skill Name:
                                              </Label>
                                              <div className="col-span-3">
                                                {selectedSkill?.skillName}
                                              </div>
                                            </div>
                                            <div className="grid grid-cols-4 items-center gap-24">
                                              <Label
                                                htmlFor="description"
                                                className="text-nowrap"
                                              >
                                                Experience:
                                              </Label>
                                              <div className="col-span-3">
                                                {selectedSkill?.experience}
                                              </div>
                                            </div>
                                            <div className="grid grid-cols-4 items-center gap-24">
                                              <Label
                                                htmlFor="visibility"
                                                className="text-nowrap"
                                              >
                                                Status:
                                              </Label>
                                              <div className="col-span-3">
                                                {selectedSkill?.status}
                                              </div>
                                            </div>
                                          </div>
                                        )}
                                        <DialogFooter>
                                          {!isEditSkill && (
                                            <Button onClick={handleEditSkill}>
                                              <div className="flex items-center space-x-2">
                                                <FilePenLine />
                                                <Label htmlFor="edit">
                                                  Edit
                                                </Label>
                                              </div>
                                            </Button>
                                          )}
                                        </DialogFooter>
                                      </DialogContent>
                                    </Dialog>

                                    <TooltipProvider>
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <Button
                                            variant="outline"
                                            className="hover:text-red-500"
                                            onClick={() =>
                                              handleDeleteSkill(index)
                                            }
                                          >
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
        </main>
      </div>
    </div>
  );
}
