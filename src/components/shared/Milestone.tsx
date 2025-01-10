import React from 'react';

interface MilestoneProps {
  date: string;
  title: string;
  description?: string;
  position: 'top' | 'bottom' | 'center';
  isMobile?: boolean; // Add isMobile prop
}

const Milestone: React.FC<MilestoneProps> = ({
  date,
  title,
  description,
  position,
  isMobile,
}) => {
  const truncateDescription = (text: string, maxLength: number = 50) => {
    if (text.length > maxLength) {
      return text.slice(0, maxLength) + '...';
    }
    return text;
  };

  return (
    <div
      className={`flex flex-col items-center gap-2 relative ${
        isMobile ? 'w-64' : 'w-48'
      } ${position === 'top' ? 'mt-[120px]' : position === 'bottom' ? '-mt-[106px]' : ''}`}
    >
      {/* Milestone Content */}
      <div
        className={`text-center rounded-md bg-[rgba(255,255,255,0.1)] p-4 ${
          isMobile ? 'text-base' : 'text-sm'
        } backdrop-blur-sm border border-[rgba(255,255,255,0.1)]`}
      >
        <p className="text-xs text-white/80">{date}</p>
        <h3
          className={`font-medium text-white ${isMobile ? 'text-lg' : 'text-sm'}`}
        >
          {truncateDescription(title, isMobile ? 30 : 20)}
        </h3>
        {description && (
          <p
            className={`text-white/60 mt-0.5 ${isMobile ? 'text-sm' : 'text-xs'}`}
          >
            {truncateDescription(description, isMobile ? 100 : 50)}
          </p>
        )}
      </div>
    </div>
  );
};

export default Milestone;
