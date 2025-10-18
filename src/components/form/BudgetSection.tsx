import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { DollarSign, Clock, Calculator } from 'lucide-react';

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
  // Unique id suffix so radios don't collide across instances
  const uid = React.useId();
  const budgetType = form.watch(`profiles.${activeProfile}.budget.type`);

  return (
    <div
      className={
        className ||
        'lg:col-span-2 xl:col-span-2 border p-5 rounded-xl mb-4 card shadow-sm'
      }
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-full bg-primary/10 border border-primary flex items-center justify-center">
            <Calculator className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-semibold leading-tight">
              Project Budget
            </h3>
            <p className="text-xs text-muted-foreground">
              Choose a budget type and specify details
            </p>
          </div>
        </div>
      </div>

      <FormField
        control={form.control}
        name={`profiles.${activeProfile}.budget.type`}
        render={({ field }) => (
          <FormItem className="mb-6">
            <FormLabel>Budget Type</FormLabel>
            <FormControl>
              <RadioGroup
                onValueChange={field.onChange}
                value={field.value}
                className="flex flex-col space-y-1"
              >
                <div className="flex flex-row gap-3">
                  <label
                    htmlFor={`fixed-${uid}`}
                    className={`flex items-center gap-2 px-3 py-2 rounded-md border cursor-pointer text-sm transition-colors ${
                      budgetType === 'FIXED'
                        ? 'border-primary bg-primary/10'
                        : 'border-border hover:bg-muted/40'
                    }`}
                  >
                    <RadioGroupItem value="FIXED" id={`fixed-${uid}`} />
                    <span className="inline-flex items-center gap-1">
                      <DollarSign className="h-4 w-4" /> Fixed Price
                    </span>
                  </label>
                  <label
                    htmlFor={`hourly-${uid}`}
                    className={`flex items-center gap-2 px-3 py-2 rounded-md border cursor-pointer text-sm transition-colors ${
                      budgetType === 'HOURLY'
                        ? 'border-primary bg-primary/10'
                        : 'border-border hover:bg-muted/40'
                    }`}
                  >
                    <RadioGroupItem value="HOURLY" id={`hourly-${uid}`} />
                    <span className="inline-flex items-center gap-1">
                      <Clock className="h-4 w-4" /> Hourly Rate
                    </span>
                  </label>
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

      {/* {profileBudgetErrors && (
        <p className="text-sm text-red-600 mt-4">
          {Object.values(profileBudgetErrors || {})
            .map((err: any) => err?.message)
            .filter(Boolean)
            .join(', ')}
        </p>
      )} */}
    </div>
  );
};

export default BudgetSection;
