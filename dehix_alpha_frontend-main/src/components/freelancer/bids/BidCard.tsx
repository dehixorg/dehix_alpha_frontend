import {
  Briefcase,
  Calendar,
  CheckCircle,
  Clock,
  DollarSign,
  User,
  XCircle,
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';

type InterviewBid = {
  _id?: string;
  interviewerId?: string;
  suggestedDateTime?: string;
  fee?: string;
  interviewer?: {
    _id?: string;
    userName?: string;
    skills?: string[];
    workExperience?: number;
  };
  status?: string;
};

const BidCard = ({
  bid,
  interviewId,
  setConfirmAction,
}: {
  bid: InterviewBid;
  interviewId?: string;
  setConfirmAction: (action: {
    interviewId?: string;
    bidId?: string;
    action: string;
  }) => void;
}) => (
  <Card className="relative w-full max-w-lg mx-auto p-6 rounded-2xl border  shadow-lg hover:shadow-2xl transition-all space-y-4">
    <Badge
      className={`absolute top-3 right-3 text-xs flex items-center gap-2 px-2 py-1 font-semibold rounded-full shadow-md transition-all 
      ${
        bid?.status === 'ACCEPTED'
          ? 'text-green-800 bg-green-100'
          : bid?.status === 'REJECTED'
            ? 'text-red-800 bg-red-100'
            : 'text-yellow-800 bg-yellow-100'
      }`}
    >
      {bid?.status === 'ACCEPTED' ? (
        <CheckCircle className="w-4 h-4" />
      ) : bid?.status === 'REJECTED' ? (
        <XCircle className="w-4 h-4" />
      ) : (
        <Clock className="w-4 h-4" />
      )}
      {bid?.status?.toUpperCase() || 'PENDING'}
    </Badge>
    <CardContent className="flex flex-col gap-4">
      <div className="flex items-center gap-3 text-lg font-semibold ">
        <User className="w-5 h-5 " />
        {bid?.interviewer?.userName || 'Not Provided'}
      </div>

      <div className="flex items-center">
        <p className="text-sm font-semibold  mr-2">Skills:</p>
        <ScrollArea className="w-full whitespace-nowrap overflow-x-auto ">
          <div className="flex items-center gap-2">
            {bid?.interviewer?.skills?.length ? (
              bid.interviewer.skills.map((skill, index) => (
                <Badge
                  key={index}
                  className="px-3 py-1 text-xs  rounded-md shadow-sm"
                >
                  {skill}
                </Badge>
              ))
            ) : (
              <p className="text-xs text-gray-400">Not Provided</p>
            )}
          </div>
          {bid?.interviewer?.skills?.length ? (
            <div className="mt-2">
              <ScrollBar orientation="horizontal" />
            </div>
          ) : null}
        </ScrollArea>
      </div>

      <div className="flex items-center gap-3 text-sm ">
        <Briefcase className="w-5 h-5 " />
        {bid?.interviewer?.workExperience
          ? `${bid.interviewer.workExperience} years`
          : 'Not Provided'}
      </div>

      <div className="flex justify-between text-sm ">
        <p className="flex items-center gap-2">
          <Calendar className="w-5 h-5 " />
          {bid?.suggestedDateTime
            ? new Date(bid.suggestedDateTime).toLocaleString()
            : 'Not Provided'}
        </p>
        <p className="flex items-center gap-2">
          <DollarSign className="w-5 h-5 " />
          {bid?.fee || 'Not Provided'}
        </p>
      </div>

      {bid?.status === 'PENDING' && (
        <div className="flex justify-center gap-4 mt-3">
          <Button
            className="px-5 py-2 text-sm font-semibold bg-green-600 hover:bg-green-700 text-white rounded-lg shadow-md transition-all"
            onClick={() =>
              setConfirmAction({
                interviewId,
                bidId: bid._id,
                action: 'ACCEPTED',
              })
            }
          >
            Accept
          </Button>
          <Button
            className="px-5 py-2 text-sm font-semibold bg-red-600 hover:bg-red-700 text-white rounded-lg shadow-md transition-all"
            onClick={() =>
              setConfirmAction({
                interviewId,
                bidId: bid._id,
                action: 'REJECTED',
              })
            }
          >
            Reject
          </Button>
        </div>
      )}
    </CardContent>
  </Card>
);

export default BidCard;
