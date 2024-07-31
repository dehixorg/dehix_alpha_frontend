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
interface ProjectProfileDetailCardProps {
  domain: string;
  freelancersRequired: string;
  skills: string[];
  experience: number;
  minConnect: number;
  rate: number;
  description: string;
  email?: string; // Optional fields
  status?: string; // Optional fields
  startDate?: string; // Optional fields
  endDate?: string; // Optional fields
  className?: string; // For custom styling
}

type CardProps = React.ComponentProps<typeof Card> &
  ProjectProfileDetailCardProps;

export function ProjectProfileDetailCard({
  domain,
  freelancersRequired,
  skills,
  experience,
  minConnect,
  rate,
  description,
  email,
  status,
  startDate,
  endDate,
  className,
  ...props
}: CardProps) {
  return (
    <Card className={cn('w-[350px]', className)} {...props}>
      <CardHeader>
        <CardTitle>
          {domain}
          {`(${freelancersRequired})`}
        </CardTitle>
        <CardDescription className="text-gray-600">
          Requirement is of {freelancersRequired} freelancer(s) for{' '}
          {domain.toLowerCase() + ' '}
          profile.
          <br />
          {description}
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div>
          <ul className="flex flex-wrap gap-2">
            {email && (
              <li className="min-w-[45%]">
                <span className="text-gray-700 font-semibold">Email - </span>
                {email}
              </li>
            )}
            {status && (
              <li className="min-w-[45%]">
                <span className="text-gray-700 font-semibold">Status - </span>
                {status}
              </li>
            )}
            {startDate && (
              <li className="min-w-[45%]">
                <span className="text-gray-700 font-semibold">
                  Start Date -{' '}
                </span>
                {startDate}
              </li>
            )}
            {endDate && (
              <li className="min-w-[45%]">
                <span className="text-gray-400 font-semibold">End Date - </span>
                {endDate}
              </li>
            )}
            <li className="min-w-[45%]">
              <span className="text-gray-400 font-semibold">Experience - </span>
              {experience} years
            </li>
            <li className="min-w-[45%]">
              <span className="text-gray-400 font-semibold">
                Min Connect -{' '}
              </span>
              {minConnect}
            </li>
          </ul>
          {skills.length > 0 && (
            <div className="mt-2">
              <span className="text-gray-700 font-semibold">Skills - </span>
              <ul className="flex flex-wrap gap-1 mt-1">
                {skills.map((skill, index) => (
                  <li
                    key={index}
                    className="bg-gray-200 rounded px-2 py-1 text-sm"
                  >
                    {skill}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter>
        <Button disabled className="w-full">
          Bid(${rate})
        </Button>
      </CardFooter>
    </Card>
  );
}
