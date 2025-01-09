'use client';

import * as React from 'react';
import { format } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';

interface DatePickerProps {
    selected: Date | null;
    onChange: (date: Date | null) => void;
    placeholderText?: string;
    className?: string;
}

export function MilestoneDatePicker({ selected, onChange, placeholderText = 'Pick a date', className }: DatePickerProps) {
    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button
                    variant={'outline'}
                    className={cn(
                        'w-[280px] justify-start text-left font-normal',
                        !selected && 'text-muted-foreground',
                        className
                    )}
                >
                    <div className='flex justify-center'>
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {selected ? format(selected, 'PPP') : <span>{placeholderText}</span>}
                    </div>
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 text-xs ">
                <Calendar
                    mode="single"
                    selected={selected ?? undefined}
                    onSelect={(date) => onChange(date ?? null)}
                    initialFocus
                />
            </PopoverContent>
        </Popover>
    );
}