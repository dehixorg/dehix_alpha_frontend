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
import { Dialog, DialogContent } from '@/components/ui/dialog';

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
              className={`w-full justify-start text-left font-normal ${selectedDate ? '' : 'text-muted-foreground'}`}
              onClick={() => setOpenDialog(true)}
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
        <DialogContent className="max-w-sm rounded-lg bg-[#111] mx-1 shadow-xl p-6">
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
