'use client';

import * as React from 'react';
import { format } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface DatePickerProps {
  value?: string;
  onChange: (date: string) => void;
  disabled?: boolean;
  max?: string;
}

interface MonthSelectorProps {
  selectedMonth: number;
  onSelect: (month: number) => void;
}

const MonthSelector = ({ selectedMonth, onSelect }: MonthSelectorProps) => {
  return (
    <div className="grid grid-cols-3 gap-2">
      {Array.from({ length: 12 }, (_, i) =>
        format(new Date(2000, i, 1), 'MMMM'),
      ).map((month, i) => (
        <Button
          type="button"
          key={month}
          onClick={() => onSelect(i)}
          variant={selectedMonth === i ? 'default' : 'outline'}
          className={cn(
            'h-9 justify-center px-2 text-xs sm:text-sm',
            selectedMonth !== i && 'text-foreground',
          )}
        >
          {month}
        </Button>
      ))}
    </div>
  );
};

interface YearSelectorProps {
  selectedYear: number;
  onSelect: (year: number) => void;
  maxDate?: Date;
}

const YearSelector = ({
  selectedYear,
  onSelect,
  maxDate,
}: YearSelectorProps) => {
  const currentYear = new Date().getFullYear();
  const maxYear = maxDate ? maxDate.getFullYear() : currentYear + 10;
  // Generate options from 1950 to maxYear, ordered descending (recent years first)
  const yearOptions = Array.from(
    { length: maxYear - 1950 + 1 },
    (_, i) => maxYear - i,
  );

  return (
    <Select
      value={String(selectedYear)}
      onValueChange={(value) => onSelect(Number(value))}
    >
      <SelectTrigger className="w-full">
        <SelectValue placeholder="Select year" />
      </SelectTrigger>
      <SelectContent className="max-h-[200px] overflow-y-auto">
        {yearOptions.map((year) => (
          <SelectItem key={year} value={String(year)}>
            {year}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export function DatePicker({
  value,
  onChange,
  disabled,
  max,
}: DatePickerProps) {
  const date = value ? new Date(value) : undefined;
  const maxDate = max ? new Date(max) : undefined;
  const today = new Date();

  // Determine initial month and year values
  const defaultYear = date
    ? date.getFullYear()
    : maxDate
      ? Math.min(today.getFullYear(), maxDate.getFullYear())
      : today.getFullYear();
  const defaultMonth = date
    ? date.getMonth()
    : maxDate
      ? Math.min(today.getMonth(), maxDate.getMonth())
      : today.getMonth();

  const [openDialog, setOpenDialog] = React.useState(false);
  const [openCalendar, setOpenCalendar] = React.useState(false);
  const [selectedMonth, setSelectedMonth] = React.useState(defaultMonth);
  const [selectedYear, setSelectedYear] = React.useState(defaultYear);

  // Sync state if date changes externally
  React.useEffect(() => {
    if (date) {
      setSelectedMonth(date.getMonth());
      setSelectedYear(date.getFullYear());
    }
  }, [value]);

  const isDateDisabled = (date: Date) => {
    if (disabled) return true;
    if (maxDate && date > maxDate) return true;
    return false;
  };

  const handleConfirm = () => {
    setOpenDialog(false);
    setOpenCalendar(true);
  };

  return (
    <>
      <Popover open={openCalendar} onOpenChange={setOpenCalendar}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            disabled={disabled}
            className={cn(
              'w-full justify-start text-left font-normal',
              !date && 'text-muted-foreground',
            )}
            onClick={() => {
              if (!disabled) {
                setOpenCalendar(false);
                setOpenDialog(true);
              }
            }}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date ? format(date, 'PPP') : <span>Pick a date</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={date}
            onSelect={(date) => {
              if (date) {
                onChange(date.toISOString());
              }
              setOpenCalendar(false);
            }}
            disabled={isDateDisabled}
            initialFocus
            defaultMonth={new Date(selectedYear, selectedMonth)}
          />
        </PopoverContent>
      </Popover>

      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent className="max-w-sm mx-auto">
          <DialogHeader>
            <DialogTitle>Select month and year</DialogTitle>
            <DialogDescription>
              Choose the month and year first, then pick the exact day.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <MonthSelector
              selectedMonth={selectedMonth}
              onSelect={setSelectedMonth}
            />
            <YearSelector
              selectedYear={selectedYear}
              onSelect={setSelectedYear}
              maxDate={maxDate}
            />
          </div>
          <DialogFooter>
            <Button type="button" onClick={handleConfirm} className="w-full">
              Continue
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
