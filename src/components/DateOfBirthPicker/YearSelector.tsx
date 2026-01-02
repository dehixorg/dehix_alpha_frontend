import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface YearSelectorProps {
  selectedYear: number;
  onSelect: (year: number) => void;
}

const YearSelector = ({ selectedYear, onSelect }: YearSelectorProps) => {
  const currentYear = new Date().getFullYear();
  const minYear = currentYear - 16;
  const yearOptions = Array.from(
    { length: minYear - 1970 + 1 },
    (_, i) => minYear - i,
  ).reverse();

  return (
    <Select
      value={String(selectedYear)}
      onValueChange={(value) => onSelect(Number(value))}
    >
      <SelectTrigger className="w-full">
        <SelectValue placeholder="Select year" />
      </SelectTrigger>
      <SelectContent>
        {yearOptions.map((year) => (
          <SelectItem key={year} value={String(year)}>
            {year}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default YearSelector;
