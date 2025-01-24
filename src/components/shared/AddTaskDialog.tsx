import React, { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { useParams } from 'next/navigation';

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { Badge } from '../ui/badge';
import { Avatar, AvatarFallback } from '../ui/avatar';

import { truncateDescription } from './MilestoneTimeline';

import { freelancers } from '@/utils/types/freeelancers';
import { axiosInstance } from '@/lib/axiosinstance';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Button } from '@/components/ui/button';

interface AddTaskDialogProps {
  isDialogOpen: boolean;
  setIsDialogOpen: (isOpen: boolean) => void;
  formData: {
    title: string;
    summary: string;
    taskStatus: string;
    freelancers: object;
  };
  handleFreelancerSelect: (freelancer: {
    _id: string;
    userName: string;
    perHourPrice: number;
  }) => void;
  handleInputChange: (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | string,
  ) => void;
  handelSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
}

const AddTaskDialog: React.FC<AddTaskDialogProps> = ({
  isDialogOpen,
  setIsDialogOpen,
  formData,
  handleInputChange,
  handelSubmit,
  handleFreelancerSelect,
}) => {
  const { project_id } = useParams<{ project_id: string }>();
  const [errors, setErrors] = useState({
    title: false,
    summary: false,
    taskStatus: false,
    freelancer: false,
  });

  const [freelancersData, setFreelancersData] = useState<freelancers[]>([]);
  const [filteredFreelancers, setFilteredFreelancers] = useState<freelancers[]>(
    [],
  );
  const [selectedFreelancer, setSelectedFreelancer] = useState<string | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(false);

  const validateForm = () => {
    const newErrors = {
      title: !formData.title.trim(),
      summary: !formData.summary.trim(),
      taskStatus: !formData.taskStatus,
      freelancer: !formData.freelancers,
    };
    setErrors(newErrors);
    return !Object.values(newErrors).some((error) => error);
  };

  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (validateForm()) {
      handelSubmit(e);
    }
  };

  useEffect(() => {
    const fetchFreelancers = async () => {
      setIsLoading(true);
      try {
        const response = await axiosInstance.get(
          `/project/get-freelancer/${project_id}`,
        );
        setFreelancersData(response.data.freelancers.freelancerData);
        setFilteredFreelancers(response.data.freelancers.freelancerData);
      } catch (error) {
        console.error('Failed to fetch freelancers:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (isDialogOpen) {
      fetchFreelancers();
    }
  }, [isDialogOpen]);

  const handleSearch = (query: string) => {
    const lowerCaseQuery = query.toLowerCase();

    const filtered = freelancersData.filter(
      (freelancer) =>
        freelancer.userName.toLowerCase().includes(lowerCaseQuery) ||
        freelancer.email.toLowerCase().includes(lowerCaseQuery),
    );

    setFilteredFreelancers(filtered);
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogContent className="w-full max-w-lg">
        <DialogHeader>
          <DialogTitle>Add New Task</DialogTitle>
        </DialogHeader>
        {isLoading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
          </div>
        ) : (
          <form onSubmit={handleFormSubmit}>
            <div className="space-y-4 p-4">
              {/* Task Title */}
              <div>
                <label
                  htmlFor="title"
                  className="block text-sm font-medium mb-1"
                >
                  Task Title
                </label>
                <Input
                  id="title"
                  name="title"
                  placeholder="Task Title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                  className={`${errors.title ? 'border-red-500' : ''}`}
                />
                {errors.title && (
                  <p className="text-red-500 text-xs mt-1">
                    Task title is required.
                  </p>
                )}
              </div>

              {/* Task Summary */}
              <div>
                <label
                  htmlFor="summary"
                  className="block text-sm font-medium mb-1"
                >
                  Task Summary
                </label>
                <Textarea
                  id="summary"
                  name="summary"
                  placeholder="Task Summary"
                  value={formData.summary}
                  onChange={handleInputChange}
                  required
                  className={`${errors.summary ? 'border-red-500' : ''}`}
                />
                {errors.summary && (
                  <p className="text-red-500 text-xs mt-1">
                    Task summary is required.
                  </p>
                )}
              </div>

              {/* Task Status Dropdown */}
              <div className="flex items-center gap-3">
                <label
                  htmlFor="taskStatus"
                  className="w-1/3 text-sm font-medium mb-1"
                >
                  Task Status
                </label>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className={`w-full border rounded-md text-left ${errors.taskStatus ? 'border-red-500' : ''}`}
                    >
                      {formData.taskStatus
                        ? {
                            NOT_STARTED: 'Not Started',
                            ONGOING: 'On Going',
                            COMPLETED: 'Completed',
                          }[formData.taskStatus]
                        : 'Select Status'}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem
                      onSelect={() => handleInputChange('NOT_STARTED')}
                    >
                      Not Started
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onSelect={() => handleInputChange('ONGOING')}
                    >
                      On Going
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onSelect={() => handleInputChange('COMPLETED')}
                    >
                      Completed
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              {errors.taskStatus && (
                <p className="text-red-500 text-xs mt-1">
                  Task status is required.
                </p>
              )}

              {/* Freelancer Selection */}
              <div className="flex items-center gap-3">
                <label
                  htmlFor="freelancer"
                  className="w-1/3 text-sm font-medium mb-1"
                >
                  Freelancer
                </label>
                <Popover>
                  <PopoverTrigger className="overscroll-y-none" asChild>
                    <Button
                      variant="ghost"
                      className={`w-full border rounded-md text-left ${errors.freelancer ? 'border-red-500' : ''}`}
                    >
                      {selectedFreelancer || 'Select Freelancer'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0">
                    <Command>
                      <CommandInput
                        placeholder="Search freelancer by username or email..."
                        onValueChange={(value: string) => handleSearch(value)}
                      />
                      <CommandList className=" overflow-x-visible max-h-[300px]">
                        {filteredFreelancers.length === 0 ? (
                          <CommandEmpty>No freelancers found.</CommandEmpty>
                        ) : (
                          <CommandGroup className=" block overflow-auto">
                            <div className="space-y-2 px-4 py-2">
                              {filteredFreelancers.map((freelancer) => {
                                return (
                                  <div
                                    key={freelancer._id}
                                    className="flex items-center justify-between gap-1 p-3 rounded-lg border shadow-sm hover:shadow-md cursor-pointer"
                                    onClick={() => {
                                      setSelectedFreelancer(
                                        freelancer.userName,
                                      );
                                      handleFreelancerSelect(freelancer);
                                    }}
                                  >
                                    <div className="flex items-center gap-3">
                                      <Avatar className="h-9 w-9">
                                        <AvatarFallback>
                                          {freelancer.userName
                                            .charAt(0)
                                            .toUpperCase()}
                                        </AvatarFallback>
                                      </Avatar>
                                      <div>
                                        <div className="text-sm font-medium">
                                          {freelancer.userName}
                                        </div>
                                        <div className="text-xs text-gray-500">
                                          {truncateDescription(
                                            freelancer.email,
                                            20,
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                    <Badge>{`${freelancer.role || 'N/A'}`}</Badge>
                                  </div>
                                );
                              })}
                            </div>
                          </CommandGroup>
                        )}
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>
              {errors.freelancer && (
                <p className="text-red-500 text-xs mt-1">
                  Freelancer selection is required.
                </p>
              )}
            </div>

            <DialogFooter>
              <Button type="submit">Add Task</Button>
              <Button
                type="button"
                variant="secondary"
                className="mb-3"
                onClick={() => setIsDialogOpen(false)}
              >
                Cancel
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default AddTaskDialog;
