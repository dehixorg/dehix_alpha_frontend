import BidCard from './BidCard';

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

type Interview = {
  _id?: string;
  talentId?: {
    label?: string;
  };
  interviewBids?: Record<string, InterviewBid>;
  InterviewStatus?: string;
};

const BidList = ({
  interview,
  setConfirmAction,
}: {
  interview: Interview;
  setConfirmAction: (action: {
    interviewId?: string;
    bidId?: string;
    action: string;
  }) => void;
}) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mt-4">
    {Object.values(interview?.interviewBids || {}).map((bid) => (
      <BidCard
        key={bid?._id}
        bid={bid}
        interviewId={interview?._id}
        setConfirmAction={setConfirmAction}
      />
    ))}
  </div>
);

export default BidList;
