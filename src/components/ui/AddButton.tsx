import React from 'react';
import { Plus, PlusCircle } from 'lucide-react';
import { Button, type ButtonProps } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface AddButtonProps extends Omit<ButtonProps, 'children'> {
  onClick: () => void;
}

export const AddButton: React.FC<AddButtonProps> = ({
  onClick,
  className,
  ...props
}) => {
  return (
    <Button
      onClick={onClick}
      variant="outline"
      size="icon"
      className={cn('w-full mt-4 text-center justify-center', className)}
      {...props}
    >
      <Plus />
    </Button>
  );
};
