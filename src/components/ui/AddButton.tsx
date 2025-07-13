import React from 'react';
import { PlusCircle } from 'lucide-react';
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
    <div className="flex justify-center mt-4">
      <Button
        onClick={onClick}
        className={cn(
          "text-center justify-items-center dark:text-black light:bg-black px-72",
          className
        )}
        {...props}
      >
        <PlusCircle />
      </Button>
    </div>
  );
};