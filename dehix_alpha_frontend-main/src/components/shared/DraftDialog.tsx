import React from 'react';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Button } from '../ui/button';

const DraftDialog = ({
  dialogChange,
  setDialogChange,
  heading,
  desc,
  handleClose,
  handleSave,
  btn1Txt,
  btn2Txt,
}: any) => {
  return (
    <Dialog open={dialogChange} onOpenChange={setDialogChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{heading}</DialogTitle>
          <DialogDescription>{desc}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            {btn1Txt}
          </Button>
          <Button onClick={handleSave}>{btn2Txt}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DraftDialog;
