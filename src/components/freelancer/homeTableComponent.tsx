import React, { useState } from 'react';
import { PackageOpen, ShieldCheck } from 'lucide-react';
import Link from 'next/link';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
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
  type: string;
}

const ProjectTableCard: React.FC<ProjectCardProps> = ({
  projects,
  loading,
  type,
}) => {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [expandedProjects, setExpandedProjects] = useState<Set<string>>(
    new Set(),
  );

  const shouldTruncate = (text: string) => text.length > 25;
  const truncateLength = 25;

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setSelectedProject(null);
    setExpandedProjects(new Set());
  };

  const handleDialogOpen = (project: Project) => {
    setSelectedProject(project);
    setIsDialogOpen(true);
  };

  return (
    <div className="bg-gray-50 min-h-screen">
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
              ) : projects.length > 0 ? (
                projects.map((project) => (
                  <TableRow key={project._id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">
                          {project.projectName}
                        </span>
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
                          <DialogContent
                            className="rounded-2xl 
             p-6 w-96 max-w-[90vw] mx-auto
             bg-white
             border border-white/50
             ring-4 ring-white/70
             shadow-[0_0_50px_rgba(255,255,255,0.8),0_0_80px_rgba(255,255,255,0.5)]
             hover:scale-105 transition-transform duration-300
             overflow-hidden"
                          >
                            <DialogHeader className="mb-4 text-center">
                              <DialogTitle className="text-lg font-semibold leading-tight flex items-center gap-2 justify-center">
                                <i className="fas fa-project-diagram"></i>
                                <span>Project Details</span>
                              </DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4 text-sm max-h-[60vh] overflow-y-auto">
                              <div className="flex justify-between">
                                <strong>Project Name :</strong>
                                <span>{selectedProject?.projectName}</span>
                              </div>
                              <div className="flex justify-between">
                                <strong>Company :</strong>
                                <span>{selectedProject?.companyName}</span>
                              </div>
                              <div className="flex items-start gap-2">
                                <strong className="flex-shrink-0">
                                  Description :
                                </strong>
                                <div className="text-sm text-gray-700 break-words flex-1 max-w-full overflow-hidden">
                                  {selectedProject?.description ? (
                                    shouldTruncate(
                                      selectedProject.description,
                                    ) &&
                                    !(
                                      selectedProject?._id &&
                                      expandedProjects.has(selectedProject._id)
                                    ) ? (
                                      <div className="w-full">
                                        <span className="inline-block max-w-full">
                                          {selectedProject.description.substring(
                                            0,
                                            truncateLength,
                                          )}
                                          ...
                                        </span>
                                        <button
                                          onClick={() => {
                                            if (selectedProject?._id) {
                                              const newExpanded = new Set(
                                                expandedProjects,
                                              );
                                              newExpanded.add(
                                                selectedProject._id,
                                              );
                                              setExpandedProjects(newExpanded);
                                            }
                                          }}
                                          className="ml-2 text-blue-500 cursor-pointer hover:text-blue-700"
                                        >
                                          See More
                                        </button>
                                      </div>
                                    ) : (
                                      <div className="w-full">
                                        <span className="inline-block max-w-full break-words">
                                          {selectedProject.description}
                                        </span>
                                        {shouldTruncate(
                                          selectedProject.description,
                                        ) && (
                                          <button
                                            onClick={() => {
                                              if (selectedProject?._id) {
                                                const newExpanded = new Set(
                                                  expandedProjects,
                                                );
                                                if (
                                                  newExpanded.has(
                                                    selectedProject._id,
                                                  )
                                                ) {
                                                  newExpanded.delete(
                                                    selectedProject._id,
                                                  );
                                                } else {
                                                  newExpanded.add(
                                                    selectedProject._id,
                                                  );
                                                }
                                                setExpandedProjects(
                                                  newExpanded,
                                                );
                                              }
                                            }}
                                            className="ml-2 text-blue-500 cursor-pointer hover:text-blue-700"
                                          >
                                            {selectedProject?._id &&
                                            expandedProjects.has(
                                              selectedProject._id,
                                            )
                                              ? 'See Less'
                                              : 'See More'}
                                          </button>
                                        )}
                                      </div>
                                    )
                                  ) : (
                                    'No description available'
                                  )}
                                </div>
                              </div>
                              <div className="flex items-start gap-2">
                                <strong className="flex-shrink-0">
                                  Skills Required :
                                </strong>
                                <span className="text-sm text-gray-700 break-words flex-1">
                                  {(selectedProject?.skillsRequired?.length ??
                                    0) > 0
                                    ? selectedProject?.skillsRequired.join(', ')
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
                        <Link href={`/project/${project._id}`}>
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
                    <PackageOpen className="mx-auto text-gray-500" size={100} />
                    <p className="text-gray-500">No projects available</p>
                  </td>
                </tr>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProjectTableCard;
