import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

interface ProjectType {
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
  status?: string;
  createdAt: Date;
}

type ProjectCardProps = {
  project?: ProjectType; // Optional since it's used during loading
  isLoading: boolean; // Loading state
  className?: string; // Add the className prop
};

export function ProjectCard({ project, isLoading, className }: ProjectCardProps) {
  if (isLoading) {
    // Render the customized Skeleton during loading
    return (
      <Card className={cn('flex flex-col', className)}> {/* Use className here */}
        <CardHeader>
          <Skeleton className="h-16 w-3/4 mb-0 rounded-md" /> {/* Project Name Skeleton */}
          <Skeleton className="h-4 w-1/4 mb-4 rounded-md" /> {/* Date Skeleton */}
        </CardHeader>
        <CardContent className="grid gap-4 mb-auto flex-grow">
          <div className="mb-4">
            <Skeleton className="h-16 w-full mb-10 rounded-md" /> {/* Description Skeleton */}
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-40 rounded-md" /> {/* Company Name Skeleton */}
            <Skeleton className="h-4 w-52 rounded-md" /> {/* Role Skeleton */}
            <Skeleton className="h-4 w-1/2 rounded-md" /> {/* Experience Skeleton */}
            <Skeleton className="h-4 w-28 rounded-md" /> {/* Status Skeleton */}
          </div>
          <div className="flex flex-wrap gap-1 mt-2">
            <Skeleton className="h-6 w-12 rounded-md" /> {/* Skill 1 */}
            <Skeleton className="h-6 w-16 rounded-md" /> {/* Skill 2 */}
            <Skeleton className="h-6 w-14 rounded-md" /> {/* Skill 3 */}
          </div>
        </CardContent>
        <CardFooter>
          <Skeleton className="h-10 w-full rounded-md" /> {/* Button Skeleton */}
        </CardFooter>
      </Card>
    );
  }

  // Render actual project data
  return (
    <Card className={cn('flex flex-col', className)}> {/* Use className here */}
      <CardHeader>
        <CardTitle>{project?.projectName}</CardTitle>
        <CardDescription className="text-gray-600">
          <p className="my-auto">
            {project?.createdAt ? new Date(project.createdAt).toLocaleDateString() : 'N/A'}
          </p>
          <br />
          <Badge className="text-xs" variant={project?.verified ? 'secondary' : 'outline'}>
            {project?.verified ? 'Verified' : 'Not Verified'}
          </Badge>
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4 mb-auto flex-grow">
        <div className="mb-4 grid grid-cols-[25px_1fr] items-start pb-4 last:mb-0 last:pb-0">
          <span className="flex h-2 w-2 translate-y-1 rounded-full" />
          <p className="text-sm text-muted-foreground">{project?.description}</p>
        </div>
        <div>
          <p>
            <strong>Company:</strong> {project?.companyName}
          </p>
          <p>
            <strong>Role:</strong> {project?.role}
          </p>
          <p>
            <strong>Experience:</strong> {project?.experience || 'N/A'}
          </p>
          <p>
            <strong>Status:</strong> {project?.status || 'N/A'}
          </p>
          <div className="flex flex-wrap gap-1 mt-2">
            {project?.skillsRequired?.map((skill, index) => (
              <Badge key={index} className="text-xs text-white bg-muted">
                {skill}
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Link href={`/business/project/${project?._id}`} className="w-full">
          <Button className={`w-full ${project?.status === 'Completed' && 'bg-green-900 hover:bg-green-700'}`}>
            View full details
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
