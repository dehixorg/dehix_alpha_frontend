import React from 'react';
import ReactDatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

interface DatePickerProps {
  selected: Date | null;
  onChange: (date: Date | null) => void;
  maxDate: Date;
  placeholderText?: string;
}

const DatePicker: React.FC<DatePickerProps> = ({
  selected,
  onChange,
  maxDate,
}) => {
  return (
    <div className="w-full  px-2  border p-1.5 rounded-md">
      <ReactDatePicker
        selected={selected}
        onChange={onChange}
        maxDate={maxDate}
        placeholderText="Select a date"
        className="w-full px-2  border-none bg-transparent rounded-md shadow-none"
      />
    </div>
  );
};

export default DatePicker;
