import React, { useState, useEffect } from 'react';

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
    acceptanceBusiness: boolean,
    acceptanceFreelancer: boolean,
  ) => void;
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

  const acceptanceBusiness = task?.freelancers[0]?.acceptanceBusiness;
  const acceptanceFreelancer = task?.freelancers[0]?.acceptanceFreelancer;

  const isUpdatePermissionAllowed =
    userType === 'business'
      ? updatePermissionBusiness &&
        updatePermissionFreelancer &&
        acceptanceBusiness
      : updatePermissionFreelancer &&
        updatePermissionBusiness &&
        acceptanceFreelancer;

  const isPermissionSent =
    (userType === 'business' &&
      updatePermissionBusiness &&
      !updatePermissionFreelancer) ||
    (userType === 'freelancer' &&
      updatePermissionFreelancer &&
      !updatePermissionBusiness);

  const handleTaskChange = (field: string, value: string) => {
    setTaskData((prevData) => ({
      ...prevData,
      [field]: value,
    }));
  };

  const handleSendRequest = () => {
    const updatePermissionBusiness = userType === 'business';
    const updatePermissionFreelancer = userType === 'freelancer';
    const acceptanceBusiness = userType === 'business';
    const acceptanceFreelancer = userType === 'freelancer';

    handleConfirmPermissionRequest(
      updatePermissionBusiness,
      updatePermissionFreelancer,
      acceptanceBusiness,
      acceptanceFreelancer,
    );
  };

  const handleSave = async () => {
    // Check if any field has been updated
    if (JSON.stringify(taskData) === JSON.stringify(initialTaskData)) {
      toast({
        description: 'No changes detected. Task update not required.',
        duration: 3000,
      });
      return;
    }
    const url = `/milestones/update/${milestoneId}/${storyId}/${task._id}`;
    try {
      const response = await axiosInstance.patch(url, {
        milestoneId,
        storyId,
        taskId,
        userType,
        title: taskData.title,
        summary: taskData.summary,
        taskStatus: taskData.taskStatus,
      });

      if (response.status === 200) {
        alert('Task updated successfully!');
        setShowPermissionDialog(false);
      }
    } catch (error) {
      console.error('Error updating task:', error);
      alert('Failed to update task. Please try again later.');
    }
  };

  return (
    <Dialog open={showPermissionDialog} onOpenChange={setShowPermissionDialog}>
      <DialogTrigger className="hidden">Trigger</DialogTrigger>
      <DialogContent className="w-[450px] p-6 border rounded-md shadow-md">
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
            {isPermissionSent ? (
              <Button
                variant="outline"
                className="bg-gray-400 text-white px-4 py-2 rounded-md"
                disabled
              >
                Request Sent
              </Button>
            ) : (
              <Button
                onClick={handleSendRequest}
                variant="outline"
                className="bg-blue-600 text-white px-4 py-2 rounded-md"
              >
                Send Permission Request
              </Button>
            )}
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
