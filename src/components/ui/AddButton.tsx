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
          'w-full max-w-full mx-6 text-center justify-center dark:text-black light:bg-black',
          className,
        )}
        {...props}
      >
        <PlusCircle />
      </Button>
    </div>
  );
};
