import React from 'react';

import FreelancerCard from '@/components/opportunities/freelancer/freelancerCard';

interface FreelancerListProps {
  freelancers: any[];
}

const FreelancerList: React.FC<FreelancerListProps> = ({ freelancers }) => {
  return (
    <div className="mt-4 lg:mt-0 lg:ml-10 space-y-4 w-full">
      {freelancers.map((freelancer: any, index: number) => (
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
