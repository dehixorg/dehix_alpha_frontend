import React, { useState } from 'react';
import { PackageOpen, ShieldCheck } from 'lucide-react';
import Link from 'next/link';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { StatusEnum } from '@/utils/freelancer/enum';
import { getStatusBadge } from '@/utils/statusBadge';

interface Project {
  _id: string;
  projectName: string;
  projectDomain: string[];
  description: string;
  companyId: string;
  email: string;
  url?: { value: string }[];
  verified?: any;
  isVerified?: string;
  companyName: string;
  start?: Date;
  end?: Date;
  skillsRequired: string[];
  experience?: string;
  role?: string;
  projectType?: string;
  profiles?: {
    domain?: string;
    freelancersRequired?: string;
    skills?: string[];
    experience?: number;
    minConnect?: number;
    rate?: number;
    description?: string;
    domain_id: string;
    selectedFreelancer?: string[];
    freelancers?: {
      freelancerId: string;
      bidId: string;
    };
    totalBid?: string[];
  }[];
  status?: StatusEnum;
  team?: string[];
  createdAt?: Date;
}

interface ProjectCardProps {
  projects: Project[];
  loading: boolean;
}

const ProjectTableCard: React.FC<ProjectCardProps> = ({
  projects,
  loading,
}) => {
  const [currentTab, setCurrentTab] = useState<StatusEnum>(StatusEnum.ACTIVE);
  const getVisibleProjects = (tab: StatusEnum) =>
    projects.filter(
      (p) => String(p.status ?? '').toUpperCase() === tab.toUpperCase(),
    );

  const renderTable = (list: Project[]) => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="text-start">Project Name</TableHead>
          <TableHead className="text-center">Start Date</TableHead>
          <TableHead className="text-center">Status</TableHead>
          <TableHead className="text-center">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {loading ? (
          [...Array(3)].map((_, index) => (
            <TableRow key={index}>
              <TableCell>
                <Skeleton className="h-4 w-32" />
              </TableCell>
              <TableCell className="text-center">
                <Skeleton className="h-4 w-20" />
              </TableCell>
              <TableCell className="text-center">
                <Skeleton className="h-4 w-16" />
              </TableCell>
              <TableCell className="text-center">
                <Skeleton className="h-4 w-20" />
              </TableCell>
            </TableRow>
          ))
        ) : list.length > 0 ? (
          list.map((project) => (
            <TableRow key={project._id}>
              <TableCell>
                <div className="flex items-center gap-2">
                  <span className="font-medium">{project.projectName}</span>
                  {project.verified && (
                    <ShieldCheck className="h-4 w-4 text-green-500" />
                  )}
                </div>
              </TableCell>
              <TableCell className="text-center">
                {project.start
                  ? new Date(project.start).toLocaleDateString()
                  : project.createdAt
                    ? new Date(project.createdAt).toLocaleDateString()
                    : 'N/A'}
              </TableCell>
              <TableCell className="text-center">
                {project.status ? (
                  <Badge className={getStatusBadge(project.status).className}>
                    {getStatusBadge(project.status).text}
                  </Badge>
                ) : (
                  'N/A'
                )}
              </TableCell>
              <TableCell className="text-center">
                <Link href={`/freelancer/market/project/${project._id}/apply/`}>
                  <Button size="sm" variant="outline">
                    View Details
                  </Button>
                </Link>
              </TableCell>
            </TableRow>
          ))
        ) : (
          <tr>
            <td colSpan={4} className="text-center py-10">
              <PackageOpen className="mx-auto text-gray-500" size={100} />
              <p className="text-gray-500">No projects available</p>
            </td>
          </tr>
        )}
      </TableBody>
    </Table>
  );

  return (
    <div className="min-h-screen">
      <Card>
        <CardHeader className="px-7">
          <CardTitle>Projects</CardTitle>
          <CardDescription>Recent projects from your account.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Tabs
            value={currentTab}
            onValueChange={(v) => setCurrentTab(v as StatusEnum)}
          >
            <div className="border-b px-2 sm:px-6">
              <TabsList className="bg-transparent h-12 w-full md:w-auto p-0">
                <TabsTrigger
                  value={StatusEnum.ACTIVE}
                  className="relative h-12 px-4 rounded-none data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent"
                >
                  Active
                </TabsTrigger>
                <TabsTrigger
                  value={StatusEnum.PENDING}
                  className="relative h-12 px-4 rounded-none data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent"
                >
                  Pending
                </TabsTrigger>
                <TabsTrigger
                  value={StatusEnum.COMPLETED}
                  className="relative h-12 px-4 rounded-none data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent"
                >
                  Completed
                </TabsTrigger>
                <TabsTrigger
                  value={StatusEnum.REJECTED}
                  className="relative h-12 px-4 rounded-none data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:bg-transparent"
                >
                  Rejected
                </TabsTrigger>
              </TabsList>
            </div>

            {Object.values(StatusEnum).map((status) => (
              <TabsContent key={status} value={status} className="m-0">
                {renderTable(getVisibleProjects(status as StatusEnum))}
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};
export default ProjectTableCard;
