import React, { useState, useEffect } from 'react';
import {
  Loader2,
  Plus,
  User,
  X,
  Calendar,
  FileText,
  Tag,
  AlertCircle,
  ChevronDown,
} from 'lucide-react';
import { useParams } from 'next/navigation';
import { format } from 'date-fns';

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Label } from '../ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '../ui/command';
import { Calendar as CalendarComponent } from '../ui/calendar';
import { Avatar, AvatarFallback } from '../ui/avatar';

import { freelancers } from '@/utils/types/freeelancers';
import { axiosInstance } from '@/lib/axiosinstance';
import { notifyError } from '@/utils/toastMessage';
import { cn } from '@/lib/utils';

interface AddTaskDialogProps {
  isDialogOpen: boolean;
  setIsDialogOpen: (isOpen: boolean) => void;
  formData: {
    title: string;
    summary: string;
    taskStatus: string;
    freelancers: object;
    dueDate?: string;
  };
  handleFreelancerSelect: (freelancer: {
    _id: string;
    userName: string;
    perHourPrice: number;
  }) => void;
  handleInputChange: (
    event:
      | React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
      | { target: { name: string; value: any } },
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
  const [isFreelancerPopoverOpen, setIsFreelancerPopoverOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const validateForm = () => {
    const newErrors = {
      title: !formData.title.trim(),
      summary: !formData.summary.trim(),
      taskStatus: !formData.taskStatus,
      freelancer: !selectedFreelancer,
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
          `/project/get-freelancer/${project_id}/FREELANCER`,
        );
        const freelancerData = response.data.freelancers.data || [];

        if (freelancerData.length === 0) {
          notifyError(
            'No freelancers with accepted bids found for this project. Please accept some bids first.',
            'No Freelancers Available',
          );
        }

        setFreelancersData(freelancerData);
        setFilteredFreelancers(freelancerData);
      } catch (error) {
        console.error('Failed to fetch freelancers:', error);
        notifyError('Something went wrong. Please try again.', 'Error');
      } finally {
        setIsLoading(false);
      }
    };

    if (isDialogOpen) {
      fetchFreelancers();
    }
  }, [isDialogOpen, project_id]);

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
      <DialogContent className="w-full max-w-2xl">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            <DialogTitle className="text-xl font-semibold">
              Create New Task
            </DialogTitle>
          </div>
          <p className="text-sm text-muted-foreground">
            Add details about the task to assign to a freelancer
          </p>
        </DialogHeader>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <Loader2 className="h-10 w-10 text-primary animate-spin" />
            <p className="text-sm text-muted-foreground">
              Loading available freelancers...
            </p>
          </div>
        ) : (
          <form onSubmit={handleFormSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {/* Task Title */}
                <div className="space-y-2">
                  <Label htmlFor="title" className="flex items-center gap-2">
                    <Tag className="h-4 w-4 text-muted-foreground" />
                    Task Title
                  </Label>
                  <Input
                    id="title"
                    name="title"
                    placeholder="e.g., Design Homepage Mockup"
                    value={formData.title}
                    onChange={handleInputChange}
                    className={cn(
                      'w-full',
                      errors.title && 'border-destructive',
                    )}
                  />
                  {errors.title && (
                    <p className="text-sm text-destructive flex items-center gap-1">
                      <AlertCircle className="h-4 w-4" />
                      Task title is required
                    </p>
                  )}
                </div>

                {/* Due Date */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    Due Date
                  </Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          'w-full justify-start text-left font-normal',
                          !formData.dueDate && 'text-muted-foreground',
                        )}
                      >
                        <Calendar className="mr-2 h-4 w-4" />
                        {formData.dueDate ? (
                          format(new Date(formData.dueDate), 'PPP')
                        ) : (
                          <span>Pick a due date</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <CalendarComponent
                        mode="single"
                        selected={
                          formData.dueDate
                            ? new Date(formData.dueDate)
                            : undefined
                        }
                        onSelect={(date) =>
                          handleInputChange({
                            target: {
                              name: 'dueDate',
                              value: date?.toISOString(),
                            },
                          } as any)
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
              {/* Task Description */}
              <div className="space-y-2">
                <Label htmlFor="summary" className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  Task Description
                </Label>
                <Textarea
                  id="summary"
                  name="summary"
                  placeholder="Describe the task in detail..."
                  value={formData.summary}
                  onChange={handleInputChange}
                  className={cn(
                    'min-h-[120px]',
                    errors.summary && 'border-destructive',
                  )}
                />
                {errors.summary && (
                  <p className="text-sm text-destructive flex items-center gap-1 mt-1">
                    <AlertCircle className="h-4 w-4" />
                    Task description is required
                  </p>
                )}
              </div>

              {/* Freelancer Selection */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  Assignee
                </Label>
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
                        'Select freelancer...'
                      )}
                      <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0" align="start">
                    <Command>
                      <CommandInput
                        placeholder="Search freelancers..."
                        onValueChange={handleSearch}
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
                                handleFreelancerSelect({
                                  _id: freelancer._id,
                                  userName: freelancer.userName,
                                  perHourPrice: freelancer.perHourPrice || 0,
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
                {errors.freelancer && (
                  <p className="text-sm text-destructive flex items-center gap-1 mt-1">
                    <AlertCircle className="h-4 w-4" />
                    Please select a freelancer
                  </p>
                )}
              </div>

              {selectedFreelancer && (
                <div className="p-4 bg-muted/20 rounded-lg space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Avatar>
                        <AvatarFallback>
                          {freelancersData
                            .find((f) => f._id === selectedFreelancer)
                            ?.userName?.charAt(0)
                            .toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">
                          {
                            freelancersData.find(
                              (f) => f._id === selectedFreelancer,
                            )?.userName
                          }
                        </p>
                        <p className="text-sm text-muted-foreground">
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
                      onClick={() => {
                        setSelectedFreelancer(null);
                        handleFreelancerSelect({
                          _id: '',
                          userName: '',
                          perHourPrice: 0,
                        });
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>

                  {freelancersData.find((f) => f._id === selectedFreelancer)
                    ?.perHourPrice && (
                    <div className="flex items-center text-sm">
                      <span className="text-muted-foreground">Rate:</span>
                      <span className="font-medium ml-1">
                        $
                        {
                          freelancersData.find(
                            (f) => f._id === selectedFreelancer,
                          )?.perHourPrice
                        }
                        /hr
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>

            <DialogFooter className="mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={
                  !formData.title || !formData.summary || !selectedFreelancer
                }
              >
                <Plus className="mr-2 h-4 w-4" />
                Create Task
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default AddTaskDialog;
