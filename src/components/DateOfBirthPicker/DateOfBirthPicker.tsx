'use client';

import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { useState } from 'react';

import MonthSelector from './MonthSelector';
import YearSelector from './YearSelector';
import ConfirmButton from './ConfirmButton';

import { Calendar } from '@/components/ui/calendar';
import { FormControl } from '@/components/ui/form';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

const DateOfBirthPicker = ({ field }: any) => {
  const today = new Date();
  const minAgeDate = new Date(today.setFullYear(today.getFullYear() - 16));
  const selectedDate = field.value ? new Date(field.value) : undefined;

  const [openDialog, setOpenDialog] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(
    selectedDate?.getMonth() ?? minAgeDate.getMonth(),
  );
  const [selectedYear, setSelectedYear] = useState(
    selectedDate?.getFullYear() ?? minAgeDate.getFullYear(),
  );
  const [openCalendar, setOpenCalendar] = useState(false);

  const handleConfirm = () => {
    setOpenDialog(false);
    setOpenCalendar(true);
  };

  return (
    <>
      <Popover open={openCalendar} onOpenChange={setOpenCalendar}>
        <PopoverTrigger asChild>
          <FormControl>
            <Button
              type="button"
              variant="outline"
              className={cn(
                'w-full justify-start text-left font-normal',
                !selectedDate && 'text-muted-foreground',
              )}
              onClick={() => {
                setOpenCalendar(false);
                setOpenDialog(true);
              }}
            >
              {selectedDate ? format(selectedDate, 'PPP') : 'Pick a date'}
              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
            </Button>
          </FormControl>
        </PopoverTrigger>

        <PopoverContent className="w-auto p-0">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={(date) => {
              field.onChange(date);
              setOpenCalendar(false);
            }}
            fromYear={1970}
            toDate={minAgeDate}
            defaultMonth={new Date(selectedYear, selectedMonth)}
          />
        </PopoverContent>
      </Popover>

      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent className="max-w-sm mx-1">
          <DialogHeader>
            <DialogTitle>Select month and year</DialogTitle>
            <DialogDescription>
              Choose your birth month and year first, then pick the exact day.
            </DialogDescription>
          </DialogHeader>
          <MonthSelector
            selectedMonth={selectedMonth}
            onSelect={setSelectedMonth}
          />
          <YearSelector
            selectedYear={selectedYear}
            onSelect={setSelectedYear}
          />
          <DialogFooter>
            <ConfirmButton onConfirm={handleConfirm} />
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default DateOfBirthPicker;
