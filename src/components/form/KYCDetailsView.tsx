import React from 'react';
import Image from 'next/image';

import { Card } from '../ui/card';
import { Separator } from '../ui/separator';

interface KYCDetailsViewProps {
  kycData: {
    documentId?: string;
    income?: number;
    frontImageUrl?: string;
    backImageUrl?: string;
    liveCaptureUrl?: string;
  };
}

const KYCDetailsView: React.FC<KYCDetailsViewProps> = ({ kycData }) => {
  return (
    <Card className="p-6 md:p-8 shadow-lg relative rounded-xl w-full max-w-6xl mx-auto">
      <div className="space-y-4 text-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-muted-foreground">Document ID</p>
            <p className="font-medium break-words">
              {kycData.documentId || '-'}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground">Annual Income/Profit</p>
            <p className="font-medium">{kycData.income || '-'}</p>
          </div>
        </div>
        <Separator />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-2">
          <div>
            <p className="text-muted-foreground mb-2">Front Image</p>
            {kycData.frontImageUrl ? (
              <Image
                src={kycData.frontImageUrl}
                alt="Front Document"
                width={280}
                height={180}
                className="rounded-lg object-contain border shadow-sm"
              />
            ) : (
              <p className="text-xs text-muted-foreground mt-1">
                No front image
              </p>
            )}
          </div>
          <div>
            <p className="text-muted-foreground mb-2">Back Image</p>
            {kycData.backImageUrl ? (
              <Image
                src={kycData.backImageUrl}
                alt="Back Document"
                width={280}
                height={180}
                className="rounded-lg object-contain border shadow-sm"
              />
            ) : (
              <p className="text-xs text-muted-foreground mt-1">
                No back image
              </p>
            )}
          </div>
          <div>
            <p className="text-muted-foreground">Selfie</p>
            {kycData.liveCaptureUrl ? (
              <div className="mt-1 inline-block border rounded-lg">
                <Image
                  src={kycData.liveCaptureUrl}
                  alt="Selfie"
                  width={180}
                  height={180}
                  className="rounded-md object-cover"
                />
              </div>
            ) : (
              <p className="text-xs text-muted-foreground mt-1">
                No selfie provided
              </p>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};

export default KYCDetailsView;
