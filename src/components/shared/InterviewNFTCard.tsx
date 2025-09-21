'use client';

import React, { useState } from 'react';
import { Loader2, Award, UserCheck } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { contractFunctions } from '@/lib/smartContract';
import { useToast } from '@/hooks/use-toast';

interface InterviewNFTCardProps {
  freelancerAddress: string;
  freelancerName?: string;
  className?: string;
}

const InterviewNFTCard: React.FC<InterviewNFTCardProps> = ({
  freelancerAddress,
  freelancerName,
  className = '',
}) => {
  const [isMinting, setIsMinting] = useState<boolean>(false);
  const [isRegistered, setIsRegistered] = useState<boolean>(false);
  const { toast } = useToast();

  const handleMintInterviewNFT = async () => {
    setIsMinting(true);
    try {
      const tx = await contractFunctions.mintInterviewNFT(freelancerAddress);

      toast({
        title: 'Success!',
        description: 'Interview NFT minted successfully to freelancer.',
      });

      setIsRegistered(true);
    } catch (error: any) {
      console.error('Error minting interview NFT:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description:
          error.message || 'Failed to mint interview NFT. Please try again.',
      });
    } finally {
      setIsMinting(false);
    }
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Award className="h-5 w-5" />
          Interview NFT
        </CardTitle>
        <CardDescription>
          Mint an interview NFT to recognize freelancer participation
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-4 bg-gray-50 rounded-lg">
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Freelancer:</span>
              <span className="font-mono">
                {freelancerName || formatAddress(freelancerAddress)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Address:</span>
              <span className="font-mono text-xs">
                {formatAddress(freelancerAddress)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Status:</span>
              <span
                className={`font-semibold ${isRegistered ? 'text-green-600' : 'text-yellow-600'}`}
              >
                {isRegistered ? 'NFT Minted' : 'Pending'}
              </span>
            </div>
          </div>
        </div>

        <Button
          onClick={handleMintInterviewNFT}
          disabled={isMinting || isRegistered}
          className="w-full"
          variant={isRegistered ? 'outline' : 'default'}
        >
          {isMinting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Minting NFT...
            </>
          ) : isRegistered ? (
            <>
              <UserCheck className="mr-2 h-4 w-4" />
              NFT Already Minted
            </>
          ) : (
            <>
              <Award className="mr-2 h-4 w-4" />
              Mint Interview NFT
            </>
          )}
        </Button>

        {isRegistered && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm text-green-800">
              ✅ Interview NFT has been successfully minted to the
              freelancer&aposs wallet.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default InterviewNFTCard;
