import React from 'react';
import { Control, FieldValues } from 'react-hook-form';

import countries from '../../../country-codes.json';

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
} from '@/components/ui/select';
import {
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';

interface PhoneNumberFormProps<T extends FieldValues> {
  code: string;
  setCode: (value: string) => void;
  control: Control<T>;
}

const PhoneNumberForm: React.FC<PhoneNumberFormProps<any>> = ({
  code,
  setCode,
  control,
}) => {
  // Find the current country details based on code
  const country = countries.find((c) => c.code === code) || countries[0];

  const handleCountryChange = (value: string) => {
    setCode(value);
  };

  return (
    <FormField
      control={control}
      name="phone"
      render={({ field }) => (
        <FormItem className="flex-1">
          <div className="flex flex-col items-start w-full">
            <div className="flex items-center w-full space-x-2">
              <Select onValueChange={handleCountryChange} value={code}>
                <SelectTrigger className="w-[75px] border">
                  <span>{country.dialCode}</span>
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {countries.map((country) => (
                      <SelectItem key={country.code} value={country.code}>
                        {country.name} ({country.dialCode})
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
              <FormControl>
                <Input
                  placeholder="Enter your phone number"
                  type="text" // Use 'text' type for better handling of phone numbers
                  {...field}
                  className="w-full"
                />
              </FormControl>
            </div>
          </div>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default PhoneNumberForm;
