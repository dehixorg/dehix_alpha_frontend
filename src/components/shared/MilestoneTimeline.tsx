'use client';
import React, { useEffect, useRef, useState } from 'react';
import { IconLeft, IconRight } from 'react-day-picker';

import MilestoneCards from './MilestoneCards';
import StoriesAccordion from './StoriesAccodian';

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Milestone } from '@/utils/types/Milestone';

interface MilestoneTimelineProps {
  milestones: Milestone[];
  fetchMilestones: any;
  handleStorySubmit: any;
  isFreelancer?: boolean;
}

export const truncateDescription = (
  text: string,
  maxLength: number = 50,
): string => {
  if (text.length > maxLength) {
    return text.slice(0, maxLength) + '...';
  }
  return text;
};

const MilestoneTimeline: React.FC<MilestoneTimelineProps> = ({
  milestones,
  fetchMilestones,
  handleStorySubmit,
  isFreelancer = false,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(0);

  useEffect(() => {
    const div = scrollRef.current;

    const handleWheel = (event: WheelEvent) => {
      if (div) {
        // Ensure we only scroll horizontally if there's overflow
        const maxScrollLeft = div.scrollWidth - div.clientWidth;

        if (Math.abs(event.deltaY) > Math.abs(event.deltaX)) {
          event.preventDefault(); // Block vertical scrolling

          // Handle boundary cases to prevent overscrolling
          if (div.scrollLeft + event.deltaY > maxScrollLeft) {
            div.scrollLeft = maxScrollLeft; // Prevent overshooting the right edge
          } else if (div.scrollLeft + event.deltaY < 0) {
            div.scrollLeft = 0; // Prevent overshooting the left edge
          } else {
            div.scrollLeft += event.deltaY; // Perform horizontal scrolling
          }
        }
      }
    };

    if (div) {
      div.addEventListener('wheel', handleWheel, { passive: false });
    }

    return () => {
      if (div) {
        div.removeEventListener('wheel', handleWheel);
      }
    };
  }, [scrollRef]);

  const handleStorySelect = (milestone: any, index: number) => {
    if (index < 0 || index >= milestones.length) return;
    setSelectedIndex(index);
  };

  const displayMilestones =
    milestones.length === 1
      ? [
          ...milestones,
          {
            _id: 'dummy',
            title: 'dummy',
            description: '',
            stories: [],
            storyStatus: '',
            createdAt: '',
          },
        ]
      : milestones;

  return (
    <div className="h-auto ">
      <div className="w-[100vw] max-w-6xl mx-auto px-4 py-12 relative">
        {/* Timeline for larger screens */}
        <ScrollArea className="w-full whitespace-nowrap rounded-md border">
          {milestones && (
            <div ref={scrollRef} className="hidden md:block ">
              {/* Timeline Line */}
              <div className="absolute overflow-hidden left-0 right-0 top-1/2 h-1 line-bg bg-gray-500 transform -translate-y-1/2"></div>

              {/* Scrolling Timeline */}
              <div className="relative cursor-pointer flex items-center whitespace-nowrap overflow-x-auto overflow-y-scroll px-4 py-6  no-scrollbar">
                {displayMilestones.map((milestone, index) => (
                  <div
                    key={index}
                    className={`relative group px-16 inline-block ${displayMilestones.length === 1 ? 'mx-auto ' : ''}`} // Center for single milestone
                    onClick={() => handleStorySelect(milestone, index)}
                  >
                    {/* Timeline Dot */}
                    <div
                      className={`absolute ${
                        milestones.length === 1 && milestone.title === 'dummy'
                          ? 'hidden'
                          : ''
                      } ${
                        index === selectedIndex
                          ? 'bg-[var(--dot-hover-bg-color)] border-[var(--dot-hover-border-color)]'
                          : 'border-[var(--dot-border-color)]'
                      } top-1/2 transform -translate-y-1/2 w-5 h-5 bg-[var(--dot-bg-color)] rounded-full border-4 group group-hover:bg-[var(--dot-hover-bg-color)] group-hover:border-[var(--dot-hover-border-color)] `}
                      style={{
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                      }}
                    >
                      <div
                        className={`absolute left-1/2 transform -translate-x-1/2 ${
                          index % 2 === 0 ? '-top-6' : 'top-3'
                        } ${index === selectedIndex ? 'bg-[#11a0ff] text-[#11a0ff]' : ''}  group-hover:text-[#11a0ff] overflow-hidden `}
                      >
                        |
                      </div>
                    </div>

                    {/* Milestone Details */}
                    <MilestoneCards
                      date={milestone.createdAt || ''}
                      title={milestone.title}
                      summary={milestone.description}
                      position={index % 2 === 0 ? 'bottom' : 'top'}
                      isSelected={index === selectedIndex}
                    />

                    {/* Dummy Story Card */}
                    {milestone._id === 'dummy' && (
                      <div style={{ display: 'none' }}></div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
          <ScrollBar className="cursor-pointer" orientation="horizontal" />
        </ScrollArea>
      </div>
      {/* Carousel for mobile view */}
      <div className="flex pb-8 justify-center  items-center md:hidden">
        <Carousel>
          <CarouselContent className="flex min-h-[200px] items-center w-[100vw] gap-4">
            {milestones.map((milestone, index) => (
              <CarouselItem
                key={index}
                className="flex relative justify-center top-0  h-auto items-center"
                onClick={() => handleStorySelect(milestone, index + 1)}
              >
                {milestone._id !== 'dummy' && (
                  <div className="border p-6 border-line-bg  rounded-lg shadow-lg  w-full max-w-[80vw]">
                    {/* Card Content */}
                    <div className="text-center">
                      <p className="text-xs">
                        {milestone.createdAt &&
                          new Date(milestone.createdAt).toLocaleDateString(
                            'en-US',
                            {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                            },
                          )}
                      </p>
                      <h3 className="font-medium text-lg mt-2">
                        {truncateDescription(milestone.title, 16)}
                      </h3>
                      {milestone.description && (
                        <p className="text-sm mt-1">
                          {truncateDescription(milestone.description)}
                        </p>
                      )}
                    </div>
                    <CarouselPrevious className="absolute top-[117%] left-12 transform -translate-y-1/2">
                      <button
                        onClick={() => handleStorySelect(milestone, index - 1)}
                        className="bg-white/20 rounded-full p-3 text-white hover:bg-white/30"
                        disabled={index === 0}
                      >
                        <IconLeft />
                      </button>
                    </CarouselPrevious>
                    <CarouselNext className="absolute top-[117%] right-8 transform -translate-y-1/2">
                      <button
                        onClick={() => handleStorySelect(milestone, index + 1)}
                        className={`bg-white/20 rounded-full p-3 text-white ${
                          index === milestones.length - 1
                            ? 'cursor-not-allowed'
                            : 'hover:bg-white/30'
                        }`}
                        disabled={index === milestones.length - 1}
                      >
                        <IconRight />
                      </button>
                    </CarouselNext>
                  </div>
                )}
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      </div>

      {/* Stories Accordion */}
      {selectedIndex !== null && (
        <div className="mt-10">
          <StoriesAccordion
            milestone={milestones[selectedIndex]}
            fetchMilestones={fetchMilestones}
            handleStorySubmit={handleStorySubmit}
            isFreelancer={isFreelancer}
          />
        </div>
      )}
    </div>
  );
};

export default MilestoneTimeline;
