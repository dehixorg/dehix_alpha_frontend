import { toast } from '@/components/ui/use-toast';

export const notifyError = (description: string, title: string = 'Error') => {
  toast({ variant: 'destructive', title, description });
};

export const notifySuccess = (
  description: string,
  title: string = 'Success',
) => {
  toast({ title, description });
};
