import React from 'react';
import { Clock, ArrowRight } from 'lucide-react';

import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';

interface TimeRangeSliderProps {
  label: string;
  value: { start: string; end: string }; // HH:MM format
  onChange: (value: { start: string; end: string }) => void;
  disabled?: boolean;
  min?: string; // HH:MM format
  max?: string; // HH:MM format
  className?: string;
}

// Convert time string to minutes since midnight
const timeToMinutes = (time: string): number => {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
};

// Convert minutes since midnight to time string
const minutesToTime = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
};

// Generate time options with 30-minute intervals
const generateTimeOptions = (min: string, max: string): number[] => {
  const minMinutes = timeToMinutes(min);
  const maxMinutes = timeToMinutes(max);
  const options: number[] = [];

  for (let minutes = minMinutes; minutes <= maxMinutes; minutes += 30) {
    options.push(minutes);
  }

  return options;
};

export const TimeRangeSlider: React.FC<TimeRangeSliderProps> = ({
  label,
  value,
  onChange,
  disabled = false,
  min = '06:00',
  max = '22:00',
  className = '',
}) => {
  const startMinutes = timeToMinutes(value.start);
  const endMinutes = timeToMinutes(value.end);
  const timeOptions = generateTimeOptions(min, max);
  const minMinutes = timeToMinutes(min);
  const maxMinutes = timeToMinutes(max);

  // Find the closest valid time option
  const snapToValidTime = (minutes: number): number => {
    return timeOptions.reduce((prev, curr) =>
      Math.abs(curr - minutes) < Math.abs(prev - minutes) ? curr : prev,
    );
  };

  const snappedStartMinutes = snapToValidTime(startMinutes);
  const snappedEndMinutes = snapToValidTime(endMinutes);

  const handleSliderChange = (newValues: number[]) => {
    const [newStart, newEnd] = newValues;
    onChange({
      start: minutesToTime(newStart),
      end: minutesToTime(newEnd),
    });
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <Label className="text-sm font-medium flex items-center gap-2">
        <Clock className="h-4 w-4 text-blue-600 dark:text-blue-400" />
        {label}
      </Label>
      <div className="space-y-4">
        <div className="space-y-3">
          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
            <span>{min}</span>
            <span className="font-medium text-blue-600 dark:text-blue-400">
              {minutesToTime(snappedStartMinutes)}
            </span>
            <span>{max}</span>
          </div>
          <Slider
            value={[snappedStartMinutes, snappedEndMinutes]}
            onValueChange={handleSliderChange}
            min={minMinutes}
            max={maxMinutes}
            step={30}
            disabled={disabled}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
            <span>{min}</span>
            <span className="font-medium text-purple-600 dark:text-purple-400">
              {minutesToTime(snappedEndMinutes)}
            </span>
            <span>{max}</span>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 rounded-lg p-2">
          <div className="flex items-center gap-1">
            <span className="font-medium">Duration:</span>
            <span className="text-blue-600 dark:text-blue-400 font-medium">
              {Math.round(
                ((snappedEndMinutes - snappedStartMinutes) / 30) * 0.5,
              )}{' '}
              hours
            </span>
          </div>
          <div className="flex items-center gap-2 text-gray-500">
            <span>{minutesToTime(snappedStartMinutes)}</span>
            <ArrowRight className="h-3 w-3" />
            <span>{minutesToTime(snappedEndMinutes)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TimeRangeSlider;
