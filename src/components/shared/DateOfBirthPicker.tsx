import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';

import { Calendar } from '@/components/ui/calendar';
import { FormControl } from '@/components/ui/form';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';

const DateOfBirthPicker = ({ field }: any) => {
  const today = new Date();
  const minAgeDate = new Date();
  minAgeDate.setFullYear(today.getFullYear() - 16);

  const selectedDate = field.value ? new Date(field.value) : undefined;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <FormControl>
          <Button
            variant="outline"
            className={`w-full justify-start text-left font-normal ${
              selectedDate ? '' : 'text-muted-foreground'
            }`}
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
          onSelect={(date) => field.onChange(date)}
          fromYear={1970}
          toDate={minAgeDate}
          defaultMonth={selectedDate || minAgeDate}
        />
      </PopoverContent>
    </Popover>
  );
};

export default DateOfBirthPicker;
