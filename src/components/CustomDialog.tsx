import { Dispatch, SetStateAction } from "react";
import { ButtonIcon } from "./ui/arrowButton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";

type Params = {
  title: string | React.JSX.Element;
  description: string | React.JSX.Element;
  content: string | React.JSX.Element;
  footer?: string | React.JSX.Element;
  triggerContent?: string | React.JSX.Element;
  triggerState?: boolean;
  setTriggerState?: Dispatch<SetStateAction<boolean>>;
};

export function CustomDialog({
  title,
  description,
  content,
  footer,
  triggerState,
  setTriggerState,
  triggerContent,
}: Params) {
  return (
    <Dialog open={triggerState} onOpenChange={setTriggerState}>
      {<DialogTrigger asChild>{triggerContent || <ButtonIcon />}</DialogTrigger>}
      <DialogContent className="p-4 max-h-[80%] overflow-y-scroll">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        {content}
        <DialogFooter>
          {footer}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
