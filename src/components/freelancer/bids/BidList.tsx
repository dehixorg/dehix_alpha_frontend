import { useEffect, useState } from 'react';

import { fetchInterviewBids } from '@/lib/api/interviews';
import { toast } from '@/components/ui/use-toast';

type InterviewBid = {
  _id?: string;
  interviewerId?: string;
  suggestedDateTime?: string;
  fee?: string;
  status?: string;
};

type Interview = {
  _id?: string;
  interviewBids?: Record<string, InterviewBid>;
  description?: string;
  interviewerId?: string;
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
  const [hasBidAlready, setHasBidAlready] = useState(false);

  useEffect(() => {
    const loadBids = async () => {
      if (!interview.interviewerId || !interview._id) return;

      try {
        // extract bids from object into array
        const bids = Object.values(interview.interviewBids || {});

        // find bid where interviewerId matches
        const myBid = bids.find(
          (bid) => bid.interviewerId === interview.interviewerId,
        );

        if (myBid && myBid._id) {
          setHasBidAlready(true);

          // fetch from backend using interviewId + bidId
          await fetchInterviewBids(interview._id, myBid._id);
        }
      } catch (error) {
        console.error(error);
        toast({ description: 'Failed to fetch interview bids' });
      }
    };

    loadBids();
  }, [interview.interviewerId, interview._id, interview.interviewBids]);

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
          className={`px-4 py-2 rounded text-white ${
            hasBidAlready
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700'
          }`}
          onClick={() =>
            !hasBidAlready &&
            setConfirmAction({
              interviewId: interview?._id,
              action: 'PLACE_BID',
            })
          }
          disabled={hasBidAlready}
        >
          {hasBidAlready ? 'Bid Already Placed' : 'Place Bid'}
        </button>
      </div>
    </div>
  );
};

export default BidList;
