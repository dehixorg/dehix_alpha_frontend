'use client';

import { useState } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { Coins, AlertTriangle } from 'lucide-react';

import { notifyError, notifySuccess } from '@/utils/toastMessage';
import { axiosInstance } from '@/lib/axiosinstance';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
interface ConnectsDialogProps {
  form: UseFormReturn<any>;
  loading: boolean;
  setLoading: (loading: boolean) => void;
  onSubmit: any;
  isValidCheck: () => Promise<boolean>;
  userId: string;
  buttonText: string;
  userType: string;
  requiredConnects: number;
  data?: any;
}

export default function ConnectsDialog({
  loading,
  setLoading,
  onSubmit,
  isValidCheck,
  userId,
  buttonText,
  userType,
  requiredConnects,
  data,
}: ConnectsDialogProps) {
  const [openConfirm, setOpenConfirm] = useState(false);
  const [lowConnects, setLowConnects] = useState(false);

  const userConnects = parseInt(
    localStorage.getItem('DHX_CONNECTS') || '0',
    10,
  );

  const fetchMoreConnects = async () => {
    try {
      await axiosInstance.post(`/token-request`, {
        userId,
        userType,
        amount: '100',
        status: 'PENDING',
        dateTime: new Date().toISOString(),
      });
      notifySuccess('Request to add connects has been sent.', 'Success!');
      const newConnect = {
        userId: userId,
        amount: 100,
        status: 'PENDING',
        dateTime: new Date().toISOString(),
      };

      window.dispatchEvent(
        new CustomEvent('newConnectRequest', { detail: newConnect }),
      );
    } catch (error: any) {
      console.error('Error requesting more connects:', error.response);
      notifyError('Failed to request connects. Try again!', 'Error!');
    }
  };

  const dialogOpen = async () => {
    const isValid = await isValidCheck();
    if (!isValid) return;

    if (userConnects < requiredConnects) {
      setLowConnects(true);
      setOpenConfirm(true);
      return;
    }

    setLowConnects(false);
    setOpenConfirm(true);
  };
  const router = useRouter();
  const handleConfirm = async () => {
    if (lowConnects) return;
    setLoading(true);
    try {
      if (data) {
        await onSubmit(data);
      } else {
        await onSubmit();
      }
      router.push('/dashboard/business');
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
        size="sm"
        disabled={loading}
        onClick={dialogOpen}
        className="gap-2"
      >
        <Coins className="h-4 w-4" />
        {loading ? 'Loading...' : buttonText}
      </Button>
      <Dialog open={openConfirm} onOpenChange={setOpenConfirm}>
        <DialogContent className="sm:max-w-md">
          {lowConnects ? (
            <>
              <div className="flex items-start gap-3">
                <div className="mt-1 rounded-full bg-amber-500/10 text-amber-600 p-2">
                  <AlertTriangle className="h-5 w-5" />
                </div>
                <div className="space-y-1">
                  <DialogTitle>Insufficient connects</DialogTitle>
                  <DialogDescription>
                    You need more connects to create this project.
                  </DialogDescription>
                </div>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                <div className="rounded-md border p-2">
                  <div className="text-muted-foreground">Your connects</div>
                  <div className="font-semibold">{userConnects}</div>
                </div>
                <div className="rounded-md border p-2">
                  <div className="text-muted-foreground">Required</div>
                  <div className="font-semibold">{requiredConnects}</div>
                </div>
              </div>
              <DialogFooter className="mt-4">
                <Button variant="outline" onClick={() => setOpenConfirm(false)}>
                  Close
                </Button>
                <Button onClick={fetchMoreConnects}>Request connects</Button>
              </DialogFooter>
            </>
          ) : (
            <>
              <div className="space-y-2">
                <div className="flex items-start gap-3">
                  <div className="mt-1 rounded-full bg-primary/10 text-primary p-2">
                    <Coins className="h-5 w-5" />
                  </div>
                  <div className="space-y-1">
                    <DialogTitle>Confirm connects deduction</DialogTitle>
                    <DialogDescription>
                      Creating this project will deduct the following from your
                      balance.
                    </DialogDescription>
                  </div>
                </div>

                <div className="rounded-md border p-3 flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Deduction
                  </span>
                  <span className="font-semibold flex items-center gap-1">
                    <Coins className="h-4 w-4" /> {requiredConnects}
                  </span>
                </div>
              </div>

              <DialogFooter className="mt-2">
                <Button variant="outline" onClick={() => setOpenConfirm(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={handleConfirm}
                  disabled={loading}
                  className="gap-2"
                >
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
