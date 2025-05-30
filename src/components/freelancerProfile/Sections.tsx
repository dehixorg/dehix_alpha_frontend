import React from 'react';

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';

interface SectionsProps {
  sections: {
    title: string;
    key: string;
    data: { _id: string; name: string }[];
  }[];
}

const Sections: React.FC<SectionsProps> = ({ sections }) => {
  return (
    <section className="mt-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sections.map((section) => (
          <Card
            className="col-span-1 pt-0 px-4 py-1 bg-black text-white dark:bg-[#666565]"
            key={section.key}
          >
            <h2 className="text-2xl font-semibold mb-1 mt-3">
              {section.title}
            </h2>
            <ScrollArea className="whitespace-nowrap overflow-x-auto">
              {section.data.map((item) => (
                <Badge
                  key={item._id}
                  className="px-3 mr-2 py-1 mb-3 cursor-pointer bg-white text-black rounded-full shadow-md"
                >
                  {item.name.toUpperCase()}
                </Badge>
              ))}
              <ScrollBar orientation="horizontal" className="cursor-pointer" />
            </ScrollArea>
          </Card>
        ))}
      </div>
    </section>
  );
};

export default Sections;
