import React from 'react';

import FreelancerCard from '@/components/opportunities/freelancer/freelancerCard';

interface FreelancerListProps {
  freelancers: any[];
  isLoading?: boolean;
}

const FreelancerList: React.FC<FreelancerListProps> = ({
  freelancers,
  isLoading = false,
}) => {
  return (
    <div className="lg:ml-10 space-y-4 w-full">
      {isLoading ? (
        // Skeleton Loader
        [...Array(5)].map((_, index) => (
          <div key={`skeleton-${index}`} className="sm:mx-10 mb-3 max-w-3xl">
            <div className="p-6 border rounded-lg shadow-lg shadow-gray-500/20 bg-black text-white h-[350px]">
              {/* Profile Image Skeleton */}
              <div className="w-20 h-20 rounded-full bg-gray-800 border-2 border-gray-800"></div>

              {/* Name Skeleton */}
              <div className="h-5 w-32 bg-gray-800 rounded mt-8"></div>

              {/* Experience Skeleton */}
              <div className="h-4 w-40 bg-gray-800 rounded mt-8"></div>

              {/* Skills Skeleton */}
              <div className="flex flex-wrap gap-2 mt-8">
                {[...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    className="h-6 w-16 bg-gray-800 rounded-full"
                  ></div>
                ))}
              </div>

              {/* View Button Skeleton */}
              <div className="w-full bg-gray-800 h-9 rounded-lg mt-6"></div>
            </div>
          </div>
        ))
      ) : freelancers.length === 0 ? (
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
            githubUrl={freelancer.github}
            linkedInUrl={freelancer.linkedin}
          />
        ))
      )}
    </div>
  );
};

export default FreelancerList;
