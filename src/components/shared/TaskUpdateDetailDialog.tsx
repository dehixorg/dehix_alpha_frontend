import React, { useState } from 'react';
import { AlertCircle, FileText, Tag } from 'lucide-react';

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from '../ui/select';

import { cn } from '@/lib/utils';
import { notifyError, notifySuccess } from '@/utils/toastMessage';
import { axiosInstance } from '@/lib/axiosinstance';

interface TaskUpdateDetailDialogProps {
  task: any;
  milestoneId?: string;
  storyId: string;
  taskId: string;
  userType: string;
  showPermissionDialog: boolean;
  setShowPermissionDialog: React.Dispatch<React.SetStateAction<boolean>>;
  handleConfirmPermissionRequest: (
    updatePermissionBusiness: boolean,
    updatePermissionFreelancer: boolean,
    rejectionFreelancer: boolean,
    acceptanceFreelancer: boolean,
  ) => void;
  fetchMilestones: () => void;
}

const TaskUpdateDetailDialog: React.FC<TaskUpdateDetailDialogProps> = ({
  task,
  milestoneId,
  storyId,
  taskId,
  userType,
  showPermissionDialog,
  setShowPermissionDialog,
  fetchMilestones,
}) => {
  const [taskData, setTaskData] = useState({
    title: task?.title || '',
    summary: task?.summary || '',
    taskStatus: task?.taskStatus || 'NOT_STARTED',
  });

  // Initial task data for comparison
  const initialTaskData = {
    title: task?.title || '',
    summary: task?.summary || '',
    taskStatus: task?.taskStatus || 'NOT_STARTED',
  };

  const updatePermissionFreelancer =
    task?.freelancers[0]?.updatePermissionFreelancer;

  const rejectionFreelancer = task?.freelancers[0]?.rejectionFreelancer;

  const isUpdatePermissionAllowed =
    userType === 'business'
      ? !rejectionFreelancer
      : updatePermissionFreelancer && !rejectionFreelancer;

  // For business, we never show request state; for freelancer show if not yet granted
  const isPermissionSent =
    userType === 'freelancer' && !updatePermissionFreelancer;

  const handleTaskChange = (field: string, value: string) => {
    setTaskData((prevData) => ({
      ...prevData,
      [field]: value,
    }));
  };

  const handleSendRequest = async () => {
    const updatePermissionBusiness = userType === 'business';
    const updatePermissionFreelancer = userType === 'freelancer';
    // Only set rejectionFreelancer to true if the user is actually rejecting the task
    // For update requests, we should preserve the current acceptance/rejection status
    const rejectionFreelancer = false; // Don't set rejection for update requests
    const acceptanceFreelancer =
      userType === 'freelancer'
        ? task?.freelancers?.[0]?.acceptanceFreelancer
        : false;

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

      notifySuccess('Update request sent successfully.', 'Success');
      fetchMilestones();
    } catch (error) {
      console.error('Error during update request:', error);
      notifyError('Failed to send update request. Please try again.', 'Error');
    }
  };

  const handleSave = async () => {
    // Check if any field has been updated
    if (JSON.stringify(taskData) === JSON.stringify(initialTaskData)) {
      notifySuccess('No changes detected. Task update not required.', 'Info');
      return;
    }

    const url = `/milestones/update/milestone/${milestoneId}/story/${storyId}/task/${task._id}`;

    try {
      await axiosInstance.patch(url, {
        milestoneId,
        storyId,
        taskId,
        userType,
        title: taskData.title,
        summary: taskData.summary,
        taskStatus: taskData.taskStatus,
      });
      notifySuccess('Task updated', 'Success');
      setShowPermissionDialog(false);
      fetchMilestones();
    } catch (error) {
      console.error('Task update failed:', error);
      notifyError('Task not updated, please try again.', 'Error');
    }
  };

  const isDisabled =
    isPermissionSent ||
    (!isUpdatePermissionAllowed && userType === 'freelancer');
  const hasChanges =
    JSON.stringify(taskData) !== JSON.stringify(initialTaskData);

  return (
    <Dialog open={showPermissionDialog} onOpenChange={setShowPermissionDialog}>
      <DialogTrigger className="hidden">Trigger</DialogTrigger>
      <DialogContent className="w-full max-w-2xl">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            <DialogTitle className="text-xl font-semibold">
              Update Task Details
            </DialogTitle>
          </div>
          <p className="text-sm text-muted-foreground">
            {isUpdatePermissionAllowed
              ? 'Update the task details below.'
              : isPermissionSent
                ? 'Your update request has been sent and is pending approval.'
                : 'Update task information and request permission if needed.'}
          </p>
        </DialogHeader>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (isUpdatePermissionAllowed) {
              handleSave();
            } else {
              handleSendRequest();
            }
          }}
          className="space-y-6"
        >
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              {/* Task Title */}
              <div className="space-y-2">
                <Label htmlFor="title" className="flex items-center gap-2">
                  <Tag className="h-4 w-4 text-muted-foreground" />
                  Task Title
                </Label>
                <Input
                  id="title"
                  value={taskData.title}
                  onChange={(e) => handleTaskChange('title', e.target.value)}
                  disabled={isDisabled}
                  className={cn('w-full', isDisabled && 'bg-muted/50')}
                  placeholder="e.g., Update Homepage Design"
                />
              </div>

              {/* Task Description */}
              <div className="space-y-2">
                <Label htmlFor="summary" className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  Description
                </Label>
                <Textarea
                  id="summary"
                  value={taskData.summary}
                  onChange={(e) => handleTaskChange('summary', e.target.value)}
                  disabled={isDisabled}
                  className={cn('min-h-[100px]', isDisabled && 'bg-muted/50')}
                  placeholder="Describe the task in detail..."
                />
              </div>

              {/* Task Status */}
              <div className="space-y-2">
                <Label htmlFor="status" className="flex items-center gap-2">
                  <Tag className="h-4 w-4 text-muted-foreground" />
                  Status
                </Label>
                <Select
                  value={taskData.taskStatus}
                  onValueChange={(value) =>
                    handleTaskChange('taskStatus', value)
                  }
                  disabled={isDisabled}
                >
                  <SelectTrigger
                    className={cn('w-full', isDisabled && 'bg-muted/50')}
                  >
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="NOT_STARTED">Not Started</SelectItem>
                    <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                    <SelectItem value="COMPLETED">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Status Messages */}
            {!isUpdatePermissionAllowed && !isPermissionSent && (
              <div className="flex items-start gap-2 p-3 text-sm text-amber-600 bg-amber-50 rounded-md">
                <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium">Permission Required</p>
                  <p>
                    You need permission to update this task. Click &quot;Request
                    Update Permission&quot; to continue.
                  </p>
                </div>
              </div>
            )}

            {isPermissionSent && (
              <div className="flex items-start gap-2 p-3 text-blue-600 bg-blue-50 rounded-md">
                <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium">Request Sent</p>
                  <p>
                    Your update request has been sent and is pending approval.
                  </p>
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <div className="flex justify-end gap-3 w-full">
              <Button
                variant="outline"
                onClick={() => setShowPermissionDialog(false)}
                type="button"
              >
                Cancel
              </Button>

              {isUpdatePermissionAllowed ? (
                <Button
                  type="submit"
                  disabled={!hasChanges || !taskData.title.trim()}
                  className="min-w-[120px]"
                >
                  Save Changes
                </Button>
              ) : (
                <Button
                  type="submit"
                  disabled={isPermissionSent}
                  variant={isPermissionSent ? 'outline' : 'default'}
                  className={cn(
                    'min-w-[200px]',
                    isPermissionSent && 'bg-transparent',
                  )}
                >
                  {isPermissionSent
                    ? 'Request Sent'
                    : 'Request Update Permission'}
                </Button>
              )}
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default TaskUpdateDetailDialog;
