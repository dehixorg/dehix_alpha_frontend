import { format } from 'date-fns';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface MonthSelectorProps {
  selectedMonth: number;
  onSelect: (month: number) => void;
}

const MonthSelector = ({ selectedMonth, onSelect }: MonthSelectorProps) => {
  return (
    <div className="grid grid-cols-3 gap-2">
      {Array.from({ length: 12 }, (_, i) =>
        format(new Date(2000, i, 1), 'MMMM'),
      ).map((month, i) => (
        <Button
          type="button"
          key={month}
          onClick={() => onSelect(i)}
          variant={selectedMonth === i ? 'default' : 'outline'}
          className={cn(
            'h-9 justify-center px-2 text-xs sm:text-sm',
            selectedMonth !== i && 'text-foreground',
          )}
        >
          {month}
        </Button>
      ))}
    </div>
  );
};

export default MonthSelector;
