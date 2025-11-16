import React from 'react';

import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

type Props = {
  status: string;
  rejectionReason?: string;
};

const KycStatusAlert: React.FC<Props> = ({ status, rejectionReason }) => {
  const s = (status || '').toUpperCase();

  if (s === 'VERIFIED' || s === 'APPROVED' || s === 'SUCCESS') {
    return (
      <Alert className="mb-4 border-green-200 bg-green-50 text-green-800">
        <AlertTitle>KYC Accepted</AlertTitle>
        <AlertDescription>
          Your KYC has been successfully verified.
        </AlertDescription>
      </Alert>
    );
  }

  if (s === 'REJECTED' || s === 'FAILED') {
    return (
      <Alert variant="destructive" className="mb-4">
        <AlertTitle>KYC Rejected</AlertTitle>
        <AlertDescription>
          <p>
            Your KYC has been rejected. Please see the reason below and
            re-submit your application.
          </p>
          {rejectionReason && (
            <p className="mt-2">
              <strong>Reason:</strong> {rejectionReason}
            </p>
          )}
        </AlertDescription>
      </Alert>
    );
  }

  if (s === 'REUPLOAD') {
    return (
      <Alert className="mb-4 border-amber-200 bg-amber-50 text-amber-800">
        <AlertTitle>Re-upload Required</AlertTitle>
        <AlertDescription>
          <p>
            Your KYC requires additional documents. Please re-upload your
            documents.
          </p>
          {rejectionReason && (
            <p className="mt-2">
              <strong>Reason:</strong> {rejectionReason}
            </p>
          )}
        </AlertDescription>
      </Alert>
    );
  }

  if (s === 'APPLIED' || s === 'IN_REVIEW' || s === 'UNDER_REVIEW') {
    return (
      <Alert className="mb-4 border-blue-200 bg-blue-50 text-blue-800">
        <AlertTitle>KYC Applied</AlertTitle>
        <AlertDescription>
          You have applied for the KYC we will get back to you soon.
        </AlertDescription>
      </Alert>
    );
  }

  // Pending/Under review
  return (
    <Alert className="mb-4 border-yellow-200 bg-yellow-50 text-yellow-800">
      <AlertTitle>Not Applied</AlertTitle>
      <AlertDescription>
        <p>Please Complete the Mandatory KYC and earn reward.</p>
      </AlertDescription>
    </Alert>
  );
};

export default KycStatusAlert;
