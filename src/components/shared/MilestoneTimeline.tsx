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
import { Milestone, Story } from '@/utils/types/Milestone';

interface MilestoneTimelineProps {
  milestones: Milestone[];
  milestoneId: string | undefined;
  handleStorySubmit?: (
    e: React.FormEvent,
    storyData: Story,
    milestoneId: string,
    isTask?: boolean,
    newTask?: any,
    selectedMilestone?: Milestone,
  ) => void;
}

const MilestoneTimeline: React.FC<MilestoneTimelineProps> = ({
  milestones,
  milestoneId,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [selectedStories, setSelectedStories] = useState<Story[] | undefined>();
  const [selectedIndex, setSelectedIndex] = useState<number | null>(0);

  useEffect(() => {
    const div = scrollRef.current;

    const handleWheel = (event: WheelEvent) => {
      if (div) {
        // Stop vertical scroll from propagating to the parent
        if (Math.abs(event.deltaX) <= Math.abs(event.deltaY)) {
          event.preventDefault(); // Prevent default vertical scrolling behavior
          div.scrollLeft += event.deltaY; // Use vertical scroll for horizontal movement
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
  }, []);

  const handelStorySelect = (milestone: any, index: number) => {
    setSelectedStories(milestone);
    setSelectedIndex(index);
    console.log('milestone' + milestone);
  };

  const truncateDescription = (text: string, maxLength: number = 50) => {
    if (text.length > maxLength) {
      return text.slice(0, maxLength) + '...';
    }
    return text;
  };

  // Add a dummy story if there's only one
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
            <div className="hidden md:block ">
              {/* Timeline Line */}
              <div className="absolute overflow-hidden left-0 right-0 top-1/2 h-1 line-bg transform -translate-y-1/2"></div>

              {/* Scrolling Timeline */}
              <div
                ref={scrollRef}
                className="relative cursor-pointer flex items-center whitespace-nowrap overflow-x-auto overflow-y-auto px-4 py-6  scrollbar-hide"
              >
                {displayMilestones.map((milestone, index) => (
                  <div
                    key={index}
                    className={`relative px-16 inline-block ${displayMilestones.length === 1 ? 'mx-auto ' : ''}`} // Center for single milestone
                    onClick={() => handelStorySelect(milestone, index)}
                  >
                    {/* Timeline Dot */}
                    <div
                      className={`absolute ${
                        milestones.length === 1 && milestone.title === 'dummy'
                          ? 'hidden'
                          : ''
                      } ${index === selectedIndex ? 'bg-[#11a0ff] border-[#11a0ff]' : 'border-[#FFF]'} top-1/2 transform -translate-y-1/2 w-5 h-5 bg-primary rounded-full border-4   group hover:bg-[#11a0ff] hover:border-[#11a0ff]`}
                      style={{
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                      }}
                    >
                      <div
                        className={`absolute left-1/2 transform -translate-x-1/2 ${
                          index % 2 === 0 ? '-top-6' : 'top-3'
                        } ${index === selectedIndex ? 'bg-[#11a0ff] text-[#11a0ff]' : ''}  group-hover:text-[#11a0ff] `}
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
      <div className="flex justify-center items-center md:hidden">
        <Carousel>
          <CarouselContent className="flex items-center w-[100vw] gap-4">
            {milestones.map((milestone, index) => (
              <CarouselItem
                key={index}
                className="flex justify-center items-center"
                onClick={() => handelStorySelect(milestone, index)}
              >
                {milestone._id !== 'dummy' && (
                  <div className="border p-6 border-line-bg bg-card rounded-lg shadow-lg relative w-full max-w-[80vw]">
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
                    <CarouselPrevious className="absolute top-1/3 left-4 transform -translate-y-1/2">
                      <button className="bg-white/20 rounded-full p-3 text-white hover:bg-white/30">
                        <IconLeft />
                      </button>
                    </CarouselPrevious>

                    <CarouselNext className="absolute top-1/3 right-4 transform -translate-y-1/2">
                      <button className="bg-white/20 rounded-full p-3 text-white hover:bg-white/30">
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
            // handleStorySubmit={handleStorySubmit}
            milestoneId={milestoneId ?? ''}
          />
        </div>
      )}
    </div>
  );
};

export default MilestoneTimeline;
