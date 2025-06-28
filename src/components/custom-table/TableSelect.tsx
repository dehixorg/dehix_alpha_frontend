import * as React from "react";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { twMerge } from "tailwind-merge";

type Params = {
  values: number[];
  currValue: number;
  label: string;
  setCurrValue: (currValue: number) => void;
  className?: string;
};

export function TableSelect({ values, currValue, label, className, setCurrValue }: Params) {
  return (
    <div className={twMerge("flex items-center justify-start gap-2", className)}>
      <span className="inline text-xs uppercase text-gray-500">{label}</span>
      <Select onValueChange={(value) => setCurrValue(Number(value))}>
        <SelectTrigger className="w-[65px]">
          <SelectValue placeholder={currValue} />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {values.map((value) => (
              <SelectItem key={value} value={value.toString()}>
                {value}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
}
