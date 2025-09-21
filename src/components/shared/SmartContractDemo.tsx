'use client';

import React, { useState, useEffect } from 'react';
import {
  Wallet,
  Shield,
  Award,
  Coins,
  Users,
  CheckCircle,
  XCircle,
  Loader2,
  ExternalLink,
} from 'lucide-react';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { contractFunctions } from '@/lib/smartContract';
import { useToast } from '@/hooks/use-toast';

interface SmartContractDemoProps {
  className?: string;
}

const SmartContractDemo: React.FC<SmartContractDemoProps> = ({
  className = '',
}) => {
  const [walletAddress, setWalletAddress] = useState<string>('');
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [tokenBalance, setTokenBalance] = useState<string>('0');
  const [isRegistered, setIsRegistered] = useState<boolean>(false);
  const [escrowCounter, setEscrowCounter] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { toast } = useToast();

  // Test addresses for demo
  const [testFreelancerAddress, setTestFreelancerAddress] =
    useState<string>('');
  const [testEscrowAmount, setTestEscrowAmount] = useState<string>('');

  useEffect(() => {
    checkWalletConnection();
  }, []);

  const checkWalletConnection = async () => {
    if (typeof window !== 'undefined' && window.ethereum) {
      try {
        const accounts = await window.ethereum.request({
          method: 'eth_accounts',
        });
        if (accounts.length > 0) {
          setWalletAddress(accounts[0]);
          setIsConnected(true);
          await loadUserData(accounts[0]);
        }
      } catch (error) {
        console.error('Error checking wallet connection:', error);
      }
    }
  };

  const connectWallet = async () => {
    if (typeof window === 'undefined' || !window.ethereum) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Please install MetaMask to connect your wallet.',
      });
      return;
    }

    try {
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      });
      if (accounts.length > 0) {
        setWalletAddress(accounts[0]);
        setIsConnected(true);
        await loadUserData(accounts[0]);
      }
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to connect wallet. Please try again.',
      });
    }
  };

  const loadUserData = async (address: string) => {
    setIsLoading(true);
    try {
      const [registered, balance, counter] = await Promise.all([
        contractFunctions.isAddressRegistered(address),
        contractFunctions.getBalance(address),
        contractFunctions.getEscrowCounter(),
      ]);

      setIsRegistered(registered);
      setTokenBalance(balance);
      setEscrowCounter(Number(counter));
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClaimReward = async () => {
    if (!walletAddress) return;

    setIsLoading(true);
    try {
      await contractFunctions.reward(walletAddress);

      toast({
        title: 'Success!',
        description: '50 DXUT tokens have been claimed successfully!',
      });

      await loadUserData(walletAddress);
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description:
          error.message || 'Failed to claim reward. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateEscrow = async () => {
    if (!testFreelancerAddress || !testEscrowAmount) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Please enter both freelancer address and amount.',
      });
      return;
    }

    setIsLoading(true);
    try {
      await contractFunctions.createEscrow(
        testFreelancerAddress,
        testEscrowAmount,
      );

      toast({
        title: 'Success!',
        description: `Escrow created successfully with ${testEscrowAmount} AVAX.`,
      });

      await loadUserData(walletAddress);
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description:
          error.message || 'Failed to create escrow. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleMintInterviewNFT = async () => {
    if (!testFreelancerAddress) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Please enter a freelancer address.',
      });
      return;
    }

    setIsLoading(true);
    try {
      await contractFunctions.mintInterviewNFT(testFreelancerAddress);

      toast({
        title: 'Success!',
        description: 'Interview NFT minted successfully!',
      });
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Failed to mint NFT. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-2">
          DXUT Platform Smart Contract Demo
        </h2>
        <p className="text-gray-600">
          Test and interact with the DXUT Platform smart contract functionality
        </p>
      </div>

      {/* Wallet Connection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            Wallet Connection
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!isConnected ? (
            <Button onClick={connectWallet} className="w-full">
              Connect MetaMask Wallet
            </Button>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                <span className="text-sm font-medium text-green-800">
                  Connected: {formatAddress(walletAddress)}
                </span>
                <Badge
                  variant="secondary"
                  className="bg-green-100 text-green-800"
                >
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Connected
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <Coins className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-800">
                      Token Balance
                    </span>
                  </div>
                  <p className="text-lg font-bold text-blue-900">
                    {parseFloat(tokenBalance).toFixed(2)} DXUT
                  </p>
                </div>

                <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <Users className="w-4 h-4 text-purple-600" />
                    <span className="text-sm font-medium text-purple-800">
                      Registration
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {isRegistered ? (
                      <>
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span className="text-sm font-medium text-green-800">
                          Registered
                        </span>
                      </>
                    ) : (
                      <>
                        <XCircle className="w-4 h-4 text-red-600" />
                        <span className="text-sm font-medium text-red-800">
                          Not Registered
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {!isRegistered && (
                <Button
                  onClick={handleClaimReward}
                  disabled={isLoading}
                  className="w-full"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Claiming...
                    </>
                  ) : (
                    <>
                      <Coins className="mr-2 h-4 w-4" />
                      Claim 50 DXUT Welcome Reward
                    </>
                  )}
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Platform Statistics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Platform Statistics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="w-5 h-5 text-gray-600" />
                <span className="font-medium">Total Escrows</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {escrowCounter}
              </p>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Award className="w-5 h-5 text-gray-600" />
                <span className="font-medium">Platform Status</span>
              </div>
              <Badge
                variant="secondary"
                className="bg-green-100 text-green-800"
              >
                <CheckCircle className="w-3 h-3 mr-1" />
                Active
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Test Functions */}
      {isConnected && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ExternalLink className="h-5 w-5" />
              Test Contract Functions
            </CardTitle>
            <CardDescription>
              Test the smart contract functions with sample data
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="freelancer-address">
                  Test Freelancer Address
                </Label>
                <Input
                  id="freelancer-address"
                  placeholder="0x..."
                  value={testFreelancerAddress}
                  onChange={(e) => setTestFreelancerAddress(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="escrow-amount">Escrow Amount (AVAX)</Label>
                <Input
                  id="escrow-amount"
                  type="number"
                  step="0.001"
                  placeholder="0.1"
                  value={testEscrowAmount}
                  onChange={(e) => setTestEscrowAmount(e.target.value)}
                />
              </div>
            </div>

            <Separator />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button
                onClick={handleCreateEscrow}
                disabled={
                  isLoading || !testFreelancerAddress || !testEscrowAmount
                }
                variant="outline"
                className="h-auto p-4 flex flex-col items-center gap-2"
              >
                <Shield className="w-6 h-6" />
                <div className="text-center">
                  <div className="font-medium">Create Escrow</div>
                  <div className="text-xs text-gray-500">
                    Lock funds in escrow
                  </div>
                </div>
              </Button>

              <Button
                onClick={handleMintInterviewNFT}
                disabled={isLoading || !testFreelancerAddress}
                variant="outline"
                className="h-auto p-4 flex flex-col items-center gap-2"
              >
                <Award className="w-6 h-6" />
                <div className="text-center">
                  <div className="font-medium">Mint Interview NFT</div>
                  <div className="text-xs text-gray-500">
                    Award interview completion
                  </div>
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SmartContractDemo;
