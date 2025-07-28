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
  interviewBids?: InterviewBid[];
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
}) => {
  return (
    <div className="flex justify-center py-4">
      <button
        className="px-4 py-2 bg-primary text-white rounded"
        onClick={() =>
          setConfirmAction({ interviewId: interview?._id, action: 'PLACE_BID' })
        }
      >
        Place Bid
      </button>
    </div>
  );
};

export default BidList;
