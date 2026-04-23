'use client';

import * as React from 'react';
import { ChevronDownIcon, Clock } from 'lucide-react';
import { format } from 'date-fns';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';

interface DateTimePickerProps {
  date?: Date;
  onDateChange?: (date: Date | undefined) => void;
  time?: string;
  onTimeChange?: (time: string) => void;
  label?: string;
  disabled?: boolean;
}

export function DateTimePicker({
  date,
  onDateChange,
  time,
  onTimeChange,
  label = 'Date & Time',
  disabled = false,
}: DateTimePickerProps) {
  const [open, setOpen] = React.useState(false);

  const handleDateSelect = (selectedDate: Date | undefined) => {
    onDateChange?.(selectedDate);
    setOpen(false);
  };

  return (
    <div className="flex flex-col gap-3">
      <Label className="px-1">{label}</Label>
      <div className="flex gap-2">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                'flex-1 justify-between font-normal',
                !date && 'text-muted-foreground',
              )}
              disabled={disabled}
            >
              {date ? format(date, 'PPP') : 'Select date'}
              <ChevronDownIcon className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto overflow-hidden p-0" align="start">
            <Calendar
              mode="single"
              selected={date}
              captionLayout="dropdown"
              onSelect={handleDateSelect}
              initialFocus
            />
          </PopoverContent>
        </Popover>

        <div className="relative">
          <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            type="time"
            value={time}
            onChange={(e) => onTimeChange?.(e.target.value)}
            className="bg-background pl-9 w-32 cursor-pointer [&::-webkit-calendar-picker-indicator]:cursor-pointer"
            disabled={disabled}
          />
        </div>
      </div>
    </div>
  );
}
