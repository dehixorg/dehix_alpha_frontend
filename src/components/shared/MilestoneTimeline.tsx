import React from 'react';

import Milestone from './Milestone';

const dummyMilestones = [
  {
    date: 'Apr 10, 2018',
    title: 'Development Started',
    description:
      'Initial development phase began, setting the foundation for the project.',
  },
  {
    date: 'Jun 14, 2018',
    title: 'Pre-ICO Opens',
    description:
      'The Pre-ICO phase was launched to gather early investments for the project.',
  },
  {
    date: 'Jul 24, 2018',
    title: 'Private Token Round',
    description:
      'Private investors were invited to participate in the token sale.',
  },
  {
    date: 'Sep 14, 2018',
    title: 'Pre-ICO Closed',
    description:
      'The Pre-ICO phase was successfully concluded, raising the required funds.',
  },
  {
    date: 'Dec 24, 2018',
    title: 'Decentralized Platform Launch',
    description:
      'The decentralized platform was officially launched, marking a major milestone.',
  },
  {
    date: 'Jan 15, 2019',
    title: 'App Integration Process',
    description:
      'Efforts began to integrate the application with the decentralized platform.',
  },
];

const MilestoneTimeline: React.FC = () => {
  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-24 overflow-hidden relative">
      {/* Timeline line */}
      <div className="absolute md:block hidden left-0 right-0 top-1/2 h-1 bg-white/20 transform -translate-y-1/2" />

      {/* Scrolling Timeline */}
      <div className="relative md:flex hidden whitespace-nowrap  items-center">
        {/* Duplicate milestones for infinite effect */}
        {[...dummyMilestones, ...dummyMilestones].map((milestone, index) => {
          const isOriginal = index < dummyMilestones.length;
          return (
            <div
              key={index}
              className="relative  loop-scroll inline-block px-8"
              aria-hidden={!isOriginal}
            >
              {/* Timeline Dot */}
              <div
                className=" absolute top-1/2 transform -translate-y-1/2 w-4 h-4 bg-primary rounded-full border-4 border-white mx-auto mb-2"
                style={{ left: '50%', transform: 'translate(-50%, -50%)' }} // Ensures dot aligns with the timeline line
              >
                <div
                  className={`absolute left-1/2 transform -translate-x-1/2 ${
                    index % 2 === 0 ? 'top-[-15px]' : ''
                  } text-white `}
                >
                  |
                </div>
              </div>

              {/* Milestone */}
              <Milestone
                date={milestone.date}
                title={milestone.title}
                description={milestone.description}
                position={index % 2 === 0 ? 'bottom' : 'top'}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MilestoneTimeline;
