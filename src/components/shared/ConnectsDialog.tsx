'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Zap, AlertTriangle } from 'lucide-react';

import { updateConnectsBalance } from '@/lib/updateConnects';
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
  isValidCheck?: () => Promise<boolean>;
  userId: string;
  buttonText?: string;
  userType: string;
  requiredConnects: number;
  data?: any;
  skipRedirect?: boolean;
  onCloseParentDialog?: () => void;
  externalOpen?: boolean;
  setExternalOpen?: (open: boolean) => void;
  resourceName?: string;
  hideTrigger?: boolean;
}

export function ConnectsIcon({
  className = 'h-5 w-5',
  strokeWidth = 2.2,
  ...props
}: { className?: string; strokeWidth?: number } & React.ComponentProps<
  typeof Zap
>) {
  return <Zap className={className} strokeWidth={strokeWidth} {...props} />;
}

export default function ConnectsDialog({
  loading,
  setLoading,
  onSubmit,
  isValidCheck,
  userId,
  buttonText = 'Submit',
  userType,
  requiredConnects,
  data,
  skipRedirect = false,
  onCloseParentDialog,
  externalOpen,
  setExternalOpen,
  resourceName = 'project',
  hideTrigger = false,
}: ConnectsDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);

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
    if (isValidCheck) {
      const isValid = await isValidCheck();
      if (!isValid) return;
    }

    setOpenConfirm(true);

    if (onCloseParentDialog) {
      requestAnimationFrame(() => {
        onCloseParentDialog();
      });
    }
  };

  const handleConfirm = async () => {
    if (isLowConnects) return;
    setLoading(true);
    try {
      let response: any;
      if (data) {
        response = await onSubmit(data);
      } else {
        response = await onSubmit();
      }

      const remainingConnects =
        response?.data?.remainingConnects || response?.remainingConnects;
      if (typeof remainingConnects === 'number') {
        updateConnectsBalance(remainingConnects);
      } else if (
        typeof userConnects === 'number' &&
        typeof requiredConnects === 'number'
      ) {
        updateConnectsBalance(userConnects - requiredConnects);
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

  const isLowConnects = userConnects < requiredConnects;
  const remainingAfterDeduction = Math.max(0, userConnects - requiredConnects);

  return (
    <>
      {!hideTrigger && (
        <Button
          type="button"
          size="sm"
          disabled={loading}
          onClick={dialogOpen}
          className="gap-2"
        >
          <ConnectsIcon className="h-4 w-4 text-amber-500" />
          {loading ? 'Loading...' : buttonText}
        </Button>
      )}
      <Dialog open={openConfirm} onOpenChange={setOpenConfirm} modal={true}>
        <DialogPortal>
          <DialogOverlay
            style={{ zIndex: 9998, backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
            className="backdrop-blur-xs transition-opacity duration-200"
          />
          <DialogContent
            className="sm:max-w-md bg-card border border-border/60 shadow-2xl p-6 rounded-2xl overflow-hidden"
            style={{
              position: 'fixed',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              zIndex: 9999,
            }}
          >
            {isLowConnects ? (
              <div className="space-y-5">
                <div className="flex items-start gap-4">
                  <div className="h-12 w-12 rounded-2xl bg-destructive/10 border border-destructive/20 flex items-center justify-center text-destructive shrink-0 shadow-xs">
                    <AlertTriangle className="h-6 w-6" />
                  </div>
                  <div className="space-y-1 min-w-0">
                    <DialogTitle className="text-lg font-bold tracking-tight text-foreground">
                      Insufficient Connects Balance
                    </DialogTitle>
                    <DialogDescription className="text-xs text-muted-foreground leading-relaxed">
                      You need at least{' '}
                      <span className="font-semibold text-foreground">
                        {requiredConnects} connects
                      </span>{' '}
                      to create this {resourceName}.
                    </DialogDescription>
                  </div>
                </div>

                <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-4 space-y-3">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Your Platform Balance</span>
                    <span className="font-mono font-bold text-destructive">
                      {userConnects} connects
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground border-t border-border/20 pt-2.5">
                    <span>Required Amount</span>
                    <span className="font-mono font-bold text-foreground">
                      {requiredConnects} connects
                    </span>
                  </div>
                </div>

                <DialogFooter className="flex items-center gap-2 pt-1">
                  <Button
                    variant="outline"
                    onClick={() => setOpenConfirm(false)}
                    className="flex-1 h-10 rounded-xl"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={fetchMoreConnects}
                    className="flex-1 h-10 rounded-xl bg-primary text-primary-foreground font-semibold gap-2 shadow-sm"
                  >
                    <ConnectsIcon className="h-4 w-4" /> Request Connects
                  </Button>
                </DialogFooter>
              </div>
            ) : (
              <div className="space-y-5">
                <div className="flex items-start gap-4">
                  <div className="h-12 w-12 rounded-2xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-center text-amber-500 shrink-0 shadow-xs">
                    <ConnectsIcon className="h-6 w-6" />
                  </div>
                  <div className="space-y-1 min-w-0">
                    <DialogTitle className="text-lg font-bold tracking-tight text-foreground">
                      Confirm Connects Deduction
                    </DialogTitle>
                    <DialogDescription className="text-xs text-muted-foreground leading-relaxed">
                      Creating this{' '}
                      <span className="font-semibold text-foreground">
                        {resourceName}
                      </span>{' '}
                      will deduct connects from your platform balance.
                    </DialogDescription>
                  </div>
                </div>

                <div className="rounded-xl border border-border/60 bg-muted/30 p-4 space-y-3">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Available Balance</span>
                    <span className="font-mono font-medium text-foreground">
                      {userConnects} connects
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm font-semibold border-t border-b border-border/30 py-2.5">
                    <span className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400">
                      <ConnectsIcon className="h-4 w-4" /> Deduction Amount
                    </span>
                    <span className="font-mono text-base text-amber-600 dark:text-amber-400 font-bold">
                      -{requiredConnects}{' '}
                      <span className="text-xs font-normal font-sans">
                        connects
                      </span>
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Remaining After Approval</span>
                    <span className="font-mono font-medium text-foreground">
                      {remainingAfterDeduction} connects
                    </span>
                  </div>
                </div>

                <DialogFooter className="flex items-center gap-2 pt-1">
                  <Button
                    variant="outline"
                    onClick={() => setOpenConfirm(false)}
                    disabled={loading}
                    className="flex-1 h-10 rounded-xl"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleConfirm}
                    disabled={loading}
                    className="flex-1 h-10 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-semibold shadow-sm gap-2 transition-all"
                  >
                    {loading ? (
                      <>
                        <span className="w-4 h-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <ConnectsIcon className="h-4 w-4" /> Confirm & Create
                      </>
                    )}
                  </Button>
                </DialogFooter>
              </div>
            )}
          </DialogContent>
        </DialogPortal>
      </Dialog>
    </>
  );
}
