import React from 'react';

import { Badge } from '../ui/badge'; // Adjust the import path as needed

interface DateRangeProps {
  startDate: Date | string | null | undefined; // Allow string or Date types
  endDate: Date | string | null | undefined; // Allow string or Date types, "current" included
}

const DateRange: React.FC<DateRangeProps> = ({ startDate, endDate }) => {
  // Format startDate, handle both Date and string
  const formattedStartDate = startDate
    ? typeof startDate === 'string'
      ? new Date(startDate).toLocaleDateString() // If it's a string, convert to Date first
      : new Date(startDate).toLocaleDateString() // If it's a Date object, use it directly
    : 'Start Date N/A'; // If no date is provided, show this fallback

  // Format endDate, handle both Date and string, and "current" string value
  const formattedEndDate =
    endDate === 'current' || !endDate
      ? 'Current'
      : typeof endDate === 'string'
        ? new Date(endDate).toLocaleDateString() // If it's a string, convert to Date first
        : new Date(endDate).toLocaleDateString(); // If it's a Date object, use it directly

  return (
    <div className="flex items-center">
      <Badge className="text-sm font-semibold px-3 py-1 uppercase rounded">
        {formattedStartDate}
      </Badge>
      <p>-</p>
      <Badge className="text-sm font-semibold px-3 py-1 uppercase rounded">
        {formattedEndDate}
      </Badge>
    </div>
  );
};

export default DateRange;
