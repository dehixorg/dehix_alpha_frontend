
import React from 'react';
import BidItem from './biditem';

const AppliedBids = ({ bids, onAction }) => {
    const actions = [
        { label: 'Select', type: 'select', variant: 'success' },
        { label: 'Reject', type: 'reject', variant: 'danger' },
        { label: 'Schedule Interview', type: 'schedule', variant: 'primary' },
        { label: 'Move to Lobby', type: 'lobby', variant: 'secondary' },
    ];

    return (
        <div className="applied-bids">
            {
            bids.map(bid => (
                <BidItem  bid={bid} onAction={onAction} actions={actions} />
            ))}
        </div>
    );
};

export default AppliedBids;
