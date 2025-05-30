import React from 'react';

interface MilestoneProps {
  date: string;
  title: string;
  summary?: string;
  position: 'top' | 'bottom' | 'center';
  isMobile?: boolean; // Add isMobile prop
  isSelected: boolean;
}

const MilestoneCards: React.FC<MilestoneProps> = ({
  date,
  title,
  summary,
  position,
  isMobile,
  isSelected,
}) => {
  const truncateDescription = (text: string, maxLength: number = 50) => {
    if (text.length > maxLength) {
      return text.slice(0, maxLength) + '...';
    }
    return text;
  };

  return (
    <div
      className={`flex flex-col group-hover:bg-[#40b3ff] rounded-md   items-center gap-2 relative ${
        isMobile ? 'w-64' : 'w-48 h-20'
      } ${position === 'top' ? 'mt-[132px]' : position === 'bottom' ? '-mt-[106px]' : ''} 
          ${isSelected ? 'bg-[#11a0ff]' : 'dynamic-card'}
        `}
      style={{
        width: '200px',
        maxWidth: '100%',
        visibility: title === 'dummy' ? 'hidden' : 'visible',
      }}
    >
      {/* Milestone Content */}
      <div
        className={`text-center  border-line-bg w-full h-full rounded-md  p-4 ${
          isMobile ? 'text-base' : 'text-sm'
        }  border`}
      >
        <p className="text-xs">
          {new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </p>
        <h3 className={`font-bold  ${isMobile ? 'text-lg' : 'text-sm'}`}>
          {truncateDescription(title, 20)}
        </h3>
        {summary && (
          <p className={` mt-0.5 ${isMobile ? 'text-sm' : 'text-xs'}`}>
            {truncateDescription(summary, 20)}
          </p>
        )}
      </div>
    </div>
  );
};

export default MilestoneCards;
