import { Button, ButtonProps } from '@/components/ui/button';

interface ButtonIconProps extends ButtonProps {
  icon: React.ReactNode;
}

export function ButtonIcon({
  onClick,
  variant = 'ghost',
  icon,
  ...props
}: ButtonIconProps) {
  return (
    <Button
      variant={variant}
      size="icon"
      className="h-4 py-4"
      onClick={onClick}
      {...props}
    >
      {icon}
    </Button>
  );
}
