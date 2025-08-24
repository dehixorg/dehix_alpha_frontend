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
          <div className="flex items-center justify-center mt-1">
            <button
              className="p-0.5 h-auto bg-transparent border-none cursor-pointer hover:bg-gray-100 rounded"
              onClick={(e) => {
                e.stopPropagation();
                const modal = document.createElement('div');
                modal.className =
                  'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
                modal.innerHTML = `
                  <div class="bg-[#151518] rounded-lg p-6 max-w-md mx-4 max-h-[80vh] overflow-y-auto">
                    <div class="flex justify-between items-center mb-4">
                      <h3 class="text-lg font-semibold text-white">Description</h3>
                      <button class="text-red-500 hover:text-red-700" onclick="this.closest('.fixed').remove()">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                        </svg>
                      </button>
                    </div>
                    <div class="text-sm flex text-white whitespace-pre-wrap">
                      ${summary}
                      
                    </div>
                  </div>
                `;
                document.body.appendChild(modal);
                modal.addEventListener('click', (e) => {
                  if (e.target === modal) modal.remove();
                });
              }}
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MilestoneCards;
