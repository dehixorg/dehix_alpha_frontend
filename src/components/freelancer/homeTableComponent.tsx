// src/ProjectCard.tsx
import React from 'react';
import { PackageOpen } from 'lucide-react';
import Link from 'next/link';

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

interface Project {
  _id: string;
  projectName: string;
  description: string;
  email: string;
  verified?: any;
  isVerified?: string;
  companyName: string;
  start?: Date;
  end?: Date;
  skillsRequired: string[];
  experience?: string;
  role: string;
  projectType: string;
  totalNeedOfFreelancer?: {
    category?: string;
    needOfFreelancer?: number;
    appliedCandidates?: string[];
    rejected?: string[];
    accepted?: string[];
    status?: string;
  }[];
  status?: string;
  team?: string[];
}

interface ProjectCardProps {
  projects: Project[];
}
const getStatusBadge = (status: string | undefined) => {
  switch (status?.toLowerCase()) {
    case 'active':
      return { text: 'ACTIVE', className: 'bg-blue-500 hover:bg-blue-600' };
    case 'pending':
      return { text: 'PENDING', className: 'bg-warning hover:bg-warning' };
    case 'completed':
      return { text: 'COMPLETED', className: 'bg-success hover:bg-success' };
    case 'rejected':
      return { text: 'REJECTED', className: 'bg-red-500 hover:bg-red-600' };
    default:
      return { text: 'UNKNOWN', className: 'bg-gray-500 hover:bg-gray-600' };
  }
};
const ProjectTableCard: React.FC<ProjectCardProps> = ({ projects }) => {
  return (
    <Card>
      <CardHeader className="px-7">
        <CardTitle>Projects</CardTitle>
        <CardDescription>Recent projects from your account.</CardDescription>
      </CardHeader>
      <CardContent>
        {projects.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Project Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Verification</TableHead>
                <TableHead className="text-center">Start Date</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {projects.map((project) => (
                <TableRow key={project._id}>
                  <TableCell>
                    <div className="font-medium">{project.projectName}</div>
                  </TableCell>
                  <TableCell>{project.projectType}</TableCell>
                  <TableCell>
                    <Badge
                      className="text-xs"
                      variant={project.verified ? 'secondary' : 'outline'}
                    >
                      {project.verified ? 'Verified' : 'Not Verified'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {project.start
                      ? new Date(project.start).toLocaleDateString()
                      : 'N/A'}
                  </TableCell>

                  <TableCell>
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
                    <Link href={`/project/${project._id}`}>
                      <Button size="sm" variant="outline">
                        View Details
                      </Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="text-center py-10">
            <PackageOpen className="mx-auto text-gray-500" size="100" />
            <p className="text-gray-500">No projects available</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ProjectTableCard;
