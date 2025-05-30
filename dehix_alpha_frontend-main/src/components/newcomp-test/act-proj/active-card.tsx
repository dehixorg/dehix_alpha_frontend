import * as React from 'react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
interface CustomCardProps {
  heading: string;
  icon?: React.ElementType; // Assuming `icon` is a component
  content?: string;
}

const CustomCard: React.FC<CustomCardProps> = ({
  heading,
  icon: IconComponent,
  content,
}) => {
  return (
    <Card className=" sm:w-fit h-[234px] md:w-[320px] lg:w-[375px]">
      <CardHeader>
        <div className="grid grid-cols-[auto,auto] items-center ml-10">
          <CardTitle className="text-white text-3xl font-bold items-center">
            {' '}
            {heading}
          </CardTitle>
          <div className="items-center ml-4">
            {IconComponent && <IconComponent />} {/* Render icon if provided */}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="items-center ml-4 p-6">
          <h1>{content}</h1>
        </div>
      </CardContent>
    </Card>
  );
};

export default CustomCard;
