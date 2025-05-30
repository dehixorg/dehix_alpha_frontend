import React from 'react';
import { CalendarIcon } from 'lucide-react';

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
      ? 'Still Going On!'
      : typeof endDate === 'string'
        ? new Date(endDate).toLocaleDateString() // If it's a string, convert to Date first
        : new Date(endDate).toLocaleDateString(); // If it's a Date object, use it directly

  return (
    <div className="flex relative whitespace-nowrap items-start sm:items-center gap-1 rounded-md ">
      <div className="flex items-center gap-1 sm:gap-2 ">
        <CalendarIcon className="w-4 h-4 sm:w-5 sm:h-5 " />
        <span className="text-xs sm:text-sm font-medium">{`Start  ${formattedStartDate}`}</span>
      </div>
      <p>-</p>
      <div className="flex items-center ">
        <span className="text-xs sm:text-sm font-medium">{` ${formattedEndDate}`}</span>
      </div>
    </div>
  );
};

export default DateRange;
