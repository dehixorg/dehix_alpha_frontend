'use client';
import type React from 'react';
import { useEffect, useRef, useState } from 'react';
import { IconLeft, IconRight } from 'react-day-picker';

import MilestoneCards from './MilestoneCards';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from '@/components/ui/carousel';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import type { Milestone } from '@/utils/types/Milestone';

interface MilestoneTimelineProps {
  milestones: Milestone[];
  fetchMilestones: any;
  handleStorySubmit: any;
  isFreelancer?: boolean;
  selectedIndex?: number | null;
  onMilestoneSelect?: (index: number) => void;
}

export const truncateDescription = (text: string, maxLength = 50): string => {
  if (text.length > maxLength) {
    return text.slice(0, maxLength) + '...';
  }
  return text;
};

const MilestoneTimeline: React.FC<MilestoneTimelineProps> = ({
  milestones,
  selectedIndex: externalSelectedIndex,
  onMilestoneSelect,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [internalSelectedIndex, setInternalSelectedIndex] = useState<
    number | null
  >(0);
  const [isDescOpen, setIsDescOpen] = useState(false);
  const [descContent, setDescContent] = useState('');
  const [api, setApi] = useState<CarouselApi | null>(null);

  const selectedIndex =
    externalSelectedIndex !== undefined
      ? externalSelectedIndex
      : internalSelectedIndex;

  useEffect(() => {
    const div = scrollRef.current;
    const handleWheel = (event: WheelEvent) => {
      if (!div) return;
      const maxScrollLeft = div.scrollWidth - div.clientWidth;
      if (Math.abs(event.deltaY) > Math.abs(event.deltaX)) {
        event.preventDefault();
        const next = Math.min(
          Math.max(div.scrollLeft + event.deltaY, 0),
          maxScrollLeft,
        );
        div.scrollLeft = next;
      }
    };
    if (div) div.addEventListener('wheel', handleWheel, { passive: false });
    return () => {
      if (div) div.removeEventListener('wheel', handleWheel);
    };
  }, []);

  useEffect(() => {
    if (!api) return;
    const onSelect = () => {
      const idx = api.selectedScrollSnap();
      if (onMilestoneSelect) {
        onMilestoneSelect(idx);
      } else {
        setInternalSelectedIndex(idx);
      }
    };
    api.on('select', onSelect);
    api.on('reInit', onSelect);

    return () => {
      api.off?.('select', onSelect);
      api.off?.('reInit', onSelect);
    };
  }, [api, onMilestoneSelect]);

  useEffect(() => {
    if (api != null && externalSelectedIndex != null) {
      api.scrollTo(externalSelectedIndex);
    }
  }, [api, externalSelectedIndex]);

  const handleStorySelect = (_milestone: any, index: number) => {
    if (index < 0 || index >= milestones.length) return;
    if (onMilestoneSelect) {
      onMilestoneSelect(index);
    } else {
      setInternalSelectedIndex(index);
    }

    // Ensure carousel scrolls to the selected index on mobile
    if (api && index !== undefined) {
      api.scrollTo(index);
    }
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
    <div className="w-full max-w-full">
      <div className="w-full max-w-full mx-auto px-2 py-4 relative">
        {/* Timeline for larger screens */}
        <ScrollArea className="w-full max-w-full whitespace-nowrap rounded-md border overflow-hidden">
          {milestones && (
            <div
              ref={scrollRef}
              className="hidden md:block w-full max-w-full overflow-x-auto overflow-y-hidden"
            >
              {/* Timeline Line */}
              <div className="absolute left-0 right-0 top-1/2 h-1 line-bg bg-gray-500 transform -translate-y-1/2 max-w-full"></div>

              {/* Scrolling Timeline */}
              <div className="relative cursor-pointer flex items-center whitespace-nowrap overflow-x-auto overflow-y-hidden px-4 py-6 no-scrollbar max-w-full">
                {displayMilestones.map((milestone, index) => (
                  <div
                    key={index}
                    className={`relative group px-8 lg:px-16 inline-block flex-shrink-0 ${displayMilestones.length === 1 ? 'mx-auto ' : ''}`}
                    onClick={() => handleStorySelect(milestone, index)}
                  >
                    {/* Timeline Dot */}
                    <div
                      className={`absolute ${milestones.length === 1 && milestone.title === 'dummy' ? 'hidden' : ''} ${
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
      <div className="flex pb-4 justify-center items-center md:hidden w-full max-w-full">
        <div className="w-full max-w-full px-2">
          <Carousel className="w-full max-w-full" setApi={setApi}>
            <CarouselContent className="flex min-h-[200px] items-center w-full max-w-full gap-4">
              {milestones.map((milestone, index) => (
                <CarouselItem
                  key={index}
                  className="flex relative justify-center top-0 h-auto items-center w-full max-w-full"
                  onClick={() => handleStorySelect(milestone, index)}
                >
                  {milestone._id !== 'dummy' && (
                    <div className="border p-6 border-line-bg rounded-lg shadow-lg w-full max-w-[85vw]">
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
                          <div className="flex items-center justify-center gap-1">
                            <button
                              className="p-0.5 h-auto bg-transparent border-none cursor-pointer hover:bg-gray-100 rounded"
                              onClick={(e) => {
                                e.stopPropagation();
                                setDescContent(milestone.description || '');
                                setIsDescOpen(true);
                              }}
                            >
                              <svg
                                className="w-3 h-3"
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
                      <CarouselPrevious className="absolute top-[117%] left-12 transform -translate-y-1/2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleStorySelect(milestone, index - 1);
                          }}
                          className="bg-white/20 rounded-full p-3 text-white hover:bg-white/30"
                          disabled={index === 0}
                        >
                          <IconLeft />
                        </button>
                      </CarouselPrevious>
                      <CarouselNext className="absolute top-[117%] right-8 transform -translate-y-1/2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleStorySelect(milestone, index + 1);
                          }}
                          className={`bg-white/20 rounded-full p-3 text-white ${index === milestones.length - 1 ? 'cursor-not-allowed' : 'hover:bg-white/30'}`}
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
      </div>

      {/* Shared dialog for mobile milestone description */}
      <Dialog open={isDescOpen} onOpenChange={setIsDescOpen}>
        <DialogContent className="w-[90vw] max-w-full md:w-auto">
          <DialogHeader>
            <DialogTitle>Description</DialogTitle>
            <DialogDescription asChild>
              <div className="text-sm whitespace-pre-wrap leading-relaxed mt-2 max-w-full break-words">
                {descContent}
              </div>
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MilestoneTimeline;
