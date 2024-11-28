// src/ProjectCard.tsx
import React from 'react';
import { PackageOpen } from 'lucide-react';
import Link from 'next/link';

import { getStatusBadge } from '@/utils/statusBadge';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton'; // Import the Skeleton component from ShadUI

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
  end?: Date | null;
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
  status?: 'Active' | 'Pending' | 'Completed' | 'Rejected';
  team?: string[];
}

interface ProjectCardProps {
  projects: Project[];
  loading: boolean; // Add loading state
}

const ProjectTableCard: React.FC<ProjectCardProps> = ({
  projects,
  loading,
}) => {
  return (
    <Card>
      <CardHeader className="px-7">
        <CardTitle>Projects</CardTitle>
        <CardDescription>Recent projects from your account.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-start">Project Name</TableHead>
              <TableHead className="text-center">Verification</TableHead>
              <TableHead className="text-center">Start Date</TableHead>
              <TableHead className="text-center">Status</TableHead>
              <TableHead className="text-center">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              // Show skeleton rows when loading is true
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
                  <TableCell className="text-center">
                    <Skeleton className="h-4 w-20" />
                  </TableCell>
                  <TableCell className="text-center">
                    <Skeleton className="h-8 w-24" />
                  </TableCell>
                </TableRow>
              ))
            ) : projects.length > 0 ? (
              projects.map((project) => (
                <TableRow key={project._id}>
                  <TableCell>
                    <div className="font-medium">{project.projectName}</div>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge
                      className="text-xs"
                      variant={project.verified ? 'secondary' : 'outline'}
                    >
                      {project.verified ? 'Verified' : 'Not Verified'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    {project.start
                      ? new Date(project.start).toLocaleDateString()
                      : 'N/A'}
                  </TableCell>
                  <TableCell className="text-center">
                    {project.status ? (
                      <Badge
                        className={getStatusBadge(project.status).className}
                      >
                        {getStatusBadge(project.status).text}
                      </Badge>
                    ) : (
                      'N/A'
                    )}
                  </TableCell>
                  <TableCell className="text-center">
                    <Link href={`/freelancer/project/${project._id}`}>
                      <Button size="sm" variant="outline">
                        View Details
                      </Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="text-center py-10">
                  <PackageOpen className="mx-auto text-gray-500" size="100" />
                  <p className="text-gray-500">No projects available</p>
                </td>
              </tr>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default ProjectTableCard;
