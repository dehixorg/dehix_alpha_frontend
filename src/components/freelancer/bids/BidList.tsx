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
  description?: string;
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
    <div className="space-y-4">
      {interview?.description && (
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-medium text-black mb-2">Description:</h3>
          <p className="text-gray-700 text-sm whitespace-pre-line">
            {interview.description}
          </p>
        </div>
      )}
      <div className="flex justify-center py-4">
        <button
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded"
          onClick={() =>
            setConfirmAction({
              interviewId: interview?._id,
              action: 'PLACE_BID',
            })
          }
        >
          Place Bid
        </button>
      </div>
    </div>
  );
};

export default BidList;
