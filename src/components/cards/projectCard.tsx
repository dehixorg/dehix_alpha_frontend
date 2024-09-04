import Link from 'next/link';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

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
  createdAt: Date;
  updatedAt: Date;
}

type ProjectCardProps = React.ComponentProps<typeof Card> & {
  project: ProjectType;
};

export function ProjectCard({
  className,
  project,
  ...props
}: ProjectCardProps) {
  return (
    <Card className={cn('flex flex-col', className)} {...props}>
      <CardHeader>
        <CardTitle>{project.projectName}</CardTitle>
        <CardDescription className="text-gray-600">
          <p className="my-auto">
            {project.createdAt
              ? new Date(project.createdAt).toLocaleDateString()
              : 'N/A'}
          </p>

          <br />
          <Badge
            className="text-xs"
            variant={project.verified ? 'secondary' : 'outline'}
          >
            {project.verified ? 'Verified' : 'Not Verified'}
          </Badge>
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4 mb-auto flex-grow">
        <div className="mb-4 grid grid-cols-[25px_1fr] items-start pb-4 last:mb-0 last:pb-0">
          <span className="flex h-2 w-2 translate-y-1 rounded-full" />
          <p className="text-sm text-muted-foreground">{project.description}</p>
        </div>
        <div>
          <p>
            <strong>Company:</strong> {project.companyName}
          </p>
          <p>
            <strong>Role:</strong> {project.role}
          </p>
          <p>
            <strong>Experience:</strong> {project.experience}
          </p>
          <p>
            <strong>Status:</strong> {project.status}
          </p>

          <div className="flex flex-wrap gap-1 mt-2">
            {project.skillsRequired.map((skill, index) => (
              <Badge key={index} className="text-xs text-white bg-muted">
                {skill}
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Link href={`/business/project/${project._id}`} className="w-full">
          <Button
            className={`w-full ${project.status === 'Completed' && 'bg-green-900 hover:bg-green-700'}`}
          >
            View full details
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
