'use client';

import React from 'react';
import { Loader2 } from 'lucide-react';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => Promise<void>;
  loading: boolean;
  cost: number | null;
}

const ConnectsDialog: React.FC<Props> = ({
  open,
  onOpenChange,
  onConfirm,
  loading,
  cost,
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirm Hire</DialogTitle>
          <DialogDescription>
            Are you sure you want to hire this freelancer?
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <p className="text-sm text-muted-foreground">
            This action will deduct{' '}
            <strong>
              {cost ?? process.env.NEXT_PUBLIC__APP_HIRE_TALENT_COST ?? '0'}
            </strong>{' '}
            connects from your wallet.
          </p>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={onConfirm} disabled={loading}>
            {loading ? (
              <Loader2 className="animate-spin" />
            ) : (
              'Confirm & Hire'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ConnectsDialog;
