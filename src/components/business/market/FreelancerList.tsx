import React from 'react';
import FreelancerCard from '@/components/opportunities/freelancer/freelancerCard';
import FreelancerCardSkeleton from '@/components/skeletons/freelancerCardSkeleton';

interface FreelancerListProps {
  freelancers: any[];
  isLoading: boolean; // Add a loading state
}

const FreelancerList: React.FC<FreelancerListProps> = ({ freelancers, isLoading }) => {
  return (
    <div className="mt-4 p-4 lg:ml-10 space-y-4 w-full">
      {isLoading
        ? Array.from({ length: 5 }).map((_, index) => ( // Adjust the number of skeletons as needed
            <FreelancerCardSkeleton key={index} />
          ))
        : freelancers.map((freelancer: any, index: number) => (
            <FreelancerCard
              key={index}
              name={freelancer.firstName + ' ' + freelancer.lastName}
              skills={freelancer.skills}
              domains={freelancer.domains}
              experience={freelancer.workExperience}
            />
          ))}
    </div>
  );
};

export default FreelancerList;
