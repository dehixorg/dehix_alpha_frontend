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
                  Review terms before you continue
                </p>
              </div>
            </div>
            <p className="mt-4 text-sm text-muted-foreground leading-relaxed">
              This helps keep the marketplace safe and transparent. You’ll need
              to scroll to the end before accepting.
            </p>
            <div className="mt-6 rounded-xl border bg-background/60 p-4">
              <p className="text-sm font-medium">Tip</p>
              <p className="mt-1 text-xs text-muted-foreground">
                You can close this dialog and come back anytime.
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
                    Terms & Conditions for Freelancer
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
                      By registering as a freelancer or client on the platform,
                      users agree to abide by these terms and conditions. Users
                      must provide accurate, complete, and up-to-date
                      information during the registration process. Failure to do
                      so may result in account suspension or termination. The
                      platform reserves the right to approve, reject, or
                      terminate user accounts at its sole discretion.
                    </p>
                  </div>

                  <div>
                    <h3 className="font-semibold text-base mb-1">
                      2. KYC Verification
                    </h3>
                    <p>
                      All users are required to undergo KYC (Know Your Customer)
                      verification to validate their profiles. Providing false
                      or misleading information or documents during the KYC
                      process may result in immediate account termination.
                    </p>
                  </div>

                  <div>
                    <h3 className="font-semibold text-base mb-1">
                      3. Platform Responsibilities
                    </h3>
                    <p>
                      The platform acts as an intermediary connecting
                      freelancers with potential clients. While the platform
                      facilitates this connection, it does not guarantee job
                      opportunities, successful contracts, or project outcomes.
                      The platform is not liable for disputes, incomplete
                      projects, or any issues arising from freelancer-client
                      engagements.
                    </p>
                  </div>

                  <div>
                    <h3 className="font-semibold text-base mb-1">
                      4. User Conduct
                    </h3>
                    <p>
                      Users are strictly prohibited from posting fraudulent job
                      offers or misleading information. Spam, offensive
                      language, and abusive behavior are not tolerated in any
                      communications conducted through the platform. Violation
                      of this rule may result in account suspension or
                      termination.
                    </p>
                  </div>

                  <div>
                    <h3 className="font-semibold text-base mb-1">
                      5. Data Sharing and Privacy
                    </h3>
                    <p>
                      By registering on the platform, users consent to sharing
                      their contact details and profile information with clients
                      seeking talent. The platform ensures that user data is
                      shared only with verified clients for legitimate hiring
                      purposes.
                    </p>
                  </div>

                  <div>
                    <h3 className="font-semibold text-base mb-1">
                      6. Termination of Accounts
                    </h3>
                    <p>
                      Accounts may be terminated if users violate platform
                      rules, provide false information, or fail to comply with
                      KYC verification. The platform reserves the right to
                      investigate and take appropriate action if fraudulent or
                      suspicious activities are detected.
                    </p>
                  </div>

                  <div>
                    <p>
                      By using this platform, all users acknowledge and agree to
                      these terms and conditions. The platform reserves the
                      right to modify these terms at any time with prior notice
                      to users.
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
