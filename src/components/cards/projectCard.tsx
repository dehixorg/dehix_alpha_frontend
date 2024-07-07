import { BellRing, Check } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

type CardProps = React.ComponentProps<typeof Card> & {
  projectType: string;
};
export function ProjectCard({ className,projectType, ...props }: CardProps) {
  return (
    <Card className={cn("w-[350px]", className)} {...props}>
      <CardHeader>
        <CardTitle>Project Name</CardTitle>
        <CardDescription className="text-gray-600">Estimated completion time is 14 days</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
          <div className="mb-4 grid grid-cols-[25px_1fr] items-start pb-4 last:mb-0 last:pb-0">
              <span className="flex h-2 w-2 translate-y-1 rounded-full" />
                <p className="text-sm text-muted-foreground">
                  Here will come the basic information of the project. which will give the description which user has added 
                </p>
            </div>
      </CardContent>
      <CardFooter>
        <Button className={`w-full ${projectType==="completed"?"bg-green-900 hover:bg-green-700":"bg-gray-800"}`}>
          View Full details 
        </Button>
      </CardFooter>
    </Card>
  )
}
