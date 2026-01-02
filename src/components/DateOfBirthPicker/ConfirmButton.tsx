import { Button } from '@/components/ui/button';

interface ConfirmButtonProps {
  onConfirm: () => void;
}

const ConfirmButton = ({ onConfirm }: ConfirmButtonProps) => (
  <Button type="button" onClick={onConfirm} className="w-full">
    Continue
  </Button>
);

export default ConfirmButton;
