import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Check,
  X,
  AlertCircle,
  Loader2,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Pencil,
  Sparkles,
  Trash2,
} from 'lucide-react';
import { useSelector } from 'react-redux';

import TaskUpdateDeatilDialog from './TaskUpdateDetailDialog';

import { Card, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { notifyError, notifySuccess } from '@/utils/toastMessage';
import { axiosInstance } from '@/lib/axiosinstance';
import { cn } from '@/lib/utils';
import { Task } from '@/utils/types/Milestone';
import { RootState } from '@/lib/store';

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
  /** Optional local mode task edit/delete/refine callbacks */
  onRefineTask?: () => void;
  onDeleteTask?: () => void;
}

const TaskCard: React.FC<TaskCardProps> = (props) => {
  const {
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
    taskBadgeStyle: _taskBadgeStyle,
    onRefineTask,
    onDeleteTask,
  } = props;

  const user = useSelector((state: RootState) => state.user);
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const freelancer = task?.freelancers?.[0];
  const isAssigned = !!freelancer?.freelancerName;

  return (
    <div className="p-1 md:p-1.5">
      <Card
        className={cn(
          'bg-card group w-full cursor-pointer overflow-hidden border border-border/70 backdrop-blur-sm transition-all duration-200 hover:-translate-y-[1px] hover:border-primary/40 hover:shadow-md z-10',
        )}
      >
        <CardHeader className="p-3.5 pb-2">
          <div className="flex items-start justify-between gap-2.5">
            <div className="min-w-0 space-y-1.5 flex-1 pr-1">
              <h4
                className="text-xs md:text-sm font-semibold leading-snug text-foreground line-clamp-2"
                title={task.title}
              >
                {task.title}
              </h4>

              {isAssigned ? (
                <div className="flex items-center gap-2 text-xs text-muted-foreground min-w-0">
                  <div
                    className="flex items-center gap-1.5 min-w-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      const freelancerId = task?.freelancers?.[0]?.freelancerId;
                      if (!freelancerId || user.type !== 'business') return;
                      router.push(`/freelancer-profile/${freelancerId}`);
                    }}
                  >
                    <Avatar className="h-4.5 w-4.5">
                      <AvatarImage src={freelancer?.profilePic} />
                      <AvatarFallback className="text-[9px] bg-primary/10 text-primary font-bold">
                        {freelancer.freelancerName?.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="truncate text-xs font-medium">
                      {freelancer.freelancerName}
                    </span>
                  </div>
                </div>
              ) : (
                <Badge
                  variant="secondary"
                  className="bg-amber-500/10 text-amber-500 border border-amber-500/20 text-[10px] px-2 py-0.5 rounded-full font-semibold inline-flex items-center"
                >
                  <AlertCircle className="mr-1 h-3 w-3" />
                  Unassigned
                </Badge>
              )}
            </div>

            <div className="flex items-center gap-1 shrink-0">
              {onRefineTask && !isFreelancer && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 rounded-md text-muted-foreground hover:text-primary hover:bg-primary/10 border border-border/50 transition-all shadow-2xs"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRefineTask();
                  }}
                  title="Refine task with AI"
                >
                  <Sparkles className="h-3.5 w-3.5 text-primary" />
                </Button>
              )}
              {onDeleteTask && !isFreelancer && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 border border-border/50 transition-all shadow-2xs"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteTask();
                  }}
                  title="Delete task"
                >
                  <Trash2 className="h-3.5 w-3.5 text-muted-foreground hover:text-destructive" />
                </Button>
              )}
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
    {shouldShowAcceptRejectButtons(task) && <Separator className="mb-3" />}
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

  const isUpdateDisabled = isFreelancer
    ? task?.freelancers?.[0]?.rejectionFreelancer ||
      !task?.freelancers?.[0]?.acceptanceFreelancer ||
      (task?.freelancers?.[0]?.updatePermissionFreelancer &&
        !task?.freelancers?.[0]?.updatePermissionBusiness)
    : false;

  // Show pencil edit button ONLY on dashboard for real DB milestones (not pre-launch LiveRoom preview)
  const showDashboardEditButton = Boolean(
    milestoneId && !milestoneId.startsWith('milestone-'),
  );

  return (
    <>
      {showDashboardEditButton && (
        <Button
          type="button"
          variant="link"
          size="icon"
          className="rounded-md text-muted-foreground hover:text-foreground justify-center"
          disabled={
            isFreelancer
              ? task?.freelancers?.[0]?.freelancerId !== user?.uid ||
                isUpdateDisabled
              : false
          }
          onClick={() => {
            if (isFreelancer) {
              handleRequestPermission();
              return;
            }
            setShowPermissionDialog(true);
          }}
        >
          <Pencil />
        </Button>
      )}

      <TaskUpdateDeatilDialog
        fetchMilestones={fetchMilestones}
        userType={type}
        task={task}
        milestoneId={milestoneId}
        storyId={storyId}
        showPermissionDialog={showPermissionDialog}
        setShowPermissionDialog={setShowPermissionDialog}
        handleConfirmPermissionRequest={handleConfirmPermissionRequest}
      />
    </>
  );
};

export default TaskCard;
