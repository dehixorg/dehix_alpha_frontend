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
import {
  InputGroup,
  InputGroupInput,
  InputGroupText,
} from '@/components/ui/input-group';

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
            <FormControl>
              <InputGroup>
                <InputGroupText className="p-0 bg-transparent">
                  <Select onValueChange={handleCountryChange} value={code}>
                    <SelectTrigger className="w-[90px] border-0 rounded-none focus:ring-0">
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
                </InputGroupText>
                <InputGroupInput
                  placeholder="Enter your phone number"
                  type="text"
                  {...field}
                  className="w-full"
                />
              </InputGroup>
            </FormControl>
          </div>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default PhoneNumberForm;
