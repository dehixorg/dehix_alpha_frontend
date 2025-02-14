import Link from 'next/link';
import { ShieldCheck } from 'lucide-react';

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
import { getStatusBadge } from '@/utils/statusBadge';
import { Type } from '@/utils/enum';
import { StatusEnum } from '@/utils/freelancer/enum';

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
  status?: StatusEnum;
  team?: string[];
  createdAt: Date;
  updatedAt: Date;
}

type ProjectCardProps = React.ComponentProps<typeof Card> & {
  cardClassName?: string;
  project: ProjectType;
  type?: string;
};

export function ProjectCard({
  cardClassName,
  project,
  type = Type.BUSINESS,
  ...props
}: ProjectCardProps) {
  const { text, className } = getStatusBadge(project.status);
  return (
    <Card className={cn('flex flex-col', cardClassName)} {...props}>
      <CardHeader>
        <CardTitle className="flex">
          {project.projectName}&nbsp;
          {project.verified && <ShieldCheck className="text-success" />}
        </CardTitle>
        <CardDescription className="text-gray-600">
          <p className="my-auto">
            {project.createdAt
              ? new Date(project.createdAt).toLocaleDateString()
              : 'N/A'}
          </p>

          <br />
          <Badge className={className}>{text}</Badge>
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4 mb-auto flex-grow">
        <div className="mb-4 items-start pb-4 last:mb-0 last:pb-0 w-full">
          <span className="flex h-2 w-2 rounded-full" />
          <p className="text-sm text-muted-foreground">
            {
              project.description?.length > 40
                ? `${project.description.slice(0, 40)}...`
                : project.description || 'No description available'
            }

          </p>
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
        <Link
          href={`/${type.toLocaleLowerCase()}/project/${project._id}`}
          className="w-full"
        >
          <Button
            className={`w-full ${project.status === StatusEnum.COMPLETED && 'bg-green-900 hover:bg-green-700'}`}
          >
            View full details
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
