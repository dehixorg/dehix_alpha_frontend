// src/ProjectCard.tsx
import React from 'react';

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
  id: string;
  projectName: string;
  projectType: string;
  verified: boolean;
  start: string;
}

interface ProjectCardProps {
  projects: Project[];
}

const ProjectTableCard: React.FC<ProjectCardProps> = ({ projects }) => {
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
              <TableHead>Project Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Start Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {projects.map((project) => (
              <TableRow key={project.id}>
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
                  {new Date(project.start).toLocaleDateString()}
                </TableCell>
                <TableCell className="text-right">
                  <Button size="sm" variant="outline">
                    View Details
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default ProjectTableCard;
