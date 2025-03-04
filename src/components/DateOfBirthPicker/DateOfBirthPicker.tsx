'use client';

import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { useState, useEffect } from 'react';

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
import { Dialog, DialogContent } from '@/components/ui/dialog';

const DateOfBirthPicker = ({ field }: any) => {
  const today = new Date();
  const minAgeDate = new Date(today.setFullYear(today.getFullYear() - 16));
  const selectedDate = field.value ? new Date(field.value) : undefined;

  const [openCalendar, setOpenCalendar] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(
    selectedDate?.getMonth() ?? minAgeDate.getMonth(),
  );
  const [selectedYear, setSelectedYear] = useState(
    selectedDate?.getFullYear() ?? minAgeDate.getFullYear(),
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 'd') {
        e.preventDefault();
        setOpenDialog(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleConfirm = () => {
    setOpenDialog(false);
    setOpenCalendar(true);
  };

  return (
    <>
      <Popover open={openCalendar} onOpenChange={setOpenCalendar}>
        <PopoverTrigger asChild>
          <FormControl>
            <div>
              <Button
                type="button"
                variant="outline"
                className={`w-full justify-start text-left font-normal ${selectedDate ? '' : 'text-muted-foreground'}`}
              >
                {selectedDate ? format(selectedDate, 'PPP') : 'Pick a date'}
                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
              </Button>
              <p className="text-xs text-muted-foreground mt-1 hidden md:flex">
                Press <span className="font-bold mx-1"> Ctrl + D </span> to open
                year selector
              </p>
              <p
                onClick={() => setOpenDialog(true)}
                className="text-xs text-muted-foreground mt-1 md:hidden"
              >
                <span className="text-blue-500">Tap here</span> to select a year
              </p>
            </div>
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
        <DialogContent className="max-w-md rounded-lg bg-[#111] shadow-xl p-6">
          <h2 className="text-lg text-white mb-4">Select Month & Year</h2>
          <MonthSelector
            selectedMonth={selectedMonth}
            onSelect={setSelectedMonth}
          />
          <YearSelector
            selectedYear={selectedYear}
            onSelect={setSelectedYear}
          />
          <ConfirmButton onConfirm={handleConfirm} />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default DateOfBirthPicker;
