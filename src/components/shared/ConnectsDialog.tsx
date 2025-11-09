'use client';

import { useState } from 'react';
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
  DialogOverlay,
  DialogPortal,
} from '@/components/ui/dialog';
interface ConnectsDialogProps {
  loading: boolean;
  setLoading: (loading: boolean) => void;
  onSubmit: any;
  isValidCheck: () => Promise<boolean>;
  userId: string;
  buttonText: string;
  userType: string;
  requiredConnects: number;
  data?: any;
  skipRedirect?: boolean;
  onCloseParentDialog?: () => void;
  externalOpen?: boolean;
  setExternalOpen?: (open: boolean) => void;
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
  skipRedirect = false,
  onCloseParentDialog,
  externalOpen,
  setExternalOpen,
}: ConnectsDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const [lowConnects, setLowConnects] = useState(false);

  // Use external state if provided, otherwise use internal state
  const openConfirm = externalOpen !== undefined ? externalOpen : internalOpen;
  const setOpenConfirm =
    setExternalOpen !== undefined ? setExternalOpen : setInternalOpen;

  const getUserConnects = () => {
    try {
      return parseInt(localStorage.getItem('DHX_CONNECTS') || '0', 10);
    } catch (error) {
      console.error('Failed to read connects from localStorage:', error);
      return 0;
    }
  };

  const userConnects = getUserConnects();

  const router = useRouter();

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

      try {
        if (typeof window !== 'undefined') {
          window.dispatchEvent(
            new CustomEvent('newConnectRequest', { detail: newConnect }),
          );
        }
      } catch (error) {
        console.error('Failed to dispatch event:', error);
      }
    } catch (error: any) {
      console.error('Error requesting more connects:', error.response);
      notifyError('Failed to request connects. Try again!', 'Error!');
    }
  };

  const dialogOpen = async (e?: React.MouseEvent) => {
    e?.stopPropagation();
    const isValid = await isValidCheck();
    if (!isValid) return;

    // Set the dialog state first
    if (userConnects < requiredConnects) {
      setLowConnects(true);
    } else {
      setLowConnects(false);
    }
    setOpenConfirm(true);

    // Close parent dialog immediately after opening confirm dialog
    if (onCloseParentDialog) {
      // Use requestAnimationFrame for smoother transition
      requestAnimationFrame(() => {
        onCloseParentDialog();
      });
    }
  };
  const handleConfirm = async () => {
    if (lowConnects) return;
    setLoading(true);
    try {
      if (data) {
        await onSubmit(data);
      } else {
        await onSubmit();
      }
      if (!skipRedirect) {
        router.push('/dashboard/business');
      }
      setOpenConfirm(false);
    } catch (error) {
      console.error('Error deducting connects:', error);
      alert('Failed to deduct connects. Try again!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
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
      <Dialog open={openConfirm} onOpenChange={setOpenConfirm} modal={true}>
        <DialogPortal>
          <DialogOverlay
            style={{ zIndex: 9998, backgroundColor: 'transparent' }}
          />
          <DialogContent
            className="sm:max-w-md bg-background"
            onInteractOutside={(e) => e.preventDefault()}
            style={{
              position: 'fixed',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              zIndex: 9999,
              border: '1px solid hsl(var(--border))',
              borderRadius: 'calc(var(--radius) + 0.5rem)',
              boxShadow:
                '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            }}
          >
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
                  <Button
                    variant="outline"
                    onClick={() => setOpenConfirm(false)}
                  >
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
                        Creating this project will deduct the following from
                        your balance.
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
                  <Button
                    variant="outline"
                    onClick={() => setOpenConfirm(false)}
                  >
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
        </DialogPortal>
      </Dialog>
    </>
  );
}
