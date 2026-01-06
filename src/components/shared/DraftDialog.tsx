import React from 'react';
import { FileText } from 'lucide-react';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Button } from '../ui/button';

type DraftDialogProps = {
  dialogChange: boolean;
  setDialogChange: (open: boolean) => void;
  heading: React.ReactNode;
  desc?: React.ReactNode;
  handleClose: () => void;
  handleSave: () => void;
  btn1Txt: React.ReactNode;
  btn2Txt: React.ReactNode;
  icon?: React.ReactNode;
};

const DraftDialog = ({
  dialogChange,
  setDialogChange,
  heading,
  desc,
  handleClose,
  handleSave,
  btn1Txt,
  btn2Txt,
  icon,
}: DraftDialogProps) => {
  return (
    <Dialog open={dialogChange} onOpenChange={setDialogChange}>
      <DialogContent className="sm:max-w-[440px]">
        <DialogHeader>
          <div className="flex items-start gap-3">
            <div className="mt-0.5 h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              {icon ?? <FileText className="h-5 w-5" />}
            </div>
            <div className="space-y-1">
              <DialogTitle className="leading-tight">{heading}</DialogTitle>
              {desc ? (
                <DialogDescription className="leading-relaxed">
                  {desc}
                </DialogDescription>
              ) : null}
            </div>
          </div>
        </DialogHeader>

        <DialogFooter className="gap-2 sm:gap-2">
          <Button
            variant="outline"
            onClick={handleClose}
            className="w-full sm:w-auto"
          >
            {btn1Txt}
          </Button>
          <Button onClick={handleSave} className="w-full sm:w-auto">
            {btn2Txt}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DraftDialog;
