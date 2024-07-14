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

type CardProps = React.ComponentProps<typeof Card>;
export function ProjectProfileDetailCard({ className, ...props }: CardProps) {
  return (
    <Card className={cn('w-[350px]', className)} {...props}>
      <CardHeader>
        <CardTitle>Frontend Developer{'(2)'}</CardTitle>
        <CardDescription className="text-gray-600">
          Your requirement is of 2 freelancers for this profile, 6 people have
          appplied via bid and 1 person is selected till now.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div>
          <ul className="flex flex-wrap gap-2">
            <li className="min-w-[45%] ">
              <span className="text-gray-700 font-semibold ">Email- </span>{' '}
              sample@xyz.com
            </li>
            <li className="min-w-[45%] ">
              <span className="text-gray-700 font-semibold ">Staus- </span>{' '}
              Current
            </li>
            <li className="min-w-[45%] ">
              <span className="text-gray-700 font-semibold ">Start Date- </span>{' '}
              22/22/2222
            </li>
            <li className="min-w-[45%] ">
              <span className="text-gray-700 font-semibold ">End date- </span>{' '}
              24/22/2222
            </li>
          </ul>
        </div>
      </CardContent>
      <CardFooter>
        <Button className={`w-full `}>View Bids</Button>
      </CardFooter>
    </Card>
  );
}
