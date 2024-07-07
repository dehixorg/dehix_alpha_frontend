import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
} from "@/components/ui/pagination";
import {
  ChevronLeft,
  ChevronRight,
  Copy,
} from "lucide-react";
interface InterviewCardProps {
  interviewer: string;
  interviewee: string;
  skill: string;
  interviewDate: Date;
  rating: number | string;
  comments?: string;
}

const InterviewCard: React.FC<InterviewCardProps> = ({
  interviewer,
  interviewee,
  skill,
  interviewDate,
  rating,
  comments,
}) => {
  const formatDate = (date: Date) => {
    // Implement date formatting as per your preference
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <Card className="overflow-hidden" x-chunk="dashboard-05-chunk-4">
      <CardHeader className="flex flex-row items-start bg-muted/50">
        <div className="grid gap-0.5">
          <CardTitle className="group flex items-center gap-2 text-lg">
            {`Interview with ${interviewee}`}
            <Button
              size="icon"
              variant="outline"
              className="h-6 w-6 opacity-0 transition-opacity group-hover:opacity-100"
            >
              <Copy className="h-3 w-3" />
              <span className="sr-only">Copy Interview ID</span>
            </Button>
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="p-6 text-sm">
        {/* Display interview details */}
        <div className="grid gap-3">
          <div className="font-semibold">Interview Details</div>
          <ul className="grid gap-3">
            <li className="flex items-center justify-between">
              <span className="text-muted-foreground">Interviewer</span>
              <span>{interviewer}</span>
            </li>
            <li className="flex items-center justify-between">
              <span className="text-muted-foreground">Skill</span>
              <span>{skill}</span>
            </li>
            <li className="flex items-center justify-between">
              <span className="text-muted-foreground">Rating</span>
              <span>{rating}</span>
            </li>
            {comments && (
              <>
                <li className="font-semibold mt-4">Comments</li>
                <li className="flex items-center justify-between">
                  <span className="text-muted-foreground">{comments}</span>
                </li>
              </>
            )}
          </ul>
        </div>
      </CardContent>
      <CardFooter className="flex flex-row items-center border-t bg-muted/50 px-6 py-3">
        <div className="text-xs text-muted-foreground">
          Updated{" "}
          <time dateTime={interviewDate.toISOString()}>
            {formatDate(interviewDate)}
          </time>
        </div>
      </CardFooter>
    </Card>
  );
};

export default InterviewCard;
