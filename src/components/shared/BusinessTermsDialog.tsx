'use client';

import { ShieldCheck } from 'lucide-react';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

interface TermsDialogProps {
  open: boolean;
  setOpen: (value: boolean) => void;
  setIsChecked: any;
}

export default function TermsDialog({
  open,
  setOpen,
  setIsChecked,
}: TermsDialogProps) {
  const handleAccept = () => {
    setIsChecked(true);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-5xl sm:mx-4 max-h-[90vh] rounded-2xl p-0 overflow-hidden">
        <div className="grid lg:grid-cols-5">
          <aside className="hidden lg:block lg:col-span-2 border-r bg-gradient-to-b from-primary/10 via-background to-background p-6">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-xl border bg-primary/5">
                <ShieldCheck className="h-5 w-5 text-primary" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Consent
                </p>
                <p className="mt-1 text-lg font-semibold">
                  Terms for businesses & clients
                </p>
              </div>
            </div>
            <p className="mt-4 text-sm text-muted-foreground leading-relaxed">
              These terms help ensure safe hiring, fair communication, and
              trusted payments on the platform.
            </p>
            <div className="mt-6 rounded-xl border bg-background/60 p-4">
              <p className="text-sm font-medium">Tip</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Keep payments on-platform for better security and dispute
                support.
              </p>
            </div>
          </aside>

          <div className="lg:col-span-3">
            <DialogHeader>
              <div className="flex items-start gap-3 p-6 pb-0">
                <div className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-xl border bg-primary/5 lg:hidden">
                  <ShieldCheck className="h-5 w-5 text-primary" />
                </div>
                <div className="min-w-0">
                  <DialogTitle className="text-xl sm:text-2xl font-bold">
                    Terms & Conditions for Businesses/Clients
                  </DialogTitle>
                  <DialogDescription className="mt-1">
                    Please review these terms carefully before accepting.
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>

            <div className="px-6 mb-4">
              <ScrollArea className="mt-6 h-[50vh] sm:h-[56vh] rounded-xl border card">
                <div className="space-y-6 text-sm leading-relaxed p-4 sm:p-6">
                  <div>
                    <h3 className="font-semibold text-base mb-1">
                      1. Registration and Account Management
                    </h3>
                    <p>
                      By registering as a business or client on the platform,
                      users agree to abide by these terms and conditions.
                      Businesses must provide accurate, complete, and up-to-date
                      company information during registration. Failure to
                      provide correct details may result in account rejection or
                      termination. The platform reserves the right to approve,
                      reject, or terminate business accounts at its sole
                      discretion.
                    </p>
                  </div>

                  <div>
                    <h3 className="font-semibold text-base mb-1">
                      2. Responsibilities of Businesses
                    </h3>
                    <p>
                      Businesses are responsible for carefully reviewing
                      freelancer profiles, portfolios, and qualifications before
                      making hiring decisions. The platform does not vet or
                      guarantee the performance of freelancers. Businesses
                      acknowledge that freelancers are independent contractors
                      and not employees of the platform. Therefore, the platform
                      holds no liability for disputes regarding employment
                      status, wages, or project outcomes. Businesses must comply
                      with local labor laws when engaging freelancers through
                      the platform.
                    </p>
                  </div>

                  <div>
                    <h3 className="font-semibold text-base mb-1">
                      3. Platform Limitations
                    </h3>
                    <p>
                      The platform acts solely as a connection facilitator
                      between freelancers and businesses. It does not provide
                      job guarantees or ensure the quality of work delivered.
                      The platform is not responsible for delays, missed
                      deadlines, incomplete work, or disputes between businesses
                      and freelancers.
                    </p>
                  </div>

                  <div>
                    <h3 className="font-semibold text-base mb-1">
                      4. Payment Policies
                    </h3>
                    <p>
                      Direct payments to freelancers outside the platform are
                      strictly prohibited. All payments must be processed
                      through the platform to ensure security, accountability,
                      and dispute resolution. Upon successful payment,
                      businesses retain full rights to freelancer-created
                      content or work unless otherwise agreed in writing.
                    </p>
                  </div>

                  <div>
                    <h3 className="font-semibold text-base mb-1">
                      5. Job Posting Guidelines
                    </h3>
                    <p>
                      Businesses are prohibited from posting scam jobs,
                      misleading job descriptions, or any job listings that
                      promote illegal or unethical activities. The platform
                      reserves the right to review, modify, or remove job
                      postings that violate these guidelines.
                    </p>
                  </div>

                  <div>
                    <h3 className="font-semibold text-base mb-1">
                      6. Communication and Conduct
                    </h3>
                    <p>
                      Businesses must maintain professional, respectful, and
                      non-offensive communication when interacting with
                      freelancers or platform representatives. Spam, harassment,
                      or abusive behavior will result in account suspension or
                      termination.
                    </p>
                  </div>

                  <div>
                    <h3 className="font-semibold text-base mb-1">
                      7. Liability and Disputes
                    </h3>
                    <p>
                      The platform is not liable for freelancer performance or
                      quality of work, missed deadlines or incomplete
                      deliverables, or financial losses incurred by businesses
                      due to freelancer engagements.
                    </p>
                  </div>

                  <div>
                    <h3 className="font-semibold text-base mb-1">
                      8. Account Termination
                    </h3>
                    <p>
                      Accounts may be terminated if businesses provide false or
                      misleading information, attempt to bypass platform payment
                      processes, post scam or illegal job offers, or violate
                      communication guidelines or engage in unethical conduct.
                    </p>
                  </div>

                  <div>
                    <h3 className="font-semibold text-base mb-1">
                      9. Use of User Information
                    </h3>
                    <p>
                      User information may be utilized to improve platform
                      functionality and matchmaking, assist in effective
                      communication between clients and freelancers, and support
                      marketing campaigns, promotions, or platform updates (with
                      the option to manage notification preferences).
                    </p>
                  </div>
                </div>
              </ScrollArea>
            </div>

            <DialogFooter className="px-6 py-4 border-t bg-background/80">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button type="button" onClick={handleAccept}>
                I Accept
              </Button>
            </DialogFooter>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
