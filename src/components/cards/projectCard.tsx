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

type ProjectType = {
  _id: string;
  projectName: string;
  description: string;
  email: string;
  verified: string;
  isVerified: string;
  companyName: string;
  start: { $date: string };
  end: { $date: string };
  skillsRequired: string[];
  experience: string;
  role: string;
  projectType: string;
  totalNeedOfFreelancer: {
    category: string;
    needOfFreelancer: number;
    appliedCandidates: string[];
    rejected: string[];
    accepted: string[];
    status: string;
    _id: { $oid: string };
  }[];
  status: string;
  team: string[];
  createdAt: { $date: string };
  updatedAt: { $date: string };
};

type ProjectCardProps = React.ComponentProps<typeof Card> & {
  project: ProjectType;
};

export function ProjectCard({
  className,
  project,
  ...props
}: ProjectCardProps) {
  return (
    <Card className={cn('w-[350px] flex flex-col', className)} {...props}>
      <CardHeader>
        <CardTitle>{project.projectName}</CardTitle>
        <CardDescription className="text-gray-600">
          Estimated completion time:{' '}
          {new Date(project.end.$date).toLocaleDateString()}
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4 mb-auto flex-grow">
        <div className="mb-4 grid grid-cols-[25px_1fr] items-start pb-4 last:mb-0 last:pb-0">
          <span className="flex h-2 w-2 translate-y-1 rounded-full" />
          <p className="text-sm text-muted-foreground">{project.description}</p>
        </div>
        <div>
          <Badge
            className="text-xs mb-3"
            variant={project.verified ? 'secondary' : 'outline'}
          >
            {project.verified ? 'Verified' : 'Not Verified'}
          </Badge>
          <p>
            <strong>Company:</strong> {project.companyName}
          </p>
          <p>
            <strong>Role:</strong> {project.role}
          </p>
          <p>
            <strong>Skills Required:</strong>{' '}
            {project.skillsRequired.join(', ')}
          </p>
          <p>
            <strong>Experience:</strong> {project.experience}
          </p>
          <p>
            <strong>Status:</strong> {project.status}
          </p>
        </div>
      </CardContent>
      <CardFooter>
        <Button
          className={`w-full ${project.status === 'Completed' && 'bg-green-900 hover:bg-green-700'}`}
        >
          View Full details
        </Button>
      </CardFooter>
    </Card>
  );
}
