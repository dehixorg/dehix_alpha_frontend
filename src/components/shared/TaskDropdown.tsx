import { useSelector } from 'react-redux';
import { MoreVertical, CheckCircle, Edit, UserCheck } from 'lucide-react';
import { useState } from 'react';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { toast } from '../ui/use-toast';

import FreelancerDetailsDialog from './FreelancerDetailsDialog';
import TaskUpdateDeatilDialog from './TaskUpdateDetailDialog';

import { axiosInstance } from '@/lib/axiosinstance';

const TaskDropdown = ({ task, milestoneId, storyId, fetchMilestones }: any) => {
  const user = useSelector((state: { user: { type: string } }) => state.user);
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
    acceptanceBusiness: boolean,
    acceptanceFreelancer: boolean,
  ) => {
    const payload = {
      updatePermissionBusiness,
      updatePermissionFreelancer,
      acceptanceBusiness,
      acceptanceFreelancer,
    };

    const url = `/milestones/${milestoneId}/story/${storyId}/task/${task._id}`;

    try {
      await axiosInstance.patch(url, payload);

      setShowPermissionDialog(false);
      toast({
        title: 'Success',
        description: 'Permissions updated successfully.',
        duration: 3000,
      });
      fetchMilestones();
    } catch (error) {
      console.error('Error during permission request:', error);
      toast({
        title: 'Error',
        description: 'Failed to update permissions. Please try again.',
        variant: 'destructive',
        duration: 3000,
      });
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
              !task?.freelancers[0]?.acceptanceBusiness
            : task?.freelancers[0]?.updatePermissionBusiness &&
              task?.freelancers[0]?.updatePermissionFreelancer &&
              !task.freelancers[0]?.acceptanceFreelancer) && (
            <span className="absolute top-0 right-2 w-2 h-2 bg-red-500 rounded-full"></span>
          )}
          {(type == 'freelancer'
            ? task?.freelancers[0]?.updatePermissionBusiness &&
              !task?.freelancers[0]?.updatePermissionFreelancer &&
              task?.freelancers[0]?.acceptanceBusiness
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
          {type === 'freelancer' ? (
            <>
              {/* {task?.freelancers[0]?.acceptanceBusiness && (
                <DropdownMenuItem
                  className="flex items-center gap-2"
                  onClick={() =>
                    console.log(`Mark task as completed: ${task._id}`)
                  }
                >
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  Mark as Completed
                </DropdownMenuItem>
              )} */}
              <DropdownMenuItem
                className="flex items-center gap-2"
                onClick={handleRequestPermission}
              >
                <Edit className="w-4 h-4 text-blue-500" />
                Update Task Details
              </DropdownMenuItem>

              {!task?.freelancers[0]?.updatePermissionFreelancer &&
                task?.freelancers[0]?.updatePermissionBusiness &&
                !task?.freelancers[0]?.acceptanceFreelancer && (
                  <DropdownMenuItem
                    className="flex whitespace-nowrap text-xs  items-center gap-2"
                    onClick={() =>
                      handleConfirmPermissionRequest(true, true, true, false)
                    }
                  >
                    <CheckCircle className="w-4 h-4 text-yellow-500" />
                    Approve Updates permission
                  </DropdownMenuItem>
                )}

              {/* <DropdownMenuItem
                className="flex items-center gap-2"
                onClick={() =>
                  console.log(`View transaction details: ${task._id}`)
                }
              >
                <Eye className="w-4 h-4 text-gray-500" />
                View Transaction Details
              </DropdownMenuItem> */}
              {/* {task?.taskStatus === 'COMPLETED' &&
                task?.freelancers[0]?.paymentStatus !== 'COMPLETED' && (
                  <DropdownMenuItem
                    className="flex items-center gap-2"
                    onClick={() => console.log(`Request payment: ${task._id}`)}
                  >
                    <DollarSign className="w-4 h-4 text-blue-500" />
                    Request Payment
                  </DropdownMenuItem>
                )} */}
            </>
          ) : type === 'business' ? (
            <>
              {!task?.freelancers[0]?.updatePermissionBusiness &&
                task?.freelancers[0].updatePermissionFreelancer &&
                !task?.freelancers[0]?.acceptanceBusiness && (
                  <DropdownMenuItem
                    className="flex whitespace-nowrap text-xs  items-center gap-2"
                    onClick={() =>
                      handleConfirmPermissionRequest(true, true, false, true)
                    }
                  >
                    <CheckCircle className="w-4 h-4 text-yellow-500" />
                    Approve Updates permission
                  </DropdownMenuItem>
                )}
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
                onClick={handleRequestPermission}
              >
                <Edit className="w-4 h-4 text-blue-500" />
                Update Task Details
              </DropdownMenuItem>
            </>
          ) : (
            <DropdownMenuItem disabled className="text-gray-400">
              No actions available for this user type.
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
