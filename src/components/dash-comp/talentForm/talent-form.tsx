import React, { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import Select from 'react-select'; // Import react-select without Styles (not needed)

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { toast } from '@/components/ui/use-toast';
import { axiosInstance } from '@/lib/axiosinstance';

const skillsOptions = [
  { value: 'Python', label: 'Python' },
  { value: 'JavaScript', label: 'JavaScript' },
  { value: 'React', label: 'React' },
  { value: 'Node.js', label: 'Node.js' },
  { value: 'TypeScript', label: 'TypeScript' },
  { value: 'Java', label: 'Java' },
  { value: 'Spring Boot', label: 'Spring Boot' },
  { value: 'PHP', label: 'PHP' },
  { value: 'HTML', label: 'HTML' },
  { value: 'CSS', label: 'CSS' },
  { value: 'Angular', label: 'Angular' },
  { value: 'Vue.js', label: 'Vue.js' },
  { value: 'Express.js', label: 'Express.js' },
  { value: 'MongoDB', label: 'MongoDB' },
  { value: 'MySQL', label: 'MySQL' },
  { value: 'PostgreSQL', label: 'PostgreSQL' },
  { value: 'SQLite', label: 'SQLite' },
  { value: 'Firebase', label: 'Firebase' },
  { value: 'AWS', label: 'AWS' },
  { value: 'Azure', label: 'Azure' },
  { value: 'Docker', label: 'Docker' },
  { value: 'Kubernetes', label: 'Kubernetes' },
  { value: 'Git', label: 'Git' },
  { value: 'Jenkins', label: 'Jenkins' },
  { value: 'CI/CD', label: 'CI/CD' },
  { value: 'RESTful API', label: 'RESTful API' },
  { value: 'GraphQL', label: 'GraphQL' },
  { value: 'Microservices', label: 'Microservices' },
  { value: 'Machine Learning', label: 'Machine Learning' },
  { value: 'Artificial Intelligence', label: 'Artificial Intelligence' },
  { value: 'Blockchain', label: 'Blockchain' },
  { value: 'Cybersecurity', label: 'Cybersecurity' },
  { value: 'UI/UX Design', label: 'UI/UX Design' },
  { value: 'Responsive Web Design', label: 'Responsive Web Design' },
  { value: 'Bootstrap', label: 'Bootstrap' },
  { value: 'Tailwind CSS', label: 'Tailwind CSS' },
  { value: 'Sass', label: 'Sass' },
  { value: 'Less', label: 'Less' },
  { value: 'WordPress', label: 'WordPress' },
  { value: 'Joomla', label: 'Joomla' },
  { value: 'Shopify', label: 'Shopify' },
  { value: 'Magento', label: 'Magento' },
  { value: 'React Native', label: 'React Native' },
  { value: 'Flutter', label: 'Flutter' },
  { value: 'Ionic', label: 'Ionic' },
  { value: 'Swift', label: 'Swift' },
  { value: 'Kotlin', label: 'Kotlin' },
  { value: 'C#', label: 'C#' },
  { value: 'ASP.NET', label: 'ASP.NET' },
  { value: 'Ruby', label: 'Ruby' },
  { value: 'Ruby on Rails', label: 'Ruby on Rails' },
  { value: 'Scala', label: 'Scala' },
  { value: 'Go', label: 'Go' },
  { value: 'Rust', label: 'Rust' },
  { value: 'Perl', label: 'Perl' },
  { value: 'C++', label: 'C++' },
  { value: 'Unity', label: 'Unity' },
  { value: 'Unreal Engine', label: 'Unreal Engine' },
  { value: 'Game Development', label: 'Game Development' },
  { value: 'AR/VR', label: 'AR/VR' },
  { value: 'IoT', label: 'IoT' },
  { value: 'Raspberry Pi', label: 'Raspberry Pi' },
  { value: 'Arduino', label: 'Arduino' },
  { value: 'Embedded Systems', label: 'Embedded Systems' },
  { value: 'Linux', label: 'Linux' },
  { value: 'Windows', label: 'Windows' },
  { value: 'MacOS', label: 'MacOS' },
  { value: 'Android', label: 'Android' },
  { value: 'iOS', label: 'iOS' },
  { value: 'Cross-Platform Development', label: 'Cross-Platform Development' },
  { value: 'Software Testing', label: 'Software Testing' },
  { value: 'Quality Assurance', label: 'Quality Assurance' },
  { value: 'DevOps', label: 'DevOps' },
  { value: 'Agile Methodologies', label: 'Agile Methodologies' },
  { value: 'Scrum', label: 'Scrum' },
  { value: 'Kanban', label: 'Kanban' },
  { value: 'Lean', label: 'Lean' },
  { value: 'Project Management', label: 'Project Management' },
  { value: 'Product Management', label: 'Product Management' },
  { value: 'Business Analysis', label: 'Business Analysis' },
  { value: 'Technical Writing', label: 'Technical Writing' },
  { value: 'Copywriting', label: 'Copywriting' },
  { value: 'Content Marketing', label: 'Content Marketing' },
  { value: 'SEO', label: 'SEO' },
  { value: 'SEM', label: 'SEM' },
  { value: 'Digital Marketing', label: 'Digital Marketing' },
  { value: 'Social Media Marketing', label: 'Social Media Marketing' },
  { value: 'Email Marketing', label: 'Email Marketing' },
  { value: 'Salesforce', label: 'Salesforce' },
  { value: 'ERP', label: 'ERP' },
  { value: 'CRM', label: 'CRM' },
  { value: 'Big Data', label: 'Big Data' },
  { value: 'Data Science', label: 'Data Science' },
  { value: 'Data Engineering', label: 'Data Engineering' },
  { value: 'Data Analytics', label: 'Data Analytics' },
  { value: 'Business Intelligence', label: 'Business Intelligence' },
  { value: 'Machine Learning', label: 'Machine Learning' },
  { value: 'Deep Learning', label: 'Deep Learning' },
  { value: 'Neural Networks', label: 'Neural Networks' },
  { value: 'Computer Vision', label: 'Computer Vision' },
  {
    value: 'Natural Language Processing',
    label: 'Natural Language Processing',
  },
  { value: 'Quantum Computing', label: 'Quantum Computing' },
];

const domainsOptions = [
  { value: 'frontend', label: 'Frontend' },
  { value: 'backend', label: 'Backend' },
  { value: 'database', label: 'Database' },
  { value: 'cloud-computing', label: 'Cloud Computing' },
  { value: 'mobile-development', label: 'Mobile Development' },
  { value: 'machine-learning', label: 'Machine Learning' },
  { value: 'data-science', label: 'Data Science' },
  { value: 'devops', label: 'DevOps' },
  { value: 'cybersecurity', label: 'Cybersecurity' },
  { value: 'ui-ux-design', label: 'UI/UX Design' },
  { value: 'networking', label: 'Networking' },
  { value: 'game-development', label: 'Game Development' },
  { value: 'e-commerce', label: 'E-commerce' },
  { value: 'social-media', label: 'Social Media' },
  { value: 'artificial-intelligence', label: 'Artificial Intelligence' },
  { value: 'blockchain', label: 'Blockchain' },
  { value: 'iot', label: 'IoT (Internet of Things)' },
  { value: 'big-data', label: 'Big Data' },
  { value: 'web-scraping', label: 'Web Scraping' },
  { value: 'embedded-systems', label: 'Embedded Systems' },
];
const talentFormSchema = z.object({
  skills: z.array(z.string()).min(1, 'At least one skill must be selected.'),
  domains: z.array(z.string()).min(1, 'At least one domain must be selected.'),
  experience: z.string().min(1, { message: 'Enter 0 if no Experience' }),
  monthlyPay: z.string().min(1, { message: 'Enter positive value ' }),
});

type TalentFormValues = z.infer<typeof talentFormSchema>;

export function TalentForm() {
  const form = useForm<TalentFormValues>({
    resolver: zodResolver(talentFormSchema),
    defaultValues: {
      skills: [],
      domains: [],
      experience: '',
      monthlyPay: '',
    },
    mode: 'all',
  });

  const [currentForm, setCurrentForm] = useState<'skills' | 'domains'>(
    'skills',
  ); // Default to skills form
  const [skillsData, setSkillsData] = useState<
    { data: TalentFormValues; active: boolean }[]
  >([]);
  const [domainsData, setDomainsData] = useState<
    { data: TalentFormValues; active: boolean }[]
  >([]);

  async function onSubmit(data: TalentFormValues) {
    try {
      let endpoint = '';
      if (currentForm === 'skills') {
        endpoint = '/talents/skills'; // Endpoint for skills
        setSkillsData((prevData) => [...prevData, { data, active: true }]);
      } else if (currentForm === 'domains') {
        endpoint = '/talents/domains'; // Endpoint for domains
        setDomainsData((prevData) => [...prevData, { data, active: true }]);
      }

      const response = await axiosInstance.post(endpoint, data);
      console.log('API Response:', response.data);

      toast({
        title: `${currentForm === 'skills' ? 'Skills' : 'Domains'} Added`,
        description: `The ${currentForm === 'skills' ? 'skills' : 'domains'} information has been successfully added.`,
      });

      // Reset the form fields
      form.reset();
    } catch (error) {
      console.error(
        `${currentForm === 'skills' ? 'Skills' : 'Domains'} API Error:`,
        error,
      );
      toast({
        variant: 'destructive',
        title: 'Error',
        description: `Failed to add ${currentForm === 'skills' ? 'skills' : 'domains'} information. Please try again later.`,
      });
    }
  }

  const switchToSkillsForm = () => {
    setCurrentForm('skills');
  };

  const switchToDomainsForm = () => {
    setCurrentForm('domains');
  };

  const toggleStatus = (index: number, type: 'skills' | 'domains') => {
    if (type === 'skills') {
      setSkillsData((prevData) =>
        prevData.map((item, idx) =>
          idx === index ? { ...item, active: !item.active } : item,
        ),
      );
    } else if (type === 'domains') {
      setDomainsData((prevData) =>
        prevData.map((item, idx) =>
          idx === index ? { ...item, active: !item.active } : item,
        ),
      );
    }
  };

  return (
    <div>
      <section>
        <Dialog>
          <DialogTrigger>
            <div className="flex space-x-4">
              <Button variant="outline" onClick={switchToSkillsForm}>
                Add Skills
              </Button>
              <Button variant="outline" onClick={switchToDomainsForm}>
                Add Domains
              </Button>
            </div>
          </DialogTrigger>

          <DialogContent className="lg:max-w-screen-lg overflow-y-scroll max-h-screen">
            <DialogHeader>
              <DialogTitle>Add Talent Information</DialogTitle>
              <DialogDescription>
                Fill in the details of your talent information below.
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              {currentForm === 'skills' && (
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-4"
                >
                  <FormField
                    control={form.control}
                    name="skills"
                    render={({ field }) => (
                      <div>
                        <FormLabel>Skills</FormLabel>
                        <FormControl>
                          <Select
                            className="text-black"
                            options={skillsOptions}
                            isMulti
                            {...field}
                            placeholder="Select skills"
                            value={form.getValues('skills').map((skill) => ({
                              value: skill,
                              label: skill,
                            }))}
                            onChange={(selectedOptions) => {
                              form.setValue(
                                'skills',
                                selectedOptions.map((option) => option.value),
                              );
                            }}
                          />
                        </FormControl>
                        <FormDescription>Select one skill</FormDescription>
                        <FormMessage></FormMessage>
                      </div>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="experience"
                    render={({ field }) => (
                      <div>
                        <FormLabel>Experience (years)</FormLabel>
                        <FormControl>
                          <Input {...field} style={{ width: '100%' }} />
                        </FormControl>
                        <FormDescription>Enter in years</FormDescription>
                        <FormMessage></FormMessage>
                      </div>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="monthlyPay"
                    render={({ field }) => (
                      <div>
                        <FormLabel>Monthly Pay</FormLabel>
                        <FormControl>
                          <Input {...field} style={{ width: '100%' }} />
                        </FormControl>
                        <FormDescription>Enter in USD</FormDescription>
                        <FormMessage>
                          {form.formState.errors?.monthlyPay?.message}
                        </FormMessage>
                      </div>
                    )}
                  />
                  <DialogFooter>
                    <Button
                      type="submit"
                      className="w-full bg-blue-500 text-white hover:bg-blue-700 transition duration-300"
                    >
                      Add Skills
                    </Button>
                  </DialogFooter>
                </form>
              )}
              {currentForm === 'domains' && (
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-4"
                >
                  <FormField
                    control={form.control}
                    name="domains"
                    render={({ field }) => (
                      <div>
                        <FormLabel>Domains</FormLabel>
                        <FormControl>
                          <Select
                            className="text-black"
                            options={domainsOptions}
                            isMulti
                            {...field}
                            placeholder="Select domains"
                            value={form.getValues('domains').map((domain) => ({
                              value: domain,
                              label: domain,
                            }))}
                            onChange={(selectedOptions) => {
                              form.setValue(
                                'domains',
                                selectedOptions.map((option) => option.value),
                              );
                            }}
                          />
                        </FormControl>
                        <FormDescription>Select one Domain</FormDescription>
                        <FormMessage></FormMessage>
                      </div>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="experience"
                    render={({ field }) => (
                      <div>
                        <FormLabel>Experience (years)</FormLabel>
                        <FormControl>
                          <Input {...field} style={{ width: '100%' }} />
                        </FormControl>
                        <FormDescription>Enter in years</FormDescription>
                        <FormMessage></FormMessage>
                      </div>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="monthlyPay"
                    render={({ field }) => (
                      <div>
                        <FormLabel>Monthly Pay</FormLabel>
                        <FormControl>
                          <Input {...field} style={{ width: '100%' }} />
                        </FormControl>
                        <FormDescription>Enter in USD</FormDescription>
                        <FormMessage></FormMessage>
                      </div>
                    )}
                  />
                  <DialogFooter>
                    <Button
                      type="submit"
                      className="w-full bg-blue-500 text-white hover:bg-blue-700 transition duration-300"
                    >
                      Add Domain
                    </Button>
                  </DialogFooter>
                </form>
              )}
            </Form>
          </DialogContent>
        </Dialog>
      </section>
      <section className="mt-5 mr-5">
        <Card>
          <CardHeader className="px-7">
            <CardTitle>Skill/Domain</CardTitle>
            <CardDescription>Your Skill/Domain</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Skill/Domain</TableHead>
                  <TableHead>Experience</TableHead>
                  <TableHead>Monthly pay</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {skillsData.map((data, index) => (
                  <TableRow key={index}>
                    <TableCell>{data.data.skills.join(', ')}</TableCell>
                    <TableCell>{data.data.experience}</TableCell>
                    <TableCell>{data.data.monthlyPay}</TableCell>
                    <TableCell>
                      <ToggleSwitch
                        isActive={data.active}
                        onToggle={() => toggleStatus(index, 'skills')}
                      />
                    </TableCell>
                  </TableRow>
                ))}
                {domainsData.map((data, index) => (
                  <TableRow key={index}>
                    <TableCell>{data.data.domains.join(', ')}</TableCell>
                    <TableCell>{data.data.experience}</TableCell>
                    <TableCell>{data.data.monthlyPay}</TableCell>
                    <TableCell>
                      <ToggleSwitch
                        isActive={data.active}
                        onToggle={() => toggleStatus(index, 'domains')}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

interface ToggleSwitchProps {
  isActive: boolean;
  onToggle: () => void;
}

function ToggleSwitch({ isActive, onToggle }: ToggleSwitchProps) {
  return (
    <div className="relative inline-block w-10 mr-2 align-middle select-none transition duration-200 ease-in">
      <input
        type="checkbox"
        name="toggle"
        id="toggle"
        className={`${
          isActive ? 'bg-blue-500' : 'bg-gray-200'
        } absolute block w-6 h-6 rounded-full appearance-none cursor-pointer`}
        onClick={onToggle}
      />
      <label
        htmlFor="toggle"
        className={`${
          isActive ? 'bg-blue-600' : 'bg-gray-300'
        } block overflow-hidden h-6 rounded-full cursor-pointer`}
      >
        T
      </label>
    </div>
  );
}
