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

export const formatMilestoneDate = (milestone: any): string => {
  if (!milestone) return '';

  const parseSingleDate = (raw: any): Date | null => {
    if (!raw) return null;
    if (typeof raw === 'string' || typeof raw === 'number') {
      const d = new Date(raw);
      return isNaN(d.getTime()) ? null : d;
    }
    if (raw instanceof Date) return isNaN(raw.getTime()) ? null : raw;
    if (typeof raw === 'object') {
      if (raw.expected) {
        const d = new Date(raw.expected);
        if (!isNaN(d.getTime())) return d;
      }
      if (raw.actual) {
        const d = new Date(raw.actual);
        if (!isNaN(d.getTime())) return d;
      }
    }
    return null;
  };

  const startD = parseSingleDate(milestone.startDate);
  const endD = parseSingleDate(milestone.endDate);
  const createdD = parseSingleDate(milestone.createdAt);

  const formatShort = (d: Date) =>
    d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });

  if (startD && endD) {
    if (startD.toDateString() === endD.toDateString()) {
      return formatShort(startD);
    }
    return `${formatShort(startD)} - ${formatShort(endD)}`;
  }
  if (startD) return formatShort(startD);
  if (endD) return formatShort(endD);
  if (createdD) return formatShort(createdD);

  return '';
};

const MilestoneTimeline: React.FC<MilestoneTimelineProps> = ({
  milestones,
  selectedIndex: externalSelectedIndex,
  onMilestoneSelect,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<Record<number, HTMLDivElement | null>>({});
  const [internalSelectedIndex, setInternalSelectedIndex] = useState<
    number | null
  >(0);

  const [api, setApi] = useState<CarouselApi | null>(null);

  const selectedIndex =
    externalSelectedIndex !== undefined
      ? externalSelectedIndex
      : internalSelectedIndex;

  const scrollToPhaseOnDesktop = (index: number) => {
    const itemEl = itemRefs.current[index];
    const container = scrollRef.current;
    if (itemEl && container) {
      const itemLeft = itemEl.offsetLeft;
      const itemWidth = itemEl.clientWidth;
      const containerWidth = container.clientWidth;
      const targetLeft = itemLeft - containerWidth / 2 + itemWidth / 2;
      container.scrollTo({
        left: Math.max(0, targetLeft),
        behavior: 'smooth',
      });
    }
  };

  useEffect(() => {
    if (selectedIndex !== null && selectedIndex !== undefined) {
      scrollToPhaseOnDesktop(selectedIndex);
    }
  }, [selectedIndex]);

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

    // Ensure carousel / scroll container moves to the selected index
    if (api && index !== undefined) {
      api.scrollTo(index);
    }
    scrollToPhaseOnDesktop(index);
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
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <CardTitle className="text-base md:text-lg font-bold">
              Milestone timeline
            </CardTitle>
            <Badge
              variant="secondary"
              className="rounded-full px-2.5 py-0.5 text-xs font-semibold bg-muted text-muted-foreground"
            >
              {milestones.length} total
            </Badge>
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={selectedIndex === 0 || selectedIndex === null}
              onClick={() => {
                if (selectedIndex !== null && selectedIndex > 0) {
                  handleStorySelect(
                    milestones[selectedIndex - 1],
                    selectedIndex - 1,
                  );
                }
              }}
              className="h-8 px-2.5 text-xs font-medium gap-1.5 rounded-lg border-border/60 hover:bg-accent disabled:opacity-40"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
              <span>Previous Phase</span>
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={
                selectedIndex === null || selectedIndex >= milestones.length - 1
              }
              onClick={() => {
                if (
                  selectedIndex !== null &&
                  selectedIndex < milestones.length - 1
                ) {
                  handleStorySelect(
                    milestones[selectedIndex + 1],
                    selectedIndex + 1,
                  );
                }
              }}
              className="h-8 px-2.5 text-xs font-medium gap-1.5 rounded-lg border-border/60 hover:bg-accent disabled:opacity-40"
            >
              <span>Next Phase</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {/* Timeline for larger screens */}
        {milestones && (
          <div
            ref={scrollRef}
            className="hidden md:flex w-full overflow-x-auto overflow-y-hidden py-4 px-2 no-scrollbar scroll-smooth relative rounded-xl border bg-card/30"
            style={{ scrollbarWidth: 'none' }}
          >
            <div className="flex items-start w-max min-w-full relative h-[360px]">
              {displayMilestones.map((milestone, index) => {
                const isDummy = milestone.title === 'dummy';
                const isTopCard = index % 2 === 0;
                const isSelected = index === selectedIndex;

                return (
                  <div
                    key={index}
                    ref={(el) => {
                      itemRefs.current[index] = el;
                    }}
                    className={`flex flex-col items-center group shrink-0 cursor-pointer min-w-[260px] md:min-w-[280px] max-w-[340px] h-[360px] relative z-10 ${
                      isDummy ? 'invisible' : ''
                    }`}
                    onClick={() =>
                      !isDummy && handleStorySelect(milestone, index)
                    }
                  >
                    {/* TOP ROW: Height 135px (Holds top card or empty space) */}
                    <div className="w-full h-[135px] flex items-end justify-center px-3">
                      {isTopCard && !isDummy ? (
                        <MilestoneCards
                          date={formatMilestoneDate(milestone)}
                          title={milestone.title}
                          summary={milestone.description}
                          position="top"
                          isSelected={isSelected}
                        />
                      ) : (
                        <div className="h-full w-full" />
                      )}
                    </div>

                    {/* TOP CONNECTOR LINE SLOT: Height 31px */}
                    <div className="w-full h-[31px] flex justify-center items-stretch relative">
                      {isTopCard && !isDummy && (
                        <div
                          className={`w-0.5 h-full transition-colors ${
                            isSelected
                              ? 'bg-primary w-1 shadow-xs'
                              : 'bg-border/80 group-hover:bg-primary/80'
                          }`}
                        />
                      )}
                    </div>

                    {/* CENTER AXIS ROW: Height 28px (Center Dot sits at Y=180px) */}
                    <div className="w-full h-[28px] flex items-center justify-center relative">
                      {/* Continuous horizontal timeline line segment across each column */}
                      {!isDummy && (
                        <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-[2px] bg-border/80 dark:bg-muted-foreground/40 z-0" />
                      )}

                      <div
                        className={`relative z-10 w-4 h-4 rounded-full border-2 transition-all shadow-xs ${
                          isSelected
                            ? 'bg-primary border-background ring-4 ring-primary/30 scale-125'
                            : 'bg-card border-muted-foreground/60 group-hover:border-primary group-hover:bg-primary/20'
                        }`}
                      />
                    </div>

                    {/* BOTTOM CONNECTOR LINE SLOT: Height 31px */}
                    <div className="w-full h-[31px] flex justify-center items-stretch relative">
                      {!isTopCard && !isDummy && (
                        <div
                          className={`w-0.5 h-full transition-colors ${
                            isSelected
                              ? 'bg-primary w-1 shadow-xs'
                              : 'bg-border/80 group-hover:bg-primary/80'
                          }`}
                        />
                      )}
                    </div>

                    {/* BOTTOM ROW: Height 135px (Holds bottom card or empty space) */}
                    <div className="w-full h-[135px] flex items-start justify-center px-3">
                      {!isTopCard && !isDummy ? (
                        <MilestoneCards
                          date={formatMilestoneDate(milestone)}
                          title={milestone.title}
                          summary={milestone.description}
                          position="bottom"
                          isSelected={isSelected}
                        />
                      ) : (
                        <div className="h-full w-full" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

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
                          <p className="text-xs font-medium text-muted-foreground">
                            {formatMilestoneDate(milestone)}
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
