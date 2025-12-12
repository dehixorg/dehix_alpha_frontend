import React, { useState } from 'react';
import {
  Check,
  X,
  AlertCircle,
  MoreVertical,
  Loader2,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Edit,
  UserCheck,
} from 'lucide-react';
import { useSelector } from 'react-redux';

import FreelancerDetailsDialog from './FreelancerDetailsDialog';
import TaskUpdateDeatilDialog from './TaskUpdateDetailDialog';

import { Card, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { notifyError, notifySuccess } from '@/utils/toastMessage';
import { axiosInstance } from '@/lib/axiosinstance';
import { cn } from '@/lib/utils';
import { Task } from '@/utils/types/Milestone';
import { statusOutlineClasses } from '@/utils/common/getBadgeStatus';

interface TaskCardProps {
  task: Task;
  isFreelancer: boolean;
  onTaskClick: (task: Task) => void;
  onAcceptTask: (taskId: string) => void;
  onRejectTask: (taskId: string) => void;
  onApproveUpdatePermission: (taskId: string) => void;
  onRejectUpdatePermission: (taskId: string) => void;
  shouldShowAcceptRejectButtons: (task: Task) => boolean;
  fetchMilestones: () => void;
  milestoneId?: string;
  storyId: string;
  taskBadgeStyle: string;
}

const TaskCard: React.FC<TaskCardProps> = ({
  task,
  isFreelancer,
  onAcceptTask,
  onRejectTask,
  onApproveUpdatePermission,
  onRejectUpdatePermission,
  shouldShowAcceptRejectButtons,
  fetchMilestones,
  milestoneId,
  storyId,
}) => {
  const [isLoading, setIsLoading] = useState(false);

  const freelancer = task?.freelancers?.[0];
  const isAssigned = !!freelancer?.freelancerName;

  return (
    <div className="p-1 md:p-2">
      <Card
        className={cn(
          'w-full cursor-pointer border border-border/50 hover:border-primary/30 transition-colors duration-200 overflow-hidden',
        )}
      >
        <CardHeader className="p-4 pb-2 space-y-2">
          <div className="flex justify-between items-start gap-3">
            <div className="flex items-start gap-3 min-w-0">
              <div className="space-y-1 overflow-hidden">
                <div className="flex items-center gap-2">
                  <h4
                    className="text-sm font-semibold leading-tight text-foreground line-clamp-2"
                    title={task.title}
                  >
                    {task.title}
                  </h4>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  {isAssigned ? (
                    <div className="flex items-center gap-1.5">
                      <Avatar className="h-4 w-4">
                        <AvatarImage src={freelancer?.profilePicture} />
                        <AvatarFallback className="text-[10px] bg-primary/10 text-primary">
                          {freelancer.freelancerName?.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span className="truncate">
                        {freelancer.freelancerName}
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 text-amber-500">
                      <AlertCircle className="h-3.5 w-3.5" />
                      <span>Unassigned</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Badge className={statusOutlineClasses(task.taskStatus)}>
                {task.taskStatus.replace('_', ' ')}
              </Badge>
              <TaskActionsDropdown
                task={task}
                milestoneId={milestoneId}
                storyId={storyId}
                fetchMilestones={fetchMilestones}
                isFreelancer={isFreelancer}
              />
            </div>
          </div>
        </CardHeader>
        <CardFooter className="p-0">
          <div className="w-full" onClick={(e) => e.stopPropagation()}>
            {isFreelancer ? (
              <FreelancerTaskActions
                task={task}
                onAcceptTask={onAcceptTask}
                onRejectTask={onRejectTask}
                onApproveUpdatePermission={onApproveUpdatePermission}
                onRejectUpdatePermission={onRejectUpdatePermission}
                shouldShowAcceptRejectButtons={shouldShowAcceptRejectButtons}
                isLoading={isLoading}
                onActionStart={() => setIsLoading(true)}
                onActionEnd={() => setIsLoading(false)}
              />
            ) : (
              <BusinessTaskActions
                task={task}
                onApproveUpdatePermission={onApproveUpdatePermission}
                onRejectUpdatePermission={onRejectUpdatePermission}
                isLoading={isLoading}
                onActionStart={() => setIsLoading(true)}
                onActionEnd={() => setIsLoading(false)}
              />
            )}
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

// Sub-component for Freelancer-specific actions
interface BaseActionsProps {
  task: Task;
  isLoading?: boolean;
  onActionStart?: () => void;
  onActionEnd?: () => void;
}

interface FreelancerTaskActionsProps extends BaseActionsProps {
  onAcceptTask: (taskId: string) => Promise<any> | void;
  onRejectTask: (taskId: string) => Promise<any> | void;
  onApproveUpdatePermission: (taskId: string) => Promise<any> | void;
  onRejectUpdatePermission: (taskId: string) => Promise<any> | void;
  shouldShowAcceptRejectButtons: (task: Task) => boolean;
}

const ActionButton: React.FC<{
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  variant?:
    | 'default'
    | 'secondary'
    | 'outline'
    | 'destructive'
    | 'ghost'
    | 'link'
    | null
    | undefined;
  className?: string;
  isLoading?: boolean;
  disabled?: boolean;
}> = ({
  onClick,
  icon,
  label,
  variant = 'outline',
  className = '',
  isLoading = false,
  disabled = false,
}) => (
  <Button
    variant={variant}
    size="sm"
    className={cn(
      'h-8 text-xs font-medium gap-1.5 flex-1 transition-all',
      className,
      {
        'opacity-70 cursor-not-allowed': disabled,
      },
    )}
    onClick={onClick}
    disabled={isLoading || disabled}
  >
    {isLoading ? (
      <Loader2 className="h-3.5 w-3.5 animate-spin" />
    ) : (
      <span className="flex items-center gap-1.5">
        {icon}
        <span>{label}</span>
      </span>
    )}
  </Button>
);

const FreelancerTaskActions: React.FC<FreelancerTaskActionsProps> = ({
  task,
  onAcceptTask,
  onRejectTask,
  onApproveUpdatePermission,
  onRejectUpdatePermission,
  shouldShowAcceptRejectButtons,
  isLoading: parentLoading,
  onActionStart,
  onActionEnd,
}) => (
  <div className="p-3 pt-0">
    <Separator className="mb-3" />
    <div className="space-y-2">
      {shouldShowAcceptRejectButtons(task) && (
        <div className="grid grid-cols-2 gap-2">
          <ActionButton
            onClick={async () => {
              onActionStart?.();
              try {
                await onAcceptTask(task._id);
                window.dispatchEvent(new CustomEvent('taskAssignmentUpdated'));
              } finally {
                onActionEnd?.();
              }
            }}
            icon={<CheckCircle2 className="h-3.5 w-3.5" />}
            label="Accept"
            variant="default"
            isLoading={parentLoading}
          />
          <ActionButton
            onClick={async () => {
              onActionStart?.();
              try {
                await onRejectTask(task._id);
                window.dispatchEvent(new CustomEvent('taskAssignmentUpdated'));
              } finally {
                onActionEnd?.();
              }
            }}
            icon={<XCircle className="h-3.5 w-3.5" />}
            label="Reject"
            variant="outline"
            isLoading={parentLoading}
          />
        </div>
      )}

      {!task.freelancers?.[0]?.updatePermissionFreelancer &&
        task.freelancers?.[0]?.updatePermissionBusiness &&
        !task.freelancers?.[0]?.acceptanceFreelancer && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs text-amber-500 bg-amber-50 dark:bg-amber-900/20 p-2 rounded-md">
              <AlertTriangle className="h-3.5 w-3.5 flex-shrink-0" />
              <span>Update permission requested</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <ActionButton
                onClick={async () => {
                  onActionStart?.();
                  try {
                    await onApproveUpdatePermission(task._id);
                  } finally {
                    onActionEnd?.();
                  }
                }}
                icon={<Check className="h-3.5 w-3.5" />}
                label="Approve Update"
                variant="default"
                className="bg-amber-500 hover:bg-amber-600"
                isLoading={parentLoading}
              />
              <ActionButton
                onClick={async () => {
                  onActionStart?.();
                  try {
                    await onRejectUpdatePermission(task._id);
                  } finally {
                    onActionEnd?.();
                  }
                }}
                icon={<X className="h-3.5 w-3.5" />}
                label="Reject"
                variant="outline"
                className="border-amber-300 text-amber-600 hover:bg-amber-50 dark:border-amber-700 dark:text-amber-400 dark:hover:bg-amber-900/30"
                isLoading={parentLoading}
              />
            </div>
          </div>
        )}
    </div>
  </div>
);

// Sub-component for Business-specific actions
interface BusinessTaskActionsProps extends BaseActionsProps {
  onApproveUpdatePermission: (taskId: string) => Promise<any> | void;
  onRejectUpdatePermission: (taskId: string) => Promise<any> | void;
}

const BusinessTaskActions: React.FC<BusinessTaskActionsProps> = ({
  task,
  onApproveUpdatePermission,
  onRejectUpdatePermission,
  isLoading: parentLoading,
  onActionStart,
  onActionEnd,
}) => (
  <div className="p-3 pt-0">
    <div className="space-y-3">
      {!task.freelancers?.[0]?.updatePermissionBusiness &&
        task.freelancers?.[0]?.updatePermissionFreelancer && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs text-blue-500 bg-blue-50 dark:bg-blue-900/20 p-2 rounded-md">
              <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
              <span>Freelancer requested update permission</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <ActionButton
                onClick={async () => {
                  onActionStart?.();
                  try {
                    await onApproveUpdatePermission(task._id);
                  } finally {
                    onActionEnd?.();
                  }
                }}
                icon={<Check className="h-3.5 w-3.5" />}
                label="Approve"
                variant="default"
                className="bg-blue-500 hover:bg-blue-600"
                isLoading={parentLoading}
              />
              <ActionButton
                onClick={async () => {
                  onActionStart?.();
                  try {
                    await onRejectUpdatePermission(task._id);
                  } finally {
                    onActionEnd?.();
                  }
                }}
                icon={<X className="h-3.5 w-3.5" />}
                label="Reject"
                variant="outline"
                isLoading={parentLoading}
              />
            </div>
          </div>
        )}
    </div>
  </div>
);

// Component for the task actions dropdown
interface TaskActionsDropdownProps {
  task: Task;
  milestoneId?: string;
  storyId: string;
  fetchMilestones: () => void;
  isFreelancer: boolean;
}

const TaskActionsDropdown: React.FC<TaskActionsDropdownProps> = ({
  task,
  milestoneId,
  storyId,
  fetchMilestones,
  isFreelancer,
}) => {
  const user = useSelector(
    (state: { user: { type: string; uid: string } }) => state.user,
  ) || { type: '', uid: '' };
  const [isDialogOpen, setDialogOpen] = useState(false);
  const [selectedFreelancer, setSelectedFreelancer] = useState<string | null>(
    null,
  );
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showPermissionDialog, setShowPermissionDialog] = useState(false);
  const { type } = user;

  const handleRequestPermission = () => {
    setShowPermissionDialog(true);
  };

  const handleConfirmPermissionRequest = async (
    updatePermissionBusiness: boolean,
    updatePermissionFreelancer: boolean,
    rejectionFreelancer: boolean,
    acceptanceFreelancer: boolean,
  ) => {
    const payload = {
      updatePermissionBusiness,
      updatePermissionFreelancer,
      rejectionFreelancer,
      acceptanceFreelancer,
    };

    const url = `/milestones/${milestoneId}/story/${storyId}/task/${task._id}`;

    try {
      await axiosInstance.patch(url, payload);
      setShowPermissionDialog(false);
      let successMessage = 'Permissions updated successfully.';
      if (rejectionFreelancer && !acceptanceFreelancer) {
        successMessage = 'Task rejected successfully.';
      } else if (acceptanceFreelancer && !rejectionFreelancer) {
        successMessage = 'Task accepted successfully.';
      }
      notifySuccess(successMessage, 'Success');
      fetchMilestones();
    } catch (error) {
      console.error('Error during permission request:', error);
      notifyError('Failed to update permissions. Please try again.', 'Error');
    }
  };

  const showRedDot = isFreelancer
    ? task?.freelancers[0]?.updatePermissionBusiness &&
      task?.freelancers[0]?.updatePermissionFreelancer &&
      !task?.freelancers[0]?.rejectionFreelancer
    : task?.freelancers[0]?.updatePermissionBusiness &&
      task?.freelancers[0]?.updatePermissionFreelancer &&
      !task.freelancers[0]?.acceptanceFreelancer;

  const showYellowDot = isFreelancer
    ? task?.freelancers[0]?.updatePermissionBusiness &&
      !task?.freelancers[0]?.updatePermissionFreelancer &&
      task?.freelancers[0]?.rejectionFreelancer
    : !task?.freelancers[0]?.updatePermissionBusiness &&
      task?.freelancers[0]?.updatePermissionFreelancer &&
      task.freelancers[0]?.acceptanceFreelancer;

  const isUpdateDisabled = isFreelancer
    ? task?.freelancers[0]?.rejectionFreelancer ||
      !task?.freelancers[0]?.acceptanceFreelancer ||
      (task?.freelancers[0]?.updatePermissionFreelancer &&
        !task?.freelancers[0]?.updatePermissionBusiness)
    : false;

  return (
    <>
      <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
        <DropdownMenuTrigger className="p-1 rounded-md hover:bg-accent">
          <MoreVertical className="w-4 h-4" />
          {showRedDot && (
            <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
          )}
          {showYellowDot && (
            <span className="absolute top-0 right-0 w-2 h-2 bg-yellow-500 rounded-full"></span>
          )}
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          className="w-56 p-2 border rounded-md shadow-md"
        >
          {isFreelancer && task?.freelancers[0]?.freelancerId === user?.uid ? (
            <DropdownMenuItem
              className="flex items-center gap-2"
              onClick={handleRequestPermission}
              disabled={isUpdateDisabled}
            >
              <Edit className="w-4 h-4 text-blue-500" />
              Update
              {isUpdateDisabled && (
                <span className="ml-2 text-xs text-gray-500">
                  {task?.freelancers[0]?.rejectionFreelancer
                    ? '(Disabled - Task Rejected)'
                    : !task?.freelancers[0]?.acceptanceFreelancer
                      ? '(Disabled - Task Not Accepted)'
                      : '(Disabled - Waiting for Business Approval)'}
                </span>
              )}
            </DropdownMenuItem>
          ) : !isFreelancer ? (
            <>
              {task.freelancers.length > 0 && (
                <DropdownMenuItem
                  className="flex items-center gap-2"
                  onClick={() => {
                    setSelectedFreelancer(task?.freelancers[0]?.freelancerId);
                    setDialogOpen(true);
                  }}
                >
                  <UserCheck className="w-4 h-4 text-gray-500" />
                  View assignee
                </DropdownMenuItem>
              )}
              <DropdownMenuItem
                className="flex items-center gap-2"
                onClick={() => setShowPermissionDialog(true)}
              >
                <Edit className="w-4 h-4 text-blue-500" />
                Update
              </DropdownMenuItem>
            </>
          ) : (
            <DropdownMenuItem disabled className="text-gray-400">
              This task is not assigned to you.
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {isDialogOpen && selectedFreelancer && (
        <FreelancerDetailsDialog
          freelancerId={selectedFreelancer}
          onClose={() => {
            setSelectedFreelancer(null);
            setDialogOpen(false);
          }}
        />
      )}

      <TaskUpdateDeatilDialog
        fetchMilestones={fetchMilestones}
        userType={type}
        task={task}
        milestoneId={milestoneId}
        storyId={storyId}
        taskId={task._id}
        showPermissionDialog={showPermissionDialog}
        setShowPermissionDialog={setShowPermissionDialog}
        handleConfirmPermissionRequest={handleConfirmPermissionRequest}
      />
    </>
  );
};

export default TaskCard;
