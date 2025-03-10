'use client';
import {
  BookMarked,
  CheckCircle2,
  ChevronDown,
  Filter,
  Search,
  XCircle,
} from 'lucide-react';
import React, { ReactNode, useState, useEffect } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import SidebarMenu from '@/components/menu/sidebarMenu'; // Adjust the import path as needed
import {
  ManageTalentMenu,
  menuItemsBottom,
  menuItemsTop,
} from '@/config/menuItems/business/dashboardMenuItems';

interface TalentLayoutProps {
  children: ReactNode;
  activeTab: string;
}

const TalentLayout: React.FC<TalentLayoutProps> = ({ children, activeTab }) => {
  const [activePage, setActivePage] = useState('Talent');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSkills, setSelectedSkills] = useState<Record<string, boolean>>(
    {},
  );
  const [selectedExp, setSelectedExp] = useState<Record<string, boolean>>({});
  const [location, setLocation] = useState('');
  const [isFiltered, setIsFiltered] = useState(false);

  // Initialize filters
  useEffect(() => {
    const skills = ['React', 'TypeScript', 'NextJS', 'UI/UX'];
    const exp = ['Junior', 'Mid-level', 'Senior', 'Lead'];

    const initialSkills: Record<string, boolean> = {};
    const initialExp: Record<string, boolean> = {};

    skills.forEach((skill) => {
      initialSkills[skill] = false;
    });
    exp.forEach((level) => {
      initialExp[level] = false;
    });

    setSelectedSkills(initialSkills);
    setSelectedExp(initialExp);
  }, []);

  // Handle skill toggle
  const handleSkillToggle = (skill: string) => {
    setSelectedSkills((prev) => ({
      ...prev,
      [skill]: !prev[skill],
    }));
  };

  // Handle experience toggle
  const handleExpToggle = (exp: string) => {
    setSelectedExp((prev) => ({
      ...prev,
      [exp]: !prev[exp],
    }));
  };

  // Apply filters
  const applyFilters = () => {
    setIsFiltered(true);
    // Here you would typically filter your data based on the selected criteria
  };

  // Reset filters
  const resetFilters = () => {
    setSearchQuery('');
    setLocation('');
    setIsFiltered(false);

    // Reset all skills to false
    const resetSkills: Record<string, boolean> = {};
    Object.keys(selectedSkills).forEach((skill) => {
      resetSkills[skill] = false;
    });
    setSelectedSkills(resetSkills);

    // Reset all experience levels to false
    const resetExp: Record<string, boolean> = {};
    Object.keys(selectedExp).forEach((exp) => {
      resetExp[exp] = false;
    });
    setSelectedExp(resetExp);
  };

  // Safely pass filter data to children
  const childrenWithProps = React.isValidElement(children)
    ? React.cloneElement(children, {
        filterData: {
          searchQuery,
          selectedSkills,
          selectedExp,
          location,
          isFiltered,
        },
      } as any)
    : children;

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Include the SidebarMenu component */}
      <SidebarMenu
        menuItemsTop={ManageTalentMenu}
        menuItemsBottom={menuItemsBottom}
        active={activePage}
        setActive={setActivePage} // Changed from setActive to onActiveChange
      />

      {/* Adjust main content to account for sidebar */}
      <div className="ml-14 flex flex-col min-h-screen">
        {/* Header */}
        <header className="border-b">
          <div className="container flex h-16 items-center justify-between px-4">
            <div className="flex items-center gap-4">
              <h1 className="text-xl font-bold">Talent Management</h1>
            </div>
            <div className="flex items-center gap-4">
              {/* Header actions can go here */}
            </div>
          </div>
        </header>

        {/* Main Navigation Tabs - Overview tab removed */}
        <div className="container px-4 py-4">
          <Tabs defaultValue={activeTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger
                value="invited"
                className="flex items-center gap-2"
                asChild
              >
                <a href="/business/market/invited">
                  <BookMarked className="h-4 w-4" />
                  <span>Invites</span>
                </a>
              </TabsTrigger>
              <TabsTrigger
                value="accepted"
                className="flex items-center gap-2"
                asChild
              >
                <a href="/business/market/accepted">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Accepted</span>
                </a>
              </TabsTrigger>
              <TabsTrigger
                value="rejected"
                className="flex items-center gap-2"
                asChild
              >
                <a href="/business/market/rejected">
                  <XCircle className="h-4 w-4" />
                  <span>Rejected</span>
                </a>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Main Content */}
        <div className="container flex-1 items-start px-4 py-6">
          <div className="grid grid-cols-12 gap-6">
            {/* Filters Sidebar */}
            <aside className="col-span-3">
              <Card className="sticky top-20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Filter className="h-4 w-4" />
                    Filters
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="search">Search</Label>
                    <div className="relative">
                      <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="search"
                        placeholder="Search by name, skills..."
                        className="pl-8"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <Label>Skills</Label>
                    <div className="space-y-1">
                      {Object.keys(selectedSkills).map((skill) => (
                        <div
                          key={skill}
                          className="flex items-center space-x-2"
                        >
                          <Switch
                            id={`skill-${skill}`}
                            checked={selectedSkills[skill]}
                            onCheckedChange={() => handleSkillToggle(skill)}
                          />
                          <Label
                            htmlFor={`skill-${skill}`}
                            className="font-normal"
                          >
                            {skill}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <Label>Experience</Label>
                    <div className="space-y-1">
                      {Object.keys(selectedExp).map((exp) => (
                        <div key={exp} className="flex items-center space-x-2">
                          <Switch
                            id={`exp-${exp}`}
                            checked={selectedExp[exp]}
                            onCheckedChange={() => handleExpToggle(exp)}
                          />
                          <Label htmlFor={`exp-${exp}`} className="font-normal">
                            {exp}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <Label>Location</Label>
                    <div className="relative">
                      <Input
                        placeholder="Select location"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                      />
                      <ChevronDown className="absolute right-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    </div>
                  </div>

                  <div className="flex justify-between pt-4">
                    <Button variant="outline" onClick={resetFilters}>
                      Reset
                    </Button>
                    <Button onClick={applyFilters}>Apply Filters</Button>
                  </div>
                </CardContent>
              </Card>
            </aside>

            {/* Profile Cards */}
            <div className="col-span-9">{childrenWithProps}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TalentLayout;
