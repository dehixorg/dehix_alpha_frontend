'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface TermsDialogProps {
  open: boolean;
  setOpen: (value: boolean) => void;
}

export default function TermsDialog({ open, setOpen }: TermsDialogProps) {
  const handleAccept = () => {
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-5xl sm:mx-4 max-h-screen overflow-y-auto rounded-2xl p-6 shadow-lg">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold  mb-4 text-center">
            Terms & Conditions for Freelancer
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 text-sm  leading-relaxed px-2 sm:px-4">
          <div>
            <h3 className="font-semibold text-base mb-1">
              1. Registration and Account Management
            </h3>
            <p>
              By registering as a freelancer or client on the platform, users
              agree to abide by these terms and conditions. Users must provide
              accurate, complete, and up-to-date information during the
              registration process. Failure to do so may result in account
              suspension or termination. The platform reserves the right to
              approve, reject, or terminate user accounts at its sole
              discretion.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-base mb-1">
              2. KYC Verification
            </h3>
            <p>
              All users are required to undergo KYC (Know Your Customer)
              verification to validate their profiles. Providing false or
              misleading information or documents during the KYC process may
              result in immediate account termination.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-base mb-1">
              3. Platform Responsibilities
            </h3>
            <p>
              The platform acts as an intermediary connecting freelancers with
              potential clients. While the platform facilitates this connection,
              it does not guarantee job opportunities, successful contracts, or
              project outcomes. The platform is not liable for disputes,
              incomplete projects, or any issues arising from freelancer-client
              engagements.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-base mb-1">4. User Conduct</h3>
            <p>
              Users are strictly prohibited from posting fraudulent job offers
              or misleading information. Spam, offensive language, and abusive
              behavior are not tolerated in any communications conducted through
              the platform. Violation of this rule may result in account
              suspension or termination.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-base mb-1">
              5. Data Sharing and Privacy
            </h3>
            <p>
              By registering on the platform, users consent to sharing their
              contact details and profile information with clients seeking
              talent. The platform ensures that user data is shared only with
              verified clients for legitimate hiring purposes.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-base mb-1">
              6. Termination of Accounts
            </h3>
            <p>
              Accounts may be terminated if users violate platform rules,
              provide false information, or fail to comply with KYC
              verification. The platform reserves the right to investigate and
              take appropriate action if fraudulent or suspicious activities are
              detected.
            </p>
          </div>

          <div>
            <p>
              By using this platform, all users acknowledge and agree to these
              terms and conditions. The platform reserves the right to modify
              these terms at any time with prior notice to users.
            </p>
          </div>
        </div>

        <div className="mt-8 flex justify-end">
          <Button
            onClick={handleAccept}
            className="px-6 py-2 text-sm font-medium rounded-md bg-primary  hover:bg-primary/90 transition"
          >
            I Accept
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
