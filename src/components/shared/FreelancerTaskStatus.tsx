import React from 'react';
import { Check, X, Clock, AlertCircle, User } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface Freelancer {
  acceptanceFreelancer?: boolean;
  rejectionFreelancer?: boolean;
  freelancerName?: string;
  freelancerEmail?: string;
}

interface Task {
  freelancers?: Freelancer[];
  dueDate?: string;
  status?: string;
}

interface FreelancerTaskStatusProps {
  task: Task;
  className?: string;
  showDetails?: boolean;
}

type StatusType = 'accepted' | 'rejected' | 'pending' | 'awaiting' | 'overdue';

const FreelancerTaskStatus: React.FC<FreelancerTaskStatusProps> = ({
  task,
  className = '',
  showDetails = false,
}) => {
  if (!task?.freelancers?.[0]) {
    return (
      <div className={cn('inline-flex', className)}>
        <Badge variant="outline" className="text-xs">
          <User className="w-3 h-3 mr-1" />
          Unassigned
        </Badge>
      </div>
    );
  }

  const freelancer = task.freelancers[0];
  const { acceptanceFreelancer, rejectionFreelancer } = freelancer;
  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date();

  const getStatusInfo = (): {
    type: StatusType;
    text: string;
    description: string;
    icon: React.ReactNode;
    variant: 'default' | 'secondary' | 'destructive' | 'outline' | 'success';
  } => {
    if (isOverdue) {
      return {
        type: 'overdue',
        text: 'Overdue',
        description: 'The task is past its due date',
        icon: <AlertCircle className="w-3 h-3" />,
        variant: 'destructive',
      };
    }

    if (acceptanceFreelancer && !rejectionFreelancer) {
      return {
        type: 'accepted',
        text: 'Accepted',
        description: 'Task has been accepted by the freelancer',
        icon: <Check className="w-3 h-3" />,
        variant: 'default',
      };
    }

    if (rejectionFreelancer) {
      return {
        type: 'rejected',
        text: 'Rejected',
        description: 'Task has been rejected by the freelancer',
        icon: <X className="w-3 h-3" />,
        variant: 'destructive',
      };
    }

    if (!acceptanceFreelancer) {
      return {
        type: 'pending',
        text: 'Pending Response',
        description: 'Waiting for freelancer to respond',
        icon: <Clock className="w-3 h-3" />,
        variant: 'outline',
      };
    }

    return {
      type: 'awaiting',
      text: 'Awaiting Action',
      description: 'Waiting for freelancer to take action',
      icon: <Clock className="w-3 h-3" />,
      variant: 'secondary',
    };
  };

  const status = getStatusInfo();
  const freelancerName = freelancer.freelancerName || 'Freelancer';

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={cn('inline-flex', className)}>
            <Badge
              className={cn('text-xs font-medium flex items-center gap-1', {
                'bg-green-50 text-green-700 hover:bg-green-50':
                  status.type === 'accepted',
                'bg-red-50 text-red-700 hover:bg-red-50':
                  status.type === 'rejected' || status.type === 'overdue',
                'bg-yellow-50 text-yellow-700 hover:bg-yellow-50':
                  status.type === 'pending',
                'bg-blue-50 text-blue-700 hover:bg-blue-50':
                  status.type === 'awaiting',
              })}
            >
              {status.icon}
              {showDetails ? status.text : status.text.split(' ')[0]}
            </Badge>
          </div>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-[250px] text-sm">
          <div className="space-y-1">
            <p className="font-medium">{status.text}</p>
            <p className="text-muted-foreground">{status.description}</p>
            {freelancer.freelancerName && (
              <p className="text-xs text-muted-foreground mt-1">
                {freelancerName}
                {freelancer.freelancerEmail &&
                  ` • ${freelancer.freelancerEmail}`}
              </p>
            )}
            {task.dueDate && (
              <p className="text-xs text-muted-foreground">
                Due: {new Date(task.dueDate).toLocaleDateString()}
                {isOverdue && ' (Overdue)'}
              </p>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export { FreelancerTaskStatus };
export type { StatusType };
