import React, { useMemo, useRef, useState } from 'react';
import { ChevronsUpDown, X } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
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
import { ScrollArea } from '@/components/ui/scroll-area';

type Option = Record<string, any>;

type SelectTagPickerProps = {
  label: string;
  options: Option[];
  selected: { name: string; interviewerStatus?: string }[];
  onAdd: (value: string) => void;
  onRemove: (name: string) => void;
  className?: string;
  optionLabelKey?: string;
  selectedNameKey?: string;
  selectPlaceholder?: string;
  searchPlaceholder?: string;
  showOtherOption?: boolean;
  onOtherClick?: () => void;
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
  showOtherOption = false,
  onOtherClick,
}) => {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const removeLockRef = useRef(false);

  const safeRemove = (value: string) => {
    if (removeLockRef.current) return;
    removeLockRef.current = true;
    try {
      onRemove(value);
    } finally {
      // release lock on next tick to coalesce duplicate events within same interaction
      setTimeout(() => {
        removeLockRef.current = false;
      }, 0);
    }
  };

  const filteredOptions = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return (options || []).filter((opt) => {
      const label = String(opt?.[optionLabelKey] ?? '').toLowerCase();
      return label.includes(q);
    });
  }, [options, selected, optionLabelKey, selectedNameKey, searchQuery]);

  const isSelected = (value: string) =>
    (selected || []).some((s) => String((s as any)[selectedNameKey]) === value);

  const toggleValue = (value: string) => {
    if (isSelected(value)) {
      safeRemove(value);
    } else {
      onAdd(value);
    }
  };

  return (
    <div className={className}>
      <Label>{label}</Label>
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
                <ScrollArea className="h-60">
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
                        </CommandItem>
                      );
                    })}
                  </CommandGroup>
                  {showOtherOption && (
                    <CommandGroup>
                      <CommandItem
                        value="__other__"
                        onSelect={() => {
                          if (onOtherClick) onOtherClick();
                          setOpen(false);
                        }}
                        className="flex items-center gap-2 text-primary"
                      >
                        <span className="flex-1">Other...</span>
                      </CommandItem>
                    </CommandGroup>
                  )}
                </ScrollArea>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>

      <div className="flex flex-wrap gap-2 mt-5">
        {(selected || []).map((item, index) => {
          const itemName = String((item as any)[selectedNameKey]);
          const isNonDeletable = item.interviewerStatus === 'NOT_APPLIED' || item.interviewerStatus === 'REJECTED';
          
          return (
            <Badge
              className="rounded-md uppercase text-xs font-normal dark:bg-muted bg-muted-foreground/30 flex items-center px-2 py-1 text-black dark:text-white"
              key={`${itemName}-${index}`}
            >
              {itemName}
              {!isNonDeletable && (
                <X
                  className="ml-1 h-3 w-3 cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    safeRemove(itemName);
                  }}
                />
              )}
            </Badge>
          );
        })}
      </div>
    </div>
  );
};

export default SelectTagPicker;
