import React from 'react';
import { Calendar } from 'lucide-react';
import { format, endOfDay } from 'date-fns';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Calendar as CalendarPicker } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { axiosInstance } from '@/lib/axiosinstance';
import { useToast } from '@/components/ui/use-toast';

interface VerifyDialogProps {
  talentType: string;
  talentId: string;
  userId: string;
}

const VerifyDialog: React.FC<VerifyDialogProps> = ({
  talentType,
  talentId,
  userId,
}) => {
  const [date, setDate] = React.useState<Date>();
  const [open, setOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const { toast } = useToast();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);

    if (!date) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Please select an interview date',
      });
      setLoading(false);
      return;
    }

    // Set the time to end of day in local timezone
    const localDate = endOfDay(date);

    const formData = {
      intervieweeId: userId,
      interviewType: 'INTERVIEWER',
      talentType: talentType.toUpperCase(),
      talentId: talentId,
      interviewDate: localDate.toISOString(), // Using the adjusted date
      description: (event.target as any).description.value,
    };
    console.log(formData);

    try {
      const response = await axiosInstance.post(
        `/interview/${userId}`,
        formData,
      );

      if (response.status === 200 || response.status === 201) {
        toast({
          title: 'Success',
          description: 'Interview scheduled successfully',
        });
        setOpen(false);
      }
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description:
          error.response?.data?.message || 'Failed to schedule interview',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="bg-primary text-primary-foreground hover:bg-primary/90 hover:text-black"
        >
          Verify
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">
            Verify {talentType}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <label
              htmlFor="talentType"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Type
            </label>
            <Input
              id="talentType"
              value={talentType}
              disabled
              className="bg-muted"
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="interviewDate"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Interview Date
            </label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id="interviewDate"
                  variant="outline"
                  className={cn(
                    'w-full justify-start text-left font-normal',
                    !date && 'text-muted-foreground',
                  )}
                >
                  <Calendar className="mr-2 h-4 w-4" />
                  {date ? format(date, 'PPP') : 'Pick a date'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <CalendarPicker
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  initialFocus
                  disabled={(date) => date < new Date()}
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <label
              htmlFor="description"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Description
            </label>
            <Textarea
              id="description"
              name="description"
              placeholder="Enter interview description"
              className="min-h-[100px] resize-none"
              required
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                Scheduling...
              </span>
            ) : (
              'Schedule Interview'
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default VerifyDialog;
