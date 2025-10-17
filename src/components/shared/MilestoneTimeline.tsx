'use client';
import type React from 'react';
import { useEffect, useRef, useState } from 'react';
// Use lucide-react icons instead of react-day-picker
import { ChevronLeft, ChevronRight, Info } from 'lucide-react';

import MilestoneCards from './MilestoneCards';

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
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
    <Card className="bg-muted-foreground/20 dark:bg-muted/20">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-4">
          <CardTitle className="text-base md:text-lg">
            Milestone timeline
          </CardTitle>
          <Badge variant="secondary" className="rounded-full">
            {milestones.length} total
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {/* Timeline for larger screens */}
        <ScrollArea className="w-full max-w-full whitespace-nowrap rounded-md border overflow-hidden relative">
          {/* Timeline line */}
          <Separator className="absolute left-0 right-0 top-1/2 -translate-y-1/2 bg-black dark:bg-white" />

          {milestones && (
            <div
              ref={scrollRef}
              className="hidden md:block w-full max-w-full overflow-x-auto overflow-y-hidden"
            >
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
                          ? 'bg-muted border-card'
                          : 'border-card'
                      } top-1/2 transform -translate-y-1/2 w-5 h-5 bg-muted rounded-full border-4 group group-hover:bg-muted group-hover:border-muted] `}
                      style={{
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                      }}
                    >
                      <div
                        className={`absolute left-1/2 transform -translate-x-1/2 ${
                          index % 2 === 0 ? '-top-6' : 'top-3'
                        } ${index === selectedIndex ? 'bg-muted text-muted' : ''}  group-hover:text-[#11a0ff] overflow-hidden `}
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
                      <Card className="p-6 w-full max-w-[85vw]">
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
                            <div className="flex items-center justify-center gap-1 mt-1">
                              <Popover>
                                <PopoverTrigger asChild>
                                  <Button
                                    size="icon"
                                    variant="ghost"
                                    className="h-7 w-7"
                                    onClick={(e) => e.stopPropagation()}
                                    aria-label="View description"
                                  >
                                    <Info className="h-4 w-4" />
                                  </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-72 text-sm whitespace-pre-wrap leading-relaxed">
                                  {milestone.description}
                                </PopoverContent>
                              </Popover>
                            </div>
                          )}
                        </div>
                        <CarouselPrevious className="absolute top-[117%] left-12 transform -translate-y-1/2">
                          <Button
                            size="icon"
                            variant="secondary"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleStorySelect(milestone, index - 1);
                            }}
                            className="rounded-full bg-white/20 hover:bg-white/30 text-white"
                            disabled={index === 0}
                            aria-label="Previous milestone"
                          >
                            <ChevronLeft className="h-4 w-4" />
                          </Button>
                        </CarouselPrevious>
                        <CarouselNext className="absolute top-[117%] right-8 transform -translate-y-1/2">
                          <Button
                            size="icon"
                            variant="secondary"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleStorySelect(milestone, index + 1);
                            }}
                            className={`rounded-full bg-white/20 text-white ${index === milestones.length - 1 ? '' : 'hover:bg-white/30'}`}
                            disabled={index === milestones.length - 1}
                            aria-label="Next milestone"
                          >
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                        </CarouselNext>
                      </Card>
                    )}
                  </CarouselItem>
                ))}
              </CarouselContent>
            </Carousel>
          </div>
        </div>

        {/* Popover now handles description display for mobile */}
      </CardContent>
    </Card>
  );
};

export default MilestoneTimeline;
