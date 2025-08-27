// components/business/consultantCard.tsx
import React from 'react';
import { Mail, Plus, User } from 'lucide-react';

import { Separator } from '@/components/ui/separator';
import DateRange from '@/components/cards/dateRange';
import { Card } from '@/components/ui/card';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/hover-card';
import { Badge } from '@/components/ui/badge';

export interface ConsultantCardProps {
  consultantName?: string;
  domain?: string;
  email?: string;
  startDate?: Date | null;
  endDate?: Date | null;
  status?: string;
  isLastCard?: boolean;
  onAddConsultant?: () => void;
}

function ConsultantCard({
  consultantName,
  domain,
  email,
  startDate,
  endDate,
  status,
  isLastCard,
  onAddConsultant,
}: ConsultantCardProps) {
  if (isLastCard) {
    return (
      <Card
        className="flex w-full items-center justify-center h-[430px] border border-dashed border-gray-400 rounded-lg cursor-pointer hover:border-gray-300 transition-colors"
        onClick={onAddConsultant}
      >
        <Plus className="w-12 h-12 text-gray-400" />
      </Card>
    );
  }

  const truncateText = (text: string | undefined, maxLength: number) => {
    if (text && text.length > maxLength) {
      return `${text.substring(0, maxLength)}...`;
    }
    return text;
  };

  return (
    <div className="w-full min-h-[300px] bg-card relative border border-gray-700 rounded-lg shadow-md p-6 flex flex-col h-full">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <HoverCard>
          <HoverCardTrigger>
            <h2 className="text-lg cursor-pointer font-semibold">
              {truncateText(domain, 15)}
            </h2>
          </HoverCardTrigger>
          <HoverCardContent className="py-2 w-auto">
            {domain}
          </HoverCardContent>
        </HoverCard>

        <Badge className="bg-green-400 capitalize text-black text-xs px-2 py-1 rounded-md">
          {status?.toLocaleLowerCase() || 'Active'}
        </Badge>
      </div>

      {/* Content */}
      <div className="flex-grow">
        <Separator />
        
        {/* Consultant Info */}
        <div className="flex items-center mt-4 mb-4">
          <User className="w-4 h-4 mr-2" />
          <span className="text-sm">
            {consultantName || 'Consultant not assigned'}
          </span>
        </div>
        
        <div className="flex mt-6 mb-6 items-center text-sm">
          <DateRange startDate={startDate} endDate={endDate} />
        </div>

        {/* Email */}
        <div className="flex items-center text-sm mt-4">
          <Mail className="w-4 h-4 mr-2" />
          <span>{email || 'No email provided.'}</span>
        </div>
      </div>

      {/* Footer */}
      <div className="pt-3">
        <button className="w-auto bg-blue-600 text-white px-5 py-1 rounded-md hover:bg-blue-700">
          View Details
        </button>
      </div>
    </div>
  );
}

export default ConsultantCard;