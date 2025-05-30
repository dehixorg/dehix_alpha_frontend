import { format } from 'date-fns';

interface MonthSelectorProps {
  selectedMonth: number;
  onSelect: (month: number) => void;
}

const MonthSelector = ({ selectedMonth, onSelect }: MonthSelectorProps) => {
  return (
    <div className="grid grid-cols-3 gap-4 mb-4">
      {Array.from({ length: 12 }, (_, i) =>
        format(new Date(2000, i, 1), 'MMMM'),
      ).map((month, i) => (
        <button
          key={month}
          onClick={() => onSelect(i)}
          className={`p-2 text-sm rounded-lg hover:bg-blue-600 transition ${
            selectedMonth === i ? 'bg-blue-500 text-white' : 'text-white'
          }`}
        >
          {month}
        </button>
      ))}
    </div>
  );
};

export default MonthSelector;
