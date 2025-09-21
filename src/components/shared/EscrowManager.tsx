'use client';

import React, { useState } from 'react';
import { Loader2, Wallet, Shield, ArrowUpDown } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { contractFunctions } from '@/lib/smartContract';
import { useToast } from '@/hooks/use-toast';

interface EscrowManagerProps {
  freelancerAddress: string;
  projectId?: string;
  className?: string;
}

interface EscrowInfo {
  client: string;
  freelancer: string;
  amount: string;
  released: boolean;
}

const EscrowManager: React.FC<EscrowManagerProps> = ({
  freelancerAddress,
  projectId,
  className = '',
}) => {
  const [amount, setAmount] = useState<string>('');
  const [isCreating, setIsCreating] = useState<boolean>(false);
  const [escrowId, setEscrowId] = useState<number | null>(null);
  const [escrowInfo, setEscrowInfo] = useState<EscrowInfo | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { toast } = useToast();

  const handleCreateEscrow = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      toast({
        variant: 'destructive',
        title: 'Invalid Amount',
        description: 'Please enter a valid amount greater than 0.',
      });
      return;
    }

    setIsCreating(true);
    try {
      const tx = await contractFunctions.createEscrow(
        freelancerAddress,
        amount,
      );

      // Get the escrow counter to determine the new escrow ID
      const counter = await contractFunctions.getEscrowCounter();
      setEscrowId(Number(counter));

      toast({
        title: 'Success!',
        description: `Escrow created successfully with ${amount} AVAX.`,
      });

      // Load escrow info
      await loadEscrowInfo(Number(counter));
    } catch (error: any) {
      console.error('Error creating escrow:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description:
          error.message || 'Failed to create escrow. Please try again.',
      });
    } finally {
      setIsCreating(false);
    }
  };

  const loadEscrowInfo = async (id: number) => {
    setIsLoading(true);
    try {
      const escrow = await contractFunctions.getEscrow(id);
      setEscrowInfo({
        client: escrow.client,
        freelancer: escrow.freelancer,
        amount: escrow.amount.toString(),
        released: escrow.released,
      });
    } catch (error) {
      console.error('Error loading escrow info:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReleaseEscrow = async () => {
    if (!escrowId) return;

    setIsLoading(true);
    try {
      const tx = await contractFunctions.releaseEscrow(escrowId);

      toast({
        title: 'Success!',
        description: 'Escrow released successfully to freelancer.',
      });

      // Refresh escrow info
      await loadEscrowInfo(escrowId);
    } catch (error: any) {
      console.error('Error releasing escrow:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description:
          error.message || 'Failed to release escrow. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefundClient = async () => {
    if (!escrowId) return;

    setIsLoading(true);
    try {
      const tx = await contractFunctions.refundClient(escrowId);

      toast({
        title: 'Success!',
        description: 'Escrow refunded successfully to client.',
      });

      // Refresh escrow info
      await loadEscrowInfo(escrowId);
    } catch (error: any) {
      console.error('Error refunding client:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description:
          error.message || 'Failed to refund client. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatAmount = (amount: string) => {
    const ethers = parseFloat(amount) / 1e18;
    return ethers.toFixed(4);
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Escrow Management
          </CardTitle>
          <CardDescription>
            Create and manage escrow payments for secure transactions
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!escrowId ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="amount">Amount (AVAX)</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.001"
                  placeholder="0.0"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="freelancer">Freelancer Address</Label>
                <Input
                  id="freelancer"
                  value={freelancerAddress}
                  disabled
                  className="font-mono text-sm"
                />
              </div>
              <Button
                onClick={handleCreateEscrow}
                disabled={isCreating || !amount}
                className="w-full"
              >
                {isCreating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating Escrow...
                  </>
                ) : (
                  <>
                    <Shield className="mr-2 h-4 w-4" />
                    Create Escrow
                  </>
                )}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold mb-2">Escrow Details</h3>
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Loading escrow information...
                  </div>
                ) : escrowInfo ? (
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Escrow ID:</span>
                      <span className="font-mono">#{escrowId}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Client:</span>
                      <span className="font-mono">
                        {formatAddress(escrowInfo.client)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Freelancer:</span>
                      <span className="font-mono">
                        {formatAddress(escrowInfo.freelancer)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Amount:</span>
                      <span className="font-semibold">
                        {formatAmount(escrowInfo.amount)} AVAX
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Status:</span>
                      <span
                        className={`font-semibold ${escrowInfo.released ? 'text-green-600' : 'text-yellow-600'}`}
                      >
                        {escrowInfo.released ? 'Released' : 'Active'}
                      </span>
                    </div>
                  </div>
                ) : null}
              </div>

              {escrowInfo && !escrowInfo.released && (
                <div className="flex gap-2">
                  <Button
                    onClick={handleReleaseEscrow}
                    disabled={isLoading}
                    variant="default"
                    className="flex-1"
                  >
                    {isLoading ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <ArrowUpDown className="mr-2 h-4 w-4" />
                    )}
                    Release to Freelancer
                  </Button>
                  <Button
                    onClick={handleRefundClient}
                    disabled={isLoading}
                    variant="outline"
                    className="flex-1"
                  >
                    {isLoading ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Wallet className="mr-2 h-4 w-4" />
                    )}
                    Refund Client
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default EscrowManager;
