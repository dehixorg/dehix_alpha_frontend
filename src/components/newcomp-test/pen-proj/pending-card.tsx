// CardWithForm.tsx

import * as React from 'react';
import { ArrowDownNarrowWide } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface CardWithFormProps {
  title: string;
  itemCounts: {
    total: number;
    low: number;
    medium: number;
    high: number;
  };
}

const CardWithForm: React.FC<CardWithFormProps> = ({ title, itemCounts }) => {
  return (
    <Card className="sm:w-fit md:w-[320px] lg:w-[375px]">
      <CardHeader>
        <div className="grid grid-cols-[auto,auto] items-center ml-9">
          <CardTitle className="text-white text-3xl font-bold">
            {title}
          </CardTitle>
          <ArrowDownNarrowWide className="mr-10" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center justify-center text-white text-4xl font-bold">
            +{itemCounts.total}
          </div>
          <div className="grid grid-rows-3 gap-2">
            <div className="flex items-center">
              <span>{itemCounts.low}</span>
              <span className="badge bg-green-500 text-white text-xs px-2 py-1 rounded-md ml-2">
                Low
              </span>
            </div>
            <div className="flex items-center">
              <span>{itemCounts.medium}</span>
              <span className="badge bg-yellow-500 text-white text-xs px-2 py-1 rounded-md ml-2">
                Medium
              </span>
            </div>
            <div className="flex items-center">
              <span>{itemCounts.high}</span>
              <span className="badge bg-red-500 text-white text-xs px-2 py-1 rounded-md ml-2">
                High
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CardWithForm;
