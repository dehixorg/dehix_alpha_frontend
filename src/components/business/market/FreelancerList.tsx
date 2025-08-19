import React from 'react';

import FreelancerCard from '@/components/opportunities/freelancer/freelancerCard';

interface FreelancerListProps {
  freelancers: any[];
}

const FreelancerList: React.FC<FreelancerListProps> = ({ freelancers }) => {
  return (
    <div className=" lg:ml-10 space-y-4 w-full">
      {freelancers.length === 0 ? (
        <p className="text-center text-xl flex justify-center items-center h-[55vh] font-semibold">
          No talent found
        </p>
      ) : (
        freelancers.map((freelancer: any, index: number) => (
          <FreelancerCard
            key={index}
            name={freelancer.firstName + ' ' + freelancer.lastName}
            skills={freelancer.skills}
            domains={freelancer.domains}
            experience={freelancer.workExperience}
            profile={freelancer.profilePic}
            userName={freelancer.userName}
            monthlyPay={freelancer.monthlyPay}
            Github={freelancer.github}
            LinkedIn={freelancer.linkedin}
          />
        ))
      )}
    </div>
  );
};

export default FreelancerList;
