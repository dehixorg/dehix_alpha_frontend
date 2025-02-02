import React, { useState } from 'react';
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
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { StatusEnum } from '@/utils/freelancer/enum';

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
  status?: StatusEnum;
  team?: string[];
  createdAt?: Date;
}

interface ProjectCardProps {
  projects: Project[];
  loading: boolean;
  type: string;
}

const ProjectTableCard: React.FC<ProjectCardProps> = ({
  projects,
  loading,
  type,
}) => {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const handleDialogClose = () => {
    setIsDialogOpen(false); // Close the dialog
    setSelectedProject(null); // Clear the selected project (optional)
  };

  const handleDialogOpen = (project: Project) => {
    setSelectedProject(project);

    setIsDialogOpen(true); // Open the dialog with the selected project
  };

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
                    <Skeleton className="h-8 w-24" />
                  </TableCell>
                  <TableCell className="text-center">
                    <Skeleton className="h-4 w-20" />
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
                    {type === 'rejected' || type === 'pending' ? (
                      <Dialog
                        open={isDialogOpen}
                        onOpenChange={(open) => setIsDialogOpen(open)}
                      >
                        <DialogTrigger asChild>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDialogOpen(project)}
                            className="border border-gray-300 rounded-lg px-4 py-2 transition-all duration-300 shadow-sm hover:shadow-md"
                          >
                            <span className="flex items-center gap-2">
                              <i className="fas fa-info-circle"></i>
                              <span>View Status</span>
                            </span>
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="rounded-lg shadow-md p-6 w-96 mx-auto border border-gray-200">
                          <DialogHeader className="mb-4 text-center">
                            <DialogTitle className="text-lg font-semibold leading-tight flex items-center gap-2 justify-center">
                              <i className="fas fa-project-diagram"></i>
                              <span>Project Details</span>
                            </DialogTitle>
                          </DialogHeader>
                          <div className="space-y-3 text-sm">
                            <div className="flex justify-between">
                              <strong>Project Name :</strong>
                              <span>{selectedProject?.projectName}</span>
                            </div>
                            <div className="flex justify-between">
                              <strong>Company :</strong>
                              <span>{selectedProject?.companyName}</span>
                            </div>
                            <div className="flex justify-between items-center gap-2">
                              <strong className="w-1/3">Description :</strong>
                              <p className="w-2/3">
                                {selectedProject?.description &&
                                selectedProject.description.length > 55 &&
                                !isExpanded ? (
                                  <span>
                                    {selectedProject?.description.substring(
                                      0,
                                      55,
                                    )}
                                    ...
                                    <button
                                      onClick={() => setIsExpanded(!isExpanded)}
                                      className="ml-2 text-blue-500 cursor-pointer"
                                    >
                                      See More
                                    </button>
                                  </span>
                                ) : (
                                  <span>
                                    {selectedProject?.description}
                                    {selectedProject?.description &&
                                      selectedProject.description.length >
                                        55 && (
                                        <button
                                          onClick={() =>
                                            setIsExpanded(!isExpanded)
                                          }
                                          className="ml-2 text-blue-500 cursor-pointer"
                                        >
                                          {isExpanded ? 'See Less' : 'See More'}
                                        </button>
                                      )}
                                  </span>
                                )}
                              </p>
                            </div>
                            <div className="flex justify-between">
                              <strong>Skills Required :</strong>
                              <span>
                                {selectedProject?.skillsRequired?.length ??
                                0 > 0
                                  ? selectedProject?.skillsRequired?.join(
                                      ', ',
                                    ) ?? 'Not specified'
                                  : 'Not specified'}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <strong>Status :</strong>
                              <span className="font-medium">
                                {selectedProject?.status}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <strong>Created :</strong>
                              <span>
                                {selectedProject?.createdAt
                                  ? new Date(
                                      selectedProject.createdAt,
                                    ).toLocaleDateString()
                                  : 'N/A'}
                              </span>
                            </div>
                          </div>
                          <div className="mt-6 flex justify-end">
                            <Button
                              className="border border-gray-400 rounded-lg px-4 py-2 transition-transform transform hover:scale-105 shadow-sm"
                              onClick={handleDialogClose}
                            >
                              Close
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    ) : (
                      <Link href={`/freelancer/project/${project._id}`}>
                        <Button size="sm" variant="outline">
                          View Details
                        </Button>
                      </Link>
                    )}
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
