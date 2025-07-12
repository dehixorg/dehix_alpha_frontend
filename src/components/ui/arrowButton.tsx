import { ChevronRight } from "lucide-react";
import { Button, ButtonProps } from "@/components/ui/button";

export function ButtonIcon({
  onClick,
  variant = "ghost",
  ...props
}: ButtonProps) {
  return (
    <Button
      variant={variant}
      size="icon"
      className="h-4 py-3"
      onClick={onClick}
      {...props}
    >
      <ChevronRight className="w-4 h-4" />
    </Button>
  );
}
