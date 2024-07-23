import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import dummyData from '@/dummydata.json';
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
        <CardTitle>
          {dummyData.businessprojectProfileCard.heading}
          {'(2)'}
        </CardTitle>
        <CardDescription className="text-gray-600">
          {dummyData.businessprojectProfileCard.description}
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div>
          <ul className="flex flex-wrap gap-2">
            <li className="min-w-[45%] ">
              <span className="text-gray-700 font-semibold ">Email- </span>{' '}
              {dummyData.businessprojectProfileCard.email}
            </li>
            <li className="min-w-[45%] ">
              <span className="text-gray-700 font-semibold ">Staus- </span>{' '}
              {dummyData.businessprojectProfileCard.status}
            </li>
            <li className="min-w-[45%] ">
              <span className="text-gray-700 font-semibold ">Start Date- </span>{' '}
              {dummyData.businessprojectProfileCard.startDate}
            </li>
            <li className="min-w-[45%] ">
              <span className="text-gray-700 font-semibold ">End date- </span>{' '}
              {dummyData.businessprojectProfileCard.endDate}
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
