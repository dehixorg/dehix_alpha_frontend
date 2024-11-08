import React from 'react';

interface DateRangeProps {
  startDate: Date | null | undefined;
  endDate: Date | null | undefined;
}

const DateRange: React.FC<DateRangeProps> = ({ startDate, endDate }) => {
  const formattedStartDate = startDate
    ? new Date(startDate).toLocaleDateString()
    : 'N/A';
  const formattedEndDate = endDate
    ? new Date(endDate).toLocaleDateString()
    : 'Current';

  return (
    <div className="flex items-center space-x-2">
      <p className="text-sm font-semibold dark:text-black dark:bg-white bg-black text-white px-3 py-1 rounded">
        {formattedStartDate}
      </p>
      <p>-</p>
      <p className="text-sm font-semibold dark:text-black dark:bg-white bg-black text-white px-3 py-1 uppercase rounded">
        {formattedEndDate}
      </p>
    </div>
  );
};

export default DateRange;
