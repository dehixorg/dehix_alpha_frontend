import React from 'react';

import BidItem from './biditem';

import { BidstatusEnum } from '@/utils/enum';

interface Bid {
  _id: string;
  bid_status: BidstatusEnum; //enum
  project_id: string;
  bidder_id: string;
  current_price: 0;
  domain_id: string;
}

interface AppliedBidsProps {
  bids: Bid[]; // Corrected to an array of Bid objects
  onAction: (bidId: string, actionType: string) => void;
}

const AppliedBids: React.FC<AppliedBidsProps> = ({ bids, onAction }) => {
  const action = [
    { label: 'Select', type: 'select', variant: 'success' },
    { label: 'Reject', type: 'reject', variant: 'danger' },
    { label: 'Schedule Interview', type: 'schedule', variant: 'primary' },
    { label: 'Move to Lobby', type: 'lobby', variant: 'secondary' },
  ];

  return (
    <div className="applied-bids">
      {bids.map((bid) => (
        <BidItem key={bid._id} bid={bid} onAction={onAction} actions={action} />
      ))}
    </div>
  );
};

export default AppliedBids;
