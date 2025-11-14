import { useSelector } from 'react-redux';
import { MoreVertical, Edit, UserCheck } from 'lucide-react';
import { useState } from 'react';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';

import FreelancerDetailsDialog from './FreelancerDetailsDialog';
import TaskUpdateDeatilDialog from './TaskUpdateDetailDialog';

import { notifyError, notifySuccess } from '@/utils/toastMessage';
import { axiosInstance } from '@/lib/axiosinstance';

const TaskDropdown = ({ task, milestoneId, storyId, fetchMilestones }: any) => {
  const user = useSelector(
    (state: { user: { type: string; uid: string } }) => state.user,
  );
  const { type } = user;
  const [isDialogOpen, setDialogOpen] = useState(false);
  const [selectedFreelancer, setSelectedFreelancer] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showPermissionDialog, setShowPermissionDialog] = useState(false);

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

      // Provide specific feedback based on the action
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

  return (
    <>
      <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
        <DropdownMenuTrigger className="px-2 py-1 absolute bottom-1 right-0 rounded-md">
          <MoreVertical className="text-3xl w-5 h-5" />
          {(type == 'freelancer'
            ? task?.freelancers[0]?.updatePermissionBusiness &&
              task?.freelancers[0]?.updatePermissionFreelancer &&
              !task?.freelancers[0]?.rejectionFreelancer
            : task?.freelancers[0]?.updatePermissionBusiness &&
              task?.freelancers[0]?.updatePermissionFreelancer &&
              !task.freelancers[0]?.acceptanceFreelancer) && (
            <span className="absolute top-0 right-2 w-2 h-2 bg-red-500 rounded-full"></span>
          )}
          {(type == 'freelancer'
            ? task?.freelancers[0]?.updatePermissionBusiness &&
              !task?.freelancers[0]?.updatePermissionFreelancer &&
              task?.freelancers[0]?.rejectionFreelancer
            : !task?.freelancers[0]?.updatePermissionBusiness &&
              task?.freelancers[0]?.updatePermissionFreelancer &&
              task.freelancers[0]?.acceptanceFreelancer) && (
            <span className="absolute top-0 right-2 w-2 h-2 bg-yellow-500 rounded-full"></span>
          )}
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          className="w-56 p-2 border rounded-md shadow-md"
        >
          {user?.type === 'freelancer' &&
          task?.freelancers[0]?.freelancerId === user?.uid ? (
            <>
              <DropdownMenuItem
                className="flex items-center gap-2"
                onClick={handleRequestPermission}
                disabled={
                  task?.freelancers[0]?.rejectionFreelancer ||
                  !task?.freelancers[0]?.acceptanceFreelancer ||
                  (task?.freelancers[0]?.updatePermissionFreelancer &&
                    !task?.freelancers[0]?.updatePermissionBusiness)
                }
              >
                <Edit className="w-4 h-4 text-blue-500" />
                Update
                {task?.freelancers[0]?.rejectionFreelancer && (
                  <span className="ml-2 text-xs text-gray-500">
                    (Disabled - Task Rejected)
                  </span>
                )}
                {!task?.freelancers[0]?.acceptanceFreelancer &&
                  !task?.freelancers[0]?.rejectionFreelancer && (
                    <span className="ml-2 text-xs text-gray-500">
                      (Disabled - Task Not Accepted)
                    </span>
                  )}
                {task?.freelancers[0]?.updatePermissionFreelancer &&
                  !task?.freelancers[0]?.updatePermissionBusiness &&
                  task?.freelancers[0]?.acceptanceFreelancer &&
                  !task?.freelancers[0]?.rejectionFreelancer && (
                    <span className="ml-2 text-xs text-gray-500">
                      (Disabled - Waiting for Business Approval)
                    </span>
                  )}
              </DropdownMenuItem>
            </>
          ) : user?.type === 'business' ? (
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
                  View Freelancer
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

export default TaskDropdown;
