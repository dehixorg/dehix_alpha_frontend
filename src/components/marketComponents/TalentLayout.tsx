'use client';
import {
  BookMarked,
  CheckCircle2,
  ChevronDown,
  Filter,
  Search,
  Users2,
  XCircle,
  Home,
  Settings,
  HelpCircle,
} from 'lucide-react';
import React, { ReactNode, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import SidebarMenu, { MenuItem } from '@/components/menu/sidebarMenu'; // Adjust the import path as needed
import {
  menuItemsBottom,
  menuItemsTop,
} from '@/config/menuItems/business/dashboardMenuItems';

interface TalentLayoutProps {
  children: ReactNode;
  activeTab: string;
}

const TalentLayout: React.FC<TalentLayoutProps> = ({ children, activeTab }) => {
  const [activePage, setActivePage] = useState('Talent');

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Include the SidebarMenu component */}
      <SidebarMenu
        menuItemsTop={menuItemsTop}
        menuItemsBottom={menuItemsBottom}
        active={activePage}
        setActive={setActivePage}
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

        {/* Main Navigation Tabs */}
        <div className="container px-4 py-4">
          <Tabs defaultValue={activeTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger
                value="overview"
                className="flex items-center gap-2"
                asChild
              >
                <a href="/business/talent">
                  <Users2 className="h-4 w-4" />
                  <span>Overview</span>
                </a>
              </TabsTrigger>
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
                      />
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <Label>Skills</Label>
                    <div className="space-y-1">
                      {['React', 'TypeScript', 'NextJS', 'UI/UX'].map(
                        (skill) => (
                          <div
                            key={skill}
                            className="flex items-center space-x-2"
                          >
                            <Switch id={`skill-${skill}`} />
                            <Label
                              htmlFor={`skill-${skill}`}
                              className="font-normal"
                            >
                              {skill}
                            </Label>
                          </div>
                        ),
                      )}
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <Label>Experience</Label>
                    <div className="space-y-1">
                      {['Junior', 'Mid-level', 'Senior', 'Lead'].map((exp) => (
                        <div key={exp} className="flex items-center space-x-2">
                          <Switch id={`exp-${exp}`} />
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
                      <Input placeholder="Select location" />
                      <ChevronDown className="absolute right-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    </div>
                  </div>

                  <div className="flex justify-between pt-4">
                    <Button variant="outline">Reset</Button>
                    <Button>Apply Filters</Button>
                  </div>
                </CardContent>
              </Card>
            </aside>

            {/* Profile Cards */}
            <div className="col-span-9">{children}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TalentLayout;
