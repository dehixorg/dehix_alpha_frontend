import React from 'react';
import { Palette } from 'lucide-react';
import Image from 'next/image';

import { Button } from '../ui/button';

import {
  HoverCard,
  HoverCardTrigger,
  HoverCardContent,
} from '@/components/ui/hover-card';

interface BannerChangerPopoverProps {
  handleChangeBanner: (banner: string) => void;
}

const BannerChangerPopover: React.FC<BannerChangerPopoverProps> = ({
  handleChangeBanner,
}) => {
  const banners = [
    '/banner1.svg',
    '/banner2.svg',
    '/banner3.svg',
    '/banner4.svg',
    '/banner5.svg',
    '/banner6.svg',
    '/banner7.svg',
  ];

  return (
    <HoverCard>
      <HoverCardTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted">
          <Palette className="h-4 w-4" />
        </Button>
      </HoverCardTrigger>

      <HoverCardContent className="shadow-md rounded-md p-3">
        <div className="flex flex-nowrap justify-center gap-1">
          {banners.map((banner, index) => (
            <div
              key={index}
              onClick={() => handleChangeBanner(banner)}
              className="cursor-pointer p-1 rounded"
            >
              <Image
                src={banner}
                alt={`Banner ${index + 1}`}
                width={28} // Adjust the width as per your design
                height={28} // Adjust the height as per your design
                className="rounded-md hover:scale-110 transition-transform"
              />
            </div>
          ))}
        </div>
      </HoverCardContent>
    </HoverCard>
  );
};

export default BannerChangerPopover;
