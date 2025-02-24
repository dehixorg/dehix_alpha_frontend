'use client';

import { useState } from 'react';

import { toast } from '../ui/use-toast';

import { axiosInstance } from '@/lib/axiosinstance';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';

export default function ConnectsDialog({
  loading,
  setLoading,
  onSubmit,
  isValidCheck,
  userId,
}: any) {
  const [openConfirm, setOpenConfirm] = useState(false);
  const [lowConnects, setLowConnects] = useState(false);

  const PROJECT_CREATION_COST = parseInt(
    process.env.NEXT_PUBLIC__APP_PROJECT_CREATION_COST || '0',
    10,
  );
  const userConnects = parseInt(localStorage.getItem('DHX_CONNECTS') || '0');

  const fetchMoreConnects = async () => {
    try {
      const isBusiness = true;
      await axiosInstance.patch(
        `/public/connect?userId=${userId}&isBusiness=${isBusiness}`,
      );

      toast({
        title: 'Success!',
        description: '100 connects have been added to your wallet.',
        duration: 3000,
      });

      const currentConnects = parseInt(
        localStorage.getItem('DHX_CONNECTS') || '0',
        10,
      );
      const updatedConnects = Math.max(0, currentConnects + 100);
      localStorage.setItem('DHX_CONNECTS', updatedConnects.toString());
      window.dispatchEvent(new Event('connectsUpdated'));
    } catch (error: any) {
      console.error('Error requesting more connects:', error.response);
      toast({
        variant: 'destructive',
        title: 'Error!',
        description: 'Failed to request connects. Try again!',
        duration: 3000,
      });
    }
  };

  const dialogOpen = async () => {
    const isValid = await isValidCheck();
    if (!isValid) return;

    if (userConnects < PROJECT_CREATION_COST) {
      setLowConnects(true);
      setOpenConfirm(true);
      return;
    }

    setLowConnects(false);
    setOpenConfirm(true);
  };

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await onSubmit();
      setOpenConfirm(false);
    } catch (error) {
      console.error('Error deducting connects:', error);
      alert('Failed to deduct connects. Try again!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Button
        type="button"
        className="lg:col-span-2 w-full xl:col-span-2 mt-4"
        disabled={loading}
        onClick={dialogOpen}
      >
        {loading ? 'Loading...' : 'Create Project'}
      </Button>
      <Dialog open={openConfirm} onOpenChange={setOpenConfirm}>
        <DialogContent>
          {lowConnects ? (
            <>
              <DialogTitle>Insufficient Connects</DialogTitle>
              <DialogDescription>
                You don&apos;t have enough connects to create a project.
                <br />
                Please{' '}
                <span
                  className="text-blue-600 font-bold cursor-pointer"
                  onClick={fetchMoreConnects}
                >
                  Request Connects
                </span>{' '}
                to proceed.
              </DialogDescription>
              <DialogFooter>
                <Button variant="outline" onClick={() => setOpenConfirm(false)}>
                  Close
                </Button>
              </DialogFooter>
            </>
          ) : (
            <>
              <DialogTitle>Confirm Deduction</DialogTitle>
              <Input type="text" value={PROJECT_CREATION_COST} disabled />
              <DialogDescription>
                Creating this project will deduct{' '}
                <span className="font-extrabold">
                  {' '}
                  {PROJECT_CREATION_COST} connects
                </span>
                . Do you want to proceed?
              </DialogDescription>
              <DialogFooter>
                <Button variant="outline" onClick={() => setOpenConfirm(false)}>
                  Cancel
                </Button>
                <Button onClick={handleConfirm} disabled={loading}>
                  {loading ? 'Processing...' : 'Confirm'}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
