import React from 'react';
import { Check, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface FreelancerTaskStatusProps {
  task: any;
}

const FreelancerTaskStatus: React.FC<FreelancerTaskStatusProps> = ({ task }) => {
  if (!task?.freelancers?.[0]) {
    return null;
  }

  const freelancer = task.freelancers[0];
  const { acceptanceFreelancer, rejectionFreelancer } = freelancer;

  const getStatusInfo = () => {
    if (acceptanceFreelancer && !rejectionFreelancer) {
      return {
        text: 'Accepted by Freelancer',
        color: 'bg-green-100 text-green-800',
        icon: <Check className="w-3 h-3" />,
      };
    } else if (!acceptanceFreelancer && rejectionFreelancer) {
      return {
        text: 'Rejected by Freelancer',
        color: 'bg-red-100 text-red-800',
        icon: <X className="w-3 h-3" />,
      };
    } else if (!acceptanceFreelancer && !rejectionFreelancer) {
      return {
        text: 'Pending Response',
        color: 'bg-yellow-100 text-yellow-800',
        icon: null,
      };
    } else {
      return {
        text: 'Awaiting Freelancer',
        color: 'bg-blue-100 text-blue-800',
        icon: null,
      };
    }
  };

  const status = getStatusInfo();

  return (
    <div className="mt-2">
      <Badge className={`${status.color} px-2 py-1 text-xs flex items-center gap-1`}>
        {status.icon}
        {status.text}
      </Badge>
    </div>
  );
};

export default FreelancerTaskStatus;
