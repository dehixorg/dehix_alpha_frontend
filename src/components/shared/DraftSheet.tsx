'use client';

import { useEffect, useState } from 'react';
import {
  Save,
  ExternalLink,
  Clock,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';

import ProjectDrawer from './ProjectDrawe';

import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { axiosInstance } from '@/lib/axiosinstance';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

type Profile = {
  _id: string;
  domain: string;
  freelancersRequired: string;
  experience: number;
  rate: number;
  description: string;
  totalBid: string[];
  freelancers: {
    freelancerId: string;
    bidId: string;
    _id: string;
  }[];
};

type ProjectDraft = {
  _id: string;
  projectName: string;
  description: string;
  companyName: string;
  email: string;
  status: string;
  skillsRequired?: string[];
  profiles: Profile[];
};

export function DraftSheet({
  open,
  setOpen,
}: {
  open: boolean;
  setOpen: (val: boolean) => void;
}) {
  const [projectData, setProjectData] = useState<ProjectDraft[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      fetchDraftProjects();
    }
  }, [open]);

  const fetchDraftProjects = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get('/freelancer/draft/detail');
      setProjectData(res.data?.projectDraft?.projectDrafts || []);
    } catch (error) {
      console.error('Error fetching draft project details:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return (
          <Badge
            variant="outline"
            className="flex bg-green-900 text-green-500 items-center gap-1"
          >
            <CheckCircle className="h-3 w-3" />
            Completed
          </Badge>
        );
      case 'PENDING':
        return (
          <Badge
            variant="outline"
            className="flex items-center gap-1 bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300"
          >
            <Clock className="h-3 w-3" />
            Pending
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary" className="flex items-center gap-1">
            <AlertCircle className="h-3 w-3" />
            {status}
          </Badge>
        );
    }
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="default">
          <Save className="mr-2 h-4 w-4" /> Drafts
        </Button>
      </SheetTrigger>

      <SheetContent className="w-[90vw] sm:max-w-lg p-0">
        <SheetHeader className="p-6 pb-2">
          <SheetTitle>Draft Project Details</SheetTitle>
          <SheetDescription>These are your saved drafts.</SheetDescription>
        </SheetHeader>

        <ScrollArea className="h-[calc(100vh-10rem)]">
          {loading ? (
            <div className="p-6 space-y-4">
              {[1, 2].map((i) => (
                <div key={i} className="space-y-3">
                  <Skeleton className="h-5 w-2/3" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-20 w-full" />
                </div>
              ))}
            </div>
          ) : (
            <div className="p-6 pt-2 space-y-6">
              {projectData.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <Save className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-lg font-medium">No drafts found</p>
                  <p className="text-sm text-muted-foreground">
                    Your saved project drafts will appear here
                  </p>
                </div>
              ) : (
                projectData.map((project) => (
                  <Card
                    key={project._id}
                    className="overflow-hidden border shadow-sm"
                  >
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-xl">
                          {project.projectName}
                        </CardTitle>
                        {getStatusBadge(project.status)}
                      </div>
                      <CardDescription className="line-clamp-2">
                        {project.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pb-2 space-y-3">
                      <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                        <div className="flex flex-col">
                          <span className="text-muted-foreground">Company</span>
                          <span className="font-medium">
                            {project.companyName}
                          </span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-muted-foreground">Email</span>
                          <span className="font-medium truncate">
                            {project.email}
                          </span>
                        </div>
                      </div>

                      {project.skillsRequired &&
                        project.skillsRequired.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {project.skillsRequired.map(
                              (skill, index) =>
                                skill && (
                                  <Badge key={index} variant="outline">
                                    {skill}
                                  </Badge>
                                ),
                            )}
                          </div>
                        )}
                      {project.profiles.length > 0 && (
                        <div className="mt-3">
                          <h4 className="text-sm font-semibold mb-2">
                            Profiles ({project.profiles.length})
                          </h4>
                          <div className="space-y-3">
                            {project.profiles.slice(0, 2).map((profile) => (
                              <div
                                key={profile._id}
                                className="bg-muted/40 rounded-lg p-3 text-sm"
                              >
                                <div className="flex justify-between items-start mb-1">
                                  <span className="font-medium">
                                    {profile.domain || 'No Domain'}
                                  </span>
                                  <Badge
                                    variant="secondary"
                                    className="text-xs"
                                  >
                                    ${profile.rate}/hr
                                  </Badge>
                                </div>
                                <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                                  {profile.description}
                                </p>
                                <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs">
                                  <div>
                                    <span className="text-muted-foreground">
                                      Required:{' '}
                                    </span>
                                    <span>{profile.freelancersRequired}</span>
                                  </div>
                                  <div>
                                    <span className="text-muted-foreground">
                                      Experience:{' '}
                                    </span>
                                    <span>{profile.experience} years</span>
                                  </div>
                                  <div>
                                    <span className="text-muted-foreground">
                                      Bids:{' '}
                                    </span>
                                    <span>{profile.totalBid?.length || 0}</span>
                                  </div>
                                </div>
                              </div>
                            ))}

                            {project.profiles.length > 2 && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="w-full text-xs"
                              >
                                Show {project.profiles.length - 2} more profiles
                              </Button>
                            )}
                          </div>
                        </div>
                      )}
                    </CardContent>
                    <CardFooter className="pt-2">
                      <ProjectDrawer
                        isSizeSmall={false}
                        icon={<ExternalLink className="h-3 w-3 mr-1" />}
                        project={project}
                        text="View Project Details"
                      />
                    </CardFooter>
                  </Card>
                ))
              )}
            </div>
          )}
        </ScrollArea>

        <div className="p-6 pt-0 mb-3">
          <Separator className="my-2" />
          <SheetFooter>
            <SheetClose asChild>
              <Button type="button">Close</Button>
            </SheetClose>
          </SheetFooter>
        </div>
      </SheetContent>
    </Sheet>
  );
}
