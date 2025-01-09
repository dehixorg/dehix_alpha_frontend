import React from 'react';

interface MilestoneProps {
  date: string;
  title: string;
  description?: string;
  position: 'top' | 'bottom';
}

const Milestone: React.FC<MilestoneProps> = ({ date, title, description, position }) => {

  const truncateDescription = (text: string, maxLength: number = 50) => {
    if (text.length > maxLength) {
      return text.slice(0, maxLength) + '...';
    }
    return text;
  };

  return (
    <div
  className={`
    flex flex-col items-center gap-2 relative w-48
    ${position === 'top' ? 'mt-[110px]' : '-mt-[90px]'}
  `}
>
  {/* Milestone Content */}
  <div className="text-center rounded-md bg-[rgba(255,255,255,0.1)] p-2 backdrop-blur-sm border border-[rgba(255,255,255,0.1)]">
    <p className="text-xs text-white/80">{date}</p>
    <h3 className="text-sm font-medium text-white">{truncateDescription(title, 20)}</h3>
    {description && <p className="text-xs text-white/60 mt-0.5">{truncateDescription(description)}</p>}
  </div>
</div>

  );
};

export default Milestone;
