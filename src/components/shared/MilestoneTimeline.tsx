import React, { useRef } from 'react';
import { IconLeft, IconRight } from 'react-day-picker';

import Milestone from './Milestone';

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';

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
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleScroll = (event: React.WheelEvent) => {
    if (scrollRef.current) {
      scrollRef.current.scrollLeft += event.deltaY;
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-2 py-24 overflow-hidden scrollbar-hide relative">
      {/* Timeline for larger screens */}
      {dummyMilestones && (
        <div className="md:block hidden">
          {/* Timeline line */}
          <div className="absolute left-0 right-0 top-1/2 h-1 bg-white/20 transform -translate-y-1/2" />

          {/* Scrolling Timeline */}
          <div
            ref={scrollRef}
            onWheel={handleScroll}
            className="relative px-10 py-4 flex whitespace-nowrap items-center scrollbar-hide overflow-x-auto"
          >
            {dummyMilestones.map((milestone, index) => (
              <div key={index} className="relative inline-block px-16">
                {/* Timeline Dot */}
                <div
                  className="absolute top-1/2 transform -translate-y-1/2 w-4 h-4 bg-primary rounded-full border-4 border-white mx-auto "
                  style={{ left: '50%', transform: 'translate(-50%, -50%)' }}
                >
                  <div
                    className={`absolute left-1/2 transform -translate-x-1/2 ${
                      index % 2 === 0 ? 'top-[-15px]' : ''
                    } text-white`}
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
            ))}
          </div>
        </div>
      )}

      {/* Carousel for mobile view */}
      <div className="md:hidden block">
        <Carousel>
          {/* Left Swipe Button */}
          <CarouselPrevious>
            <button className="flex items-center justify-center w-10 h-10 bg-white/20 rounded-full">
              <IconLeft />
            </button>
          </CarouselPrevious>

          {/* Carousel Content */}
          <CarouselContent className="">
            {dummyMilestones.map((milestone, index) => (
              <CarouselItem key={index}>
                <Milestone
                  date={milestone.date}
                  title={milestone.title}
                  description={milestone.description}
                  position="center" // Center position for mobile
                  isMobile={true}
                />
              </CarouselItem>
            ))}
          </CarouselContent>

          {/* Right Swipe Button */}
          <CarouselNext>
            <button className="flex items-center justify-center w-10 h-10 bg-white/20 rounded-full">
              <IconRight />
            </button>
          </CarouselNext>
        </Carousel>
      </div>
    </div>
  );
};

export default MilestoneTimeline;
