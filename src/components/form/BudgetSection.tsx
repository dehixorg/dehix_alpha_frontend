import React from 'react';
import { UseFormReturn } from 'react-hook-form';

import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
} from '@/components/ui/form';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Input } from '@/components/ui/input';

type Props = {
  form: UseFormReturn<any>;
  activeProfile: number;
  className?: string;
};

const BudgetSection: React.FC<Props> = ({ form, activeProfile, className }) => {
  const budgetType = form.watch(`profiles.${activeProfile}.budget.type`);

  const profileBudgetErrors = (() => {
    const profilesErr: any = (form.formState.errors as any)?.profiles;
    if (Array.isArray(profilesErr)) {
      return profilesErr?.[activeProfile]?.budget;
    }
    return undefined;
  })();

  return (
    <div
      className={
        className ||
        'lg:col-span-2 xl:col-span-2 border p-4 rounded-md mb-4 card'
      }
    >
      <h3 className="text-lg font-medium mb-4">Project Budget</h3>

      <FormField
        control={form.control}
        name={`profiles.${activeProfile}.budget.type`}
        render={({ field }) => (
          <FormItem className="mb-6">
            <FormLabel>Budget Type</FormLabel>
            <FormControl>
              <RadioGroup
                onValueChange={field.onChange}
                defaultValue={field.value}
                className="flex flex-col space-y-1"
              >
                <div className="flex flex-row gap-4">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="FIXED" id="fixed" />
                    <label htmlFor="fixed" className="cursor-pointer">
                      Fixed Price
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="HOURLY" id="hourly" />
                    <label htmlFor="hourly" className="cursor-pointer">
                      Hourly Rate
                    </label>
                  </div>
                </div>
              </RadioGroup>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {budgetType === 'FIXED' && (
        <FormField
          control={form.control}
          name={`profiles.${activeProfile}.budget.fixedAmount`}
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-foreground">
                Fixed Budget Amount ($)
              </FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="Enter fixed amount"
                  min="1"
                  step="0.01"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Enter the total fixed price for the project
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      )}

      {budgetType === 'HOURLY' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name={`profiles.${activeProfile}.budget.hourly.minRate`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Minimum Rate ($/hour)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="Min rate"
                    min="1"
                    step="0.01"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name={`profiles.${activeProfile}.budget.hourly.maxRate`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Maximum Rate ($/hour)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="Max rate"
                    min="1"
                    step="0.01"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name={`profiles.${activeProfile}.budget.hourly.estimatedHours`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Estimated Hours</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="Estimated number of hours"
                    min="1"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Estimated total hours required for project completion
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      )}

      {profileBudgetErrors && (
        <p className="text-sm text-red-600 mt-4">
          {Object.values(profileBudgetErrors || {})
            .map((err: any) => err?.message)
            .filter(Boolean)
            .join(', ')}
        </p>
      )}
    </div>
  );
};

export default BudgetSection;
