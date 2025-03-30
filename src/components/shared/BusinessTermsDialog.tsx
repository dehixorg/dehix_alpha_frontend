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
  setIsChecked: any
}

export default function TermsDialog({ open, setOpen, setIsChecked }: TermsDialogProps) {
  const handleAccept = () => {
    setIsChecked(true);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-5xl sm:mx-4 max-h-screen overflow-y-auto rounded-2xl p-6 shadow-lg">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold mb-4 text-center">
            Terms & Conditions for Businesses/Clients
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 text-sm leading-relaxed px-2 sm:px-4">
          <div>
            <h3 className="font-semibold text-base mb-1">
              1. Registration and Account Management
            </h3>
            <p>
              By registering as a business or client on the platform, users
              agree to abide by these terms and conditions. Businesses must
              provide accurate, complete, and up-to-date company information
              during registration. Failure to provide correct details may result
              in account rejection or termination. The platform reserves the
              right to approve, reject, or terminate business accounts at its
              sole discretion.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-base mb-1">
              2. Responsibilities of Businesses
            </h3>
            <p>
              Businesses are responsible for carefully reviewing freelancer
              profiles, portfolios, and qualifications before making hiring
              decisions. The platform does not vet or guarantee the performance
              of freelancers. Businesses acknowledge that freelancers are
              independent contractors and not employees of the platform.
              Therefore, the platform holds no liability for disputes regarding
              employment status, wages, or project outcomes. Businesses must
              comply with local labor laws when engaging freelancers through the
              platform.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-base mb-1">
              3. Platform Limitations
            </h3>
            <p>
              The platform acts solely as a connection facilitator between
              freelancers and businesses. It does not provide job guarantees or
              ensure the quality of work delivered. The platform is not
              responsible for delays, missed deadlines, incomplete work, or
              disputes between businesses and freelancers.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-base mb-1">
              4. Payment Policies
            </h3>
            <p>
              Direct payments to freelancers outside the platform are strictly
              prohibited. All payments must be processed through the platform to
              ensure security, accountability, and dispute resolution. Upon
              successful payment, businesses retain full rights to
              freelancer-created content or work unless otherwise agreed in
              writing.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-base mb-1">
              5. Job Posting Guidelines
            </h3>
            <p>
              Businesses are prohibited from posting scam jobs, misleading job
              descriptions, or any job listings that promote illegal or
              unethical activities. The platform reserves the right to review,
              modify, or remove job postings that violate these guidelines.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-base mb-1">
              6. Communication and Conduct
            </h3>
            <p>
              Businesses must maintain professional, respectful, and
              non-offensive communication when interacting with freelancers or
              platform representatives. Spam, harassment, or abusive behavior
              will result in account suspension or termination.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-base mb-1">
              7. Liability and Disputes
            </h3>
            <p>
              The platform is not liable for freelancer performance or quality
              of work, missed deadlines or incomplete deliverables, or financial
              losses incurred by businesses due to freelancer engagements.
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
              User information may be utilized to improve platform functionality
              and matchmaking, assist in effective communication between clients
              and freelancers, and support marketing campaigns, promotions, or
              platform updates (with the option to manage notification
              preferences).
            </p>
          </div>
        </div>

        <div className="mt-8 flex justify-end">
          <Button
            onClick={handleAccept}
            className="px-6 py-2 text-sm font-medium rounded-md bg-primary hover:bg-primary/90 transition"
          >
            I Accept
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
