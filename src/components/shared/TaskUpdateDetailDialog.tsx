import React, { useState } from 'react';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Button } from '../ui/button';
import { Select, SelectTrigger, SelectContent, SelectItem } from '../ui/select';
import { toast } from '../ui/use-toast';

import { axiosInstance } from '@/lib/axiosinstance';

interface TaskUpdateDetailDialogProps {
  task: any;
  milestoneId: string;
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
  handleConfirmPermissionRequest,
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
  const updatePermissionBusiness =
    task?.freelancers[0]?.updatePermissionBusiness;

  const rejectionFreelancer = task?.freelancers[0]?.rejectionFreelancer;
  const acceptanceFreelancer = task?.freelancers[0]?.acceptanceFreelancer;

  const isUpdatePermissionAllowed =
    userType === 'freelancer'
      ? updatePermissionFreelancer && !rejectionFreelancer
      : updatePermissionBusiness && !rejectionFreelancer;

  const isPermissionSent =
    (userType === 'freelancer' && !updatePermissionFreelancer) ||
    (userType === 'business' && !updatePermissionBusiness);

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
    const acceptanceFreelancer = userType === 'freelancer' 
      ? task?.freelancers?.[0]?.acceptanceFreelancer // Preserve current acceptance status
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
      
      toast({
        title: 'Success',
        description: 'Update request sent successfully.',
        duration: 3000,
      });
      fetchMilestones();
    } catch (error) {
      console.error('Error during update request:', error);
      toast({
        title: 'Error',
        description: 'Failed to send update request. Please try again.',
        variant: 'destructive',
        duration: 3000,
      });
    }
  };

  const handleSave = async () => {
    console.log('User clicked update task details button');
    console.log('Current task data:', taskData);
    console.log('Initial task data:', initialTaskData);
    
    // Check if any field has been updated
    if (JSON.stringify(taskData) === JSON.stringify(initialTaskData)) {
      console.log('No changes detected, skipping update');
      toast({
        description: 'No changes detected. Task update not required.',
        duration: 3000,
      });
      return;
    }
    
    console.log('Changes detected, proceeding with update');
    const url = `/milestones/update/milestone/${milestoneId}/story/${storyId}/task/${task._id}`;
    console.log('Update URL:', url);
    console.log('Update payload:', {
      milestoneId,
      storyId,
      taskId,
      userType,
      title: taskData.title,
      summary: taskData.summary,
      taskStatus: taskData.taskStatus,
    });
    
    try {
      console.log('Sending update request...');
      await axiosInstance.patch(url, {
        milestoneId,
        storyId,
        taskId,
        userType,
        title: taskData.title,
        summary: taskData.summary,
        taskStatus: taskData.taskStatus,
      });

      console.log('Task update successful');
      toast({
        description: 'Task updated',
        duration: 3000,
      });
      setShowPermissionDialog(false);
      fetchMilestones();
    } catch (error) {
      console.error('Task update failed:', error);
      toast({
        description: 'Task not updated, please try again.',
        duration: 3000,
      });
    }
  };

  return (
    <Dialog open={showPermissionDialog} onOpenChange={setShowPermissionDialog}>
      <DialogTrigger className="hidden">Trigger</DialogTrigger>
      <DialogContent className=" sm:w-[86vw] md:w-[450px]  p-6 border rounded-md shadow-md">
        <DialogHeader>
          <DialogTitle>
            {isUpdatePermissionAllowed
              ? 'Update Task Details'
              : 'Request Permission'}
          </DialogTitle>
          <DialogDescription>
            {isUpdatePermissionAllowed
              ? 'You have permission to update the task details.'
              : isPermissionSent
                ? 'Your request has been sent. Please wait until permission is accepted.'
                : "You don't have permission to update. Please request permission."}
          </DialogDescription>
        </DialogHeader>

        {!isUpdatePermissionAllowed ? (
          <DialogFooter className="flex mt-2 justify-end gap-4">
            <Button
              onClick={handleSendRequest}
              variant="outline"
              className="bg-blue-600 text-white px-4 py-2 rounded-md"
            >
              Send Permission Request
            </Button>
            <Button
              onClick={() => setShowPermissionDialog(false)}
              variant="outline"
            >
              Cancel
            </Button>
          </DialogFooter>
        ) : (
          <div className="flex flex-col gap-2">
            <div>
              <label htmlFor="taskTitle" className="text-sm font-medium mb-2">
                Task Title:
              </label>
              <Input
                id="taskTitle"
                type="text"
                value={taskData.title}
                onChange={(e) => handleTaskChange('title', e.target.value)}
                className="mb-2 mt-1"
              />
            </div>
            <div>
              <label htmlFor="taskSummary" className="text-sm font-medium mb-2">
                Summary:
              </label>
              <Textarea
                id="taskSummary"
                value={taskData.summary}
                onChange={(e) => handleTaskChange('summary', e.target.value)}
                rows={4}
                className="mb-2 mt-1"
              />
            </div>
            <div>
              <label htmlFor="taskStatus" className="text-sm font-medium mb-1">
                Task Status:
              </label>
              <Select
                value={taskData.taskStatus}
                onValueChange={(value) => handleTaskChange('taskStatus', value)}
              >
                <SelectTrigger className="p-2 mt-1 border rounded-md">
                  <span>{taskData.taskStatus}</span>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="NOT_STARTED">NOT_STARTED</SelectItem>
                  <SelectItem value="ONGOING">ONGOING</SelectItem>
                  <SelectItem value="COMPLETED">COMPLETED</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <DialogFooter className="flex mt-2 justify-end gap-3">
              <Button onClick={handleSave} variant="default">
                Save
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default TaskUpdateDetailDialog;
