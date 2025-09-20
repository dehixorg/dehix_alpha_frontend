import { FC } from 'react';
import { Control, FieldValues } from 'react-hook-form';

import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form'; // Adjust import path as needed
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface TextInputProps<T extends FieldValues> {
  control: Control<T>;
  name: string;
  label: string;
  placeholder?: string;
  type?: string;
  description?: string;
  className?: string; // Add className to the props interface
}

const TextInput: FC<TextInputProps<any>> = ({
  control,
  name,
  label,
  placeholder = 'Enter value',
  type = 'text',
  description = '',
  className = '', // Default to an empty string if no className is passed
}) => {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <FormField
        control={control}
        name={name}
        render={({ field }) => (
          <FormItem>
            <FormControl>
              <Input
                placeholder={placeholder}
                type={type}
                {...field}
                className={`p-2 border rounded-md ${className}`} // Apply className here
                onChange={(e) => {
                  const value = e.target.value;
                  if (type === 'number') {
                    // Convert value to number only for 'number' type
                    field.onChange(value ? parseFloat(value) : '');
                  } else {
                    field.onChange(value);
                  }
                }}
                value={type === 'number' ? field.value ?? '' : field.value}
              />
            </FormControl>
            <FormDescription>{description}</FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};

export default TextInput;
