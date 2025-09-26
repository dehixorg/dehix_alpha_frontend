'use client';
import {
  CheckCircle,
  PackageOpen,
  Plus,
  BarChart3,
  Activity,
  CalendarDays,
  Clock3,
  CalendarX2,
} from 'lucide-react';
import { useSelector } from 'react-redux';
import { useEffect, useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from 'recharts';

import SidebarMenu from '@/components/menu/sidebarMenu';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ProjectTypeDialog } from '@/components/dialogs/ProjectTypeDialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { RootState } from '@/lib/store';
import { ProjectCard } from '@/components/cards/projectCard';
import {
  menuItemsBottom,
  menuItemsTop,
} from '@/config/menuItems/business/dashboardMenuItems';
import { axiosInstance } from '@/lib/axiosinstance';
import { StatusEnum } from '@/utils/freelancer/enum';
import Header from '@/components/header/header';
import { toast } from '@/components/ui/use-toast';
import StatItem from '@/components/shared/StatItem';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

// Define the activity type
type Activity = {
  id: number;
  title: string;
  time: string;
  description: string;
};
export default function Dashboard() {
  const user = useSelector((state: RootState) => state.user);
  const [responseData, setResponseData] = useState<any>([]); // State to hold response data
  const [, setModalOpen] = useState(false);
  const [, setMode] = useState<'single' | 'multiple' | null>(null);
  useEffect(() => {
    const fetchData = async () => {
      try {
        if (user?.uid) {
          // Optional chaining to ensure `user` is defined
          const response = await axiosInstance.get(`/project/business`);

          setResponseData(response.data.data); // Store response data in state
        }
      } catch (error) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Something went wrong.Please try again.',
        }); // Error toast
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

  // Sample data for the chart
  const chartData = [
    { name: 'Jan', value: 65 },
    { name: 'Feb', value: 59 },
    { name: 'Mar', value: 80 },
    { name: 'Apr', value: 81 },
    { name: 'May', value: 56 },
    { name: 'Jun', value: 55 },
  ];

  // Sample activity data
  const activities: Activity[] = [
    {
      id: 1,
      title: 'Project Review',
      time: '10:30 AM',
      description: 'Review design mockups with the team',
    },
    {
      id: 2,
      title: 'Client Meeting',
      time: '2:00 PM',
      description: 'Weekly sync with ABC Corp',
    },
    {
      id: 3,
      title: 'Project Delivery',
      time: '4:45 PM',
      description: 'Deliver final assets to client',
    },
  ];

  return (
    <div className="flex min-h-screen w-full flex-col">
      <SidebarMenu
        menuItemsTop={menuItemsTop}
        menuItemsBottom={menuItemsBottom}
        active="Dashboard"
      />
      <div className="flex flex-col sm:gap-4 sm:py-0 sm:pl-14 mb-8">
        <Header
          menuItemsTop={menuItemsTop}
          menuItemsBottom={menuItemsBottom}
          activeMenu="Dashboard"
          breadcrumbItems={[{ label: 'Dashboard', link: '#' }]}
        />

        <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-2 md:gap-8 lg:grid-cols-3">
          {/* Left Column */}
          <div className="grid auto-rows-max items-start gap-4 md:gap-6 lg:col-span-2">
            {/* Welcome Card */}
            <Card className="bg-gradient-to-r from-primary/5 to-background shadow-sm">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="text-2xl font-bold tracking-tight">
                      Welcome Back,{' '}
                      {user?.displayName
                        ? user.displayName
                            .split(' ')
                            .map(
                              (word) =>
                                word.charAt(0).toUpperCase() +
                                word.slice(1).toLowerCase(),
                            )
                            .join(' ')
                        : 'User'}
                      !
                    </CardTitle>
                    <CardDescription>
                      Here&lsquo;s what&lsquo;s happening with your projects
                      today.
                    </CardDescription>
                  </div>
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={user?.photoURL || ''} alt={user?.name} />
                    <AvatarFallback>
                      {user?.name?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                </div>
              </CardHeader>
              <CardFooter className="flex flex-col gap-2">
                <div className="flex items-center justify-between w-full text-xs uppercase">
                  <span>Project Completion</span>
                  <span className="font-medium">
                    {responseData.length > 0
                      ? Math.round(
                          (completedProjects.length / responseData.length) *
                            100,
                        )
                      : 0}
                    %
                  </span>
                </div>
                {(() => {
                  const completionPercentage =
                    responseData.length > 0
                      ? Math.round(
                          (completedProjects.length / responseData.length) *
                            100,
                        )
                      : 0;
                  const completionColor =
                    completionPercentage >= 70
                      ? '[&>*]:bg-green-500'
                      : completionPercentage >= 30
                        ? '[&>*]:bg-amber-500'
                        : '[&>*]:bg-red-500';

                  return (
                    <Progress
                      value={completionPercentage}
                      className={cn('h-1 w-full', completionColor)}
                    />
                  );
                })()}
              </CardFooter>
            </Card>

            {/* Stats Grid */}
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
              <StatItem
                variant="card"
                color="blue"
                icon={<PackageOpen />}
                label="Total Projects"
                value={responseData.length}
              />

              <StatItem
                variant="card"
                color="green"
                icon={<CheckCircle />}
                label="Completed"
                value={completedProjects.length}
              />

              <StatItem
                variant="card"
                color="amber"
                icon={<Clock3 />}
                label="In Progress"
                value={pendingProjects.length}
              />
            </div>

            {/* Project Performance Chart */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Project Performance</CardTitle>
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm" className="h-8 gap-1">
                      <CalendarDays className="h-3.5 w-3.5" />
                      <span>This Month</span>
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="#f0f0f0"
                    />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} />
                    <YAxis axisLine={false} tickLine={false} />
                    <Tooltip
                      wrapperStyle={{ outline: 'none' }}
                      contentStyle={{
                        background: 'hsl(var(--popover))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: 6,
                        color: 'hsl(var(--popover-foreground))',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                      }}
                      labelStyle={{
                        color: 'hsl(var(--popover-foreground))',
                        fontWeight: 600,
                      }}
                      cursor={{ fill: 'hsl(var(--muted))', fillOpacity: 0.2 }}
                    />
                    <Bar
                      dataKey="value"
                      barSize={12}
                      fill="hsl(var(--primary))"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            {/* Projects Section */}
            <Tabs defaultValue="current" className="w-full">
              <div className="flex items-center justify-between">
                <TabsList>
                  <TabsTrigger value="current">Current Projects</TabsTrigger>
                  <TabsTrigger value="completed">Completed</TabsTrigger>
                </TabsList>
                <ProjectTypeDialog
                  onOpenChange={(isOpen) => {
                    setModalOpen(isOpen);
                    if (!isOpen) setMode(null);
                  }}
                />
              </div>

              <TabsContent value="current" className="mt-4">
                {pendingProjects.length > 0 ? (
                  <div className="grid gap-4 md:grid-cols-2">
                    {pendingProjects.map((project: any, index: number) => (
                      <ProjectCard key={index} project={project} />
                    ))}
                  </div>
                ) : (
                  <Card className="border-dashed">
                    <CardContent className="flex flex-col items-center justify-center py-12">
                      <PackageOpen className="h-12 w-12 text-muted-foreground mb-4" />
                      <h3 className="text-lg font-medium mb-2">
                        No active projects
                      </h3>
                      <p className="text-sm text-muted-foreground mb-4 text-center">
                        Get started by creating a new project
                      </p>
                      <ProjectTypeDialog
                        onOpenChange={setModalOpen}
                        trigger={
                          <Button size="sm">
                            <Plus className="h-4 w-4 mr-2" />
                            New Project
                          </Button>
                        }
                      />
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="completed" className="mt-4">
                {completedProjects.length > 0 ? (
                  <div className="grid gap-4 md:grid-cols-2">
                    {completedProjects.map((project: any, index: number) => (
                      <ProjectCard key={index} project={project} />
                    ))}
                  </div>
                ) : (
                  <Card className="border-dashed">
                    <CardContent className="flex flex-col items-center justify-center py-12">
                      <CheckCircle className="h-12 w-12 text-muted-foreground mb-4" />
                      <h3 className="text-lg font-medium mb-2">
                        No completed projects yet
                      </h3>
                      <p className="text-sm text-muted-foreground text-center">
                        Your completed projects will appear here
                      </p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            </Tabs>
          </div>
          {/* Right Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card className="bg-muted/20">
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <ProjectTypeDialog
                  onOpenChange={setModalOpen}
                  trigger={
                    <Button variant="outline" className="w-full justify-start">
                      <Plus className="mr-2 h-4 w-4" />
                      New Project
                    </Button>
                  }
                />
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  disabled
                >
                  <BarChart3 className="mr-2 h-4 w-4" />
                  View Reports
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  disabled
                >
                  <Activity className="mr-2 h-4 w-4" />
                  Activity Log
                </Button>
              </CardContent>
            </Card>

            {/* Upcoming Tasks */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Upcoming Tasks</CardTitle>
                  <Button variant="ghost" size="sm" className="h-8">
                    View All
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {activities.map((activity) => (
                    <div key={activity.id} className="flex items-start gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                        <CalendarDays className="h-4 w-4 text-primary" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{activity.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {activity.description}
                        </p>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {activity.time}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            <div className="text-center py-10 w-full">
              <CalendarX2 className="mx-auto mb-2 text-gray-500" size="100" />
              <p className="text-gray-500">No interviews scheduled</p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
