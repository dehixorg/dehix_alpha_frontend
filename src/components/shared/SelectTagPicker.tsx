import React, { useMemo, useState } from 'react';
import { Check, ChevronsUpDown, X } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FormLabel } from '@/components/ui/form';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Checkbox } from '@/components/ui/checkbox';

type Option = Record<string, any>;

type SelectTagPickerProps = {
  label: string;
  options: Option[];
  selected: { name: string }[];
  onAdd: (value: string) => void;
  onRemove: (name: string) => void;
  className?: string;
  optionLabelKey?: string;
  selectedNameKey?: string;
  selectPlaceholder?: string;
  searchPlaceholder?: string;
};

const SelectTagPicker: React.FC<SelectTagPickerProps> = ({
  label = '',
  options = [],
  selected = [],
  onAdd = () => {},
  onRemove = () => {},
  className,
  optionLabelKey = 'label',
  selectedNameKey = 'name',
  selectPlaceholder = 'Select',
  searchPlaceholder = 'Search',
}) => {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredOptions = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return (options || []).filter((opt) => {
      const label = String(opt?.[optionLabelKey] ?? '').toLowerCase();
      const alreadySelected = (selected || []).some(
        (s) =>
          String((s as any)[selectedNameKey]) === String(opt?.[optionLabelKey]),
      );
      return label.includes(q) && !alreadySelected;
    });
  }, [options, selected, optionLabelKey, selectedNameKey, searchQuery]);

  const isSelected = (value: string) =>
    (selected || []).some((s) => String((s as any)[selectedNameKey]) === value);

  const toggleValue = (value: string) => {
    if (isSelected(value)) {
      onRemove(value);
    } else {
      onAdd(value);
    }
  };

  return (
    <div className={className}>
      <FormLabel>{label}</FormLabel>
      <div className="mt-2">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className="w-full justify-between"
            >
              {selected?.length
                ? `${selected.length} selected`
                : selectPlaceholder}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="p-0 w-[--radix-popover-trigger-width]">
            <Command shouldFilter={false}>
              <CommandInput
                placeholder={searchPlaceholder}
                value={searchQuery}
                onValueChange={setSearchQuery}
              />
              <CommandEmpty>No items found.</CommandEmpty>
              <CommandList>
                <CommandGroup>
                  {(filteredOptions || []).map((opt, idx) => {
                    const val = String(opt?.[optionLabelKey]);
                    const checked = isSelected(val);
                    return (
                      <CommandItem
                        key={`${val}-${idx}`}
                        value={val}
                        onSelect={() => toggleValue(val)}
                        className="flex items-center gap-2"
                      >
                        <Checkbox
                          checked={checked}
                          className="pointer-events-none"
                        />
                        <span className="flex-1">{val}</span>
                        {checked && <Check className="h-4 w-4 text-primary" />}
                      </CommandItem>
                    );
                  })}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>

      <div className="flex flex-wrap gap-2 mt-5">
        {(selected || []).map((item, index) => (
          <Badge
            className="uppercase text-xs font-normal dark:bg-muted bg-muted-foreground/30 dark:hover:bg-muted/20 hover:bg-muted-foreground/20 flex items-center px-2 py-1 text-black dark:text-white"
            key={`${String((item as any)[selectedNameKey])}-${index}`}
          >
            {String((item as any)[selectedNameKey])}
            <button
              type="button"
              onClick={() => onRemove(String((item as any)[selectedNameKey]))}
              className="ml-2 text-red-500 hover:text-red-700"
              aria-label={`Remove ${String((item as any)[selectedNameKey])}`}
            >
              <X className="h-4 w-4" />
            </button>
          </Badge>
        ))}
      </div>
    </div>
  );
};

export default SelectTagPicker;
