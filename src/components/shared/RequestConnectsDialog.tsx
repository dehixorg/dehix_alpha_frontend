'use client';

import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { Coins } from 'lucide-react';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { notifyError, notifySuccess } from '@/utils/toastMessage';
import { axiosInstance } from '@/lib/axiosinstance';
import { RootState } from '@/lib/store';

interface RequestConnectsDialogProps {
  userId: string;
}

export default function RequestConnectsDialog({
  userId,
}: RequestConnectsDialogProps) {
  const user = useSelector((state: RootState) => state.user);
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    const parsed = parseInt(amount, 10);
    if (isNaN(parsed) || parsed <= 0) {
      notifyError('Please enter a valid number of connects.', 'Invalid input');
      return;
    }
    if (parsed > 500) {
      notifyError(
        'You can request up to 500 connects at a time.',
        'Limit exceeded',
      );
      return;
    }

    setLoading(true);
    try {
      const backendUserType =
        user?.type === 'freelancer' ? 'FREELANCER' : 'BUSINESS';
      await axiosInstance.post(`/token-request`, {
        userId,
        userType: backendUserType,
        amount: parsed.toString(),
        status: 'PENDING',
        dateTime: new Date().toISOString(),
      });

      notifySuccess('Request to add connects has been sent.', 'Success!');

      const newConnect = {
        userId: userId,
        amount: parsed,
        status: 'PENDING',
        dateTime: new Date().toISOString(),
      } as any;

      window.dispatchEvent(
        new CustomEvent('newConnectRequest', { detail: newConnect }),
      );
      window.dispatchEvent(new Event('connectsUpdated'));
      setOpen(false);
      setAmount('');
    } catch (error: any) {
      console.error('Error requesting connects:', error?.response || error);
      notifyError('Failed to request connects. Try again!', 'Error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button size="sm" onClick={() => setOpen(true)} className="gap-2">
        <Coins className="h-4 w-4" /> Connect
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Request Connects</DialogTitle>
          </DialogHeader>

          <div className="space-y-3 p-2">
            <div>
              <label
                htmlFor="connectsAmount"
                className="text-sm text-muted-foreground"
              >
                How many connects do you want?
              </label>
              <Input
                id="connectsAmount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="e.g. 10"
                type="number"
                min={1}
                className="mt-2"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={loading} className="gap-2">
              {loading ? 'Sending...' : 'Request'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
