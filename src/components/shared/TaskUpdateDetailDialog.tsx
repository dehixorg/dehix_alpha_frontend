import React, { useState, useEffect } from 'react';
import {
  AlertCircle,
  ChevronDown,
  FileText,
  Loader2,
  Tag,
  User,
  X,
} from 'lucide-react';
import { useParams } from 'next/navigation';

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
import { Badge } from '../ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '../ui/command';
import { Avatar, AvatarFallback } from '../ui/avatar';
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
import { freelancers as FreelancerType } from '@/utils/types/freeelancers';

interface TaskUpdateDetailDialogProps {
  task: any;
  milestoneId?: string;
  storyId: string;
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
  userType,
  showPermissionDialog,
  setShowPermissionDialog,
  fetchMilestones,
}) => {
  const { project_id } = useParams<{ project_id: string }>();
  const [taskData, setTaskData] = useState({
    title: task?.title || '',
    summary: task?.summary || '',
    taskStatus: task?.taskStatus || TaskStatus.NOT_STARTED,
  });

  // Freelancer assignment state
  const existingFreelancer = task?.freelancers?.[0];
  const isTaskUnassigned = !existingFreelancer?.freelancerId;
  const [freelancersData, setFreelancersData] = useState<FreelancerType[]>([]);
  const [filteredFreelancers, setFilteredFreelancers] = useState<
    FreelancerType[]
  >([]);
  const [selectedFreelancer, setSelectedFreelancer] = useState<string | null>(
    null,
  );
  const [isFreelancerPopoverOpen, setIsFreelancerPopoverOpen] = useState(false);
  const [isLoadingFreelancers, setIsLoadingFreelancers] = useState(false);
  const [assignedFreelancerData, setAssignedFreelancerData] = useState<{
    freelancerId: string;
    freelancerName: string;
    cost: number;
  } | null>(null);

  // Fetch freelancers when dialog opens (only for business users with unassigned tasks)
  useEffect(() => {
    const fetchFreelancers = async () => {
      setIsLoadingFreelancers(true);
      try {
        const response = await axiosInstance.get(
          `/project/get-freelancer/${project_id}/FREELANCER`,
        );
        const data = response.data.freelancers.data || [];
        setFreelancersData(data);
        setFilteredFreelancers(data);
      } catch (error) {
        console.error('Failed to fetch freelancers:', error);
      } finally {
        setIsLoadingFreelancers(false);
      }
    };

    if (showPermissionDialog && userType === 'business' && isTaskUnassigned) {
      fetchFreelancers();
    }
  }, [showPermissionDialog, project_id, userType, isTaskUnassigned]);

  const handleFreelancerSearch = (query: string) => {
    const lowerCaseQuery = query.toLowerCase();
    const filtered = freelancersData.filter(
      (freelancer) =>
        freelancer.userName.toLowerCase().includes(lowerCaseQuery) ||
        freelancer.email.toLowerCase().includes(lowerCaseQuery),
    );
    setFilteredFreelancers(filtered);
  };

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

    const url = `/milestones/${milestoneId}/story/${storyId}/task/${task._id}/permission`;

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
    const hasFieldChanges =
      JSON.stringify(taskData) !== JSON.stringify(initialTaskData);
    const hasFreelancerChange = !!assignedFreelancerData;

    if (!hasFieldChanges && !hasFreelancerChange) {
      notifySuccess('No changes detected. Task update not required.', 'Info');
      return;
    }

    const url = `/milestones/${milestoneId}/story/${storyId}/task/${task._id}`;

    const payload: any = {
      title: taskData.title,
      summary: taskData.summary,
      taskStatus: taskData.taskStatus,
    };

    if (assignedFreelancerData) {
      payload.freelancers = [
        {
          freelancerId: assignedFreelancerData.freelancerId,
          freelancerName: assignedFreelancerData.freelancerName,
          cost: assignedFreelancerData.cost,
        },
      ];
    }

    try {
      await axiosInstance.patch(url, payload);
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
    JSON.stringify(taskData) !== JSON.stringify(initialTaskData) ||
    !!assignedFreelancerData;

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

            {/* Freelancer Assignment (only for business users with unassigned tasks) */}
            {userType === 'business' && isTaskUnassigned && (
              <div className="grid gap-2">
                <Label className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  Assign Freelancer
                </Label>
                {isLoadingFreelancers ? (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground py-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Loading freelancers...
                  </div>
                ) : (
                  <>
                    <Popover
                      open={isFreelancerPopoverOpen}
                      onOpenChange={setIsFreelancerPopoverOpen}
                    >
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          role="combobox"
                          aria-expanded={isFreelancerPopoverOpen}
                          className="w-full justify-between"
                          disabled={isDisabled}
                        >
                          {selectedFreelancer ? (
                            <div className="flex items-center gap-2">
                              <Avatar className="h-5 w-5">
                                <AvatarFallback>
                                  {freelancersData
                                    .find((f) => f._id === selectedFreelancer)
                                    ?.userName?.charAt(0)
                                    .toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              {
                                freelancersData.find(
                                  (f) => f._id === selectedFreelancer,
                                )?.userName
                              }
                            </div>
                          ) : (
                            <span className="text-muted-foreground">
                              Select freelancer...
                            </span>
                          )}
                          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-full p-0" align="start">
                        <Command>
                          <CommandInput
                            placeholder="Search freelancers..."
                            onValueChange={handleFreelancerSearch}
                          />
                          <CommandEmpty>No freelancer found.</CommandEmpty>
                          <CommandList>
                            <CommandGroup>
                              {filteredFreelancers.map((freelancer) => (
                                <CommandItem
                                  key={freelancer._id}
                                  value={freelancer._id}
                                  onSelect={() => {
                                    setSelectedFreelancer(freelancer._id);
                                    setAssignedFreelancerData({
                                      freelancerId: freelancer._id,
                                      freelancerName: freelancer.userName,
                                      cost:
                                        Number(freelancer.perHourPrice) || 0,
                                    });
                                    setIsFreelancerPopoverOpen(false);
                                  }}
                                  className="cursor-pointer"
                                >
                                  <div className="flex items-center gap-2">
                                    <Avatar className="h-8 w-8">
                                      <AvatarFallback>
                                        {freelancer.userName
                                          ?.charAt(0)
                                          .toUpperCase()}
                                      </AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1">
                                      <p className="text-sm font-medium">
                                        {freelancer.userName}
                                      </p>
                                      <p className="text-xs text-muted-foreground">
                                        {freelancer.email}
                                      </p>
                                    </div>
                                    {freelancer.perHourPrice && (
                                      <Badge variant="outline" className="ml-2">
                                        ${freelancer.perHourPrice}/hr
                                      </Badge>
                                    )}
                                  </div>
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>

                    {selectedFreelancer && (
                      <div className="p-3 bg-muted/20 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Avatar className="h-7 w-7">
                              <AvatarFallback>
                                {freelancersData
                                  .find((f) => f._id === selectedFreelancer)
                                  ?.userName?.charAt(0)
                                  .toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="text-sm font-medium">
                                {
                                  freelancersData.find(
                                    (f) => f._id === selectedFreelancer,
                                  )?.userName
                                }
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {
                                  freelancersData.find(
                                    (f) => f._id === selectedFreelancer,
                                  )?.email
                                }
                              </p>
                            </div>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => {
                              setSelectedFreelancer(null);
                              setAssignedFreelancerData(null);
                            }}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
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
