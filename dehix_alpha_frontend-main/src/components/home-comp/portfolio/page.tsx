import Image from 'next/image';
import React from 'react';

interface PortfolioItem {
  image: string;
  title: string;
  description: string;
}

interface PortfolioProps {
  items: PortfolioItem[];
}

const Portfolio: React.FC<PortfolioProps> = ({ items }) => {
  return (
    <div className="container max-w-3xl mx-auto text-center">
      <h2 className="text-2xl font-bold text-cyan-500 sm:text-3xl">
        Our Portfolio
      </h2>
      <div className="grid grid-cols-1 gap-8 mt-10 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item, index) => (
          <div key={index} className="overflow-hidden rounded-lg">
            <Image
              alt={item.title}
              className="object-cover w-full h-auto"
              height={300}
              src={item.image}
              width={400}
              style={{ objectFit: 'cover' }}
            />
            <div className="bg-gray-900 p-4">
              <h3 className="text-xl font-bold text-cyan-500">{item.title}</h3>
              <p className="mt-2 text-base text-white">{item.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Portfolio;
