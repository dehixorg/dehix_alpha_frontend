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

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { cn } from '@/lib/utils';
import { notifyError, notifySuccess } from '@/utils/toastMessage';
import { axiosInstance } from '@/lib/axiosinstance';
import { TaskStatus } from '@/utils/types/Milestone';

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
    taskStatus: task?.taskStatus || TaskStatus.NOT_STARTED,
  });

  // Initial task data for comparison
  const initialTaskData = {
    title: task?.title || '',
    summary: task?.summary || '',
    taskStatus: task?.taskStatus || TaskStatus.NOT_STARTED,
  };

  const updatePermissionFreelancer =
    task?.freelancers[0]?.updatePermissionFreelancer;

  const updatePermissionBusiness =
    task?.freelancers[0]?.updatePermissionBusiness;

  const rejectionFreelancer = task?.freelancers[0]?.rejectionFreelancer;

  const isUpdatePermissionAllowed =
    userType === 'business'
      ? !rejectionFreelancer
      : updatePermissionFreelancer &&
        updatePermissionBusiness &&
        !rejectionFreelancer;

  // For business, we never show request state; for freelancer show if not yet granted
  const isPermissionSent =
    userType === 'freelancer' &&
    updatePermissionFreelancer &&
    !updatePermissionBusiness;

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

    const url = `/milestones/${milestoneId}/story/${storyId}/task/${task._id}`;

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
      <DialogContent className="w-full sm:max-w-[560px]">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">
            Update task
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            {isUpdatePermissionAllowed
              ? 'Make quick edits and save.'
              : isPermissionSent
                ? 'Request sent. Waiting for approval.'
                : 'Request permission before you can edit.'}
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
          className="space-y-5"
        >
          {!isUpdatePermissionAllowed && !isPermissionSent && (
            <Alert className="border-amber-500/30 text-amber-700 dark:text-amber-200 bg-amber-50/60 dark:bg-amber-900/10">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Permission required</AlertTitle>
              <AlertDescription>
                Request permission to update this task.
              </AlertDescription>
            </Alert>
          )}

          {isPermissionSent && (
            <Alert className="border-blue-500/30 text-blue-700 dark:text-blue-200 bg-blue-50/60 dark:bg-blue-900/10">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Request sent</AlertTitle>
              <AlertDescription>
                Waiting for business approval.
              </AlertDescription>
            </Alert>
          )}

          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Title</Label>
              <div className="relative">
                <Tag className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="title"
                  value={taskData.title}
                  onChange={(e) => handleTaskChange('title', e.target.value)}
                  disabled={isDisabled}
                  className={cn('pl-9', isDisabled && 'bg-muted/50')}
                  placeholder="Add a short title"
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="summary">Description</Label>
              <div className="relative">
                <FileText className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Textarea
                  id="summary"
                  value={taskData.summary}
                  onChange={(e) => handleTaskChange('summary', e.target.value)}
                  disabled={isDisabled}
                  className={cn(
                    'min-h-[120px] pl-9',
                    isDisabled && 'bg-muted/50',
                  )}
                  placeholder="Add details (optional)"
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={taskData.taskStatus}
                onValueChange={(value) => handleTaskChange('taskStatus', value)}
                disabled={isDisabled}
              >
                <SelectTrigger
                  className={cn('w-full', isDisabled && 'bg-muted/50')}
                >
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={TaskStatus.NOT_STARTED}>
                    Not started
                  </SelectItem>
                  <SelectItem value={TaskStatus.ONGOING}>Ongoing</SelectItem>
                  <SelectItem value={TaskStatus.COMPLETED}>
                    Completed
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <div className="flex justify-end gap-2 w-full">
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
                  Save
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
