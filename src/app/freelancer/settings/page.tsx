'use client';

import { useAccount, usePublicClient } from 'wagmi';
import React, { useEffect, useState } from 'react';

import SBTIcon from '@/components/ui/SBTIcon';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

// Replace with your actual contract address and ABI
const SBT_CONTRACT_ADDRESS = '0x1f4f15125640b683ba4339b8d0f3993E3ca86B9f';
const SBT_ABI = [
  // Minimal ABI for ERC721-like tokens
  'function balanceOf(address owner) view returns (uint256)',
  'function tokenOfOwnerByIndex(address owner, uint256 index) view returns (uint256)',
  'function tokenURI(uint256 tokenId) view returns (string)',
  'event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)',
];

const SBTSection: React.FC = () => {
  const { address, isConnected } = useAccount();
  const publicClient = usePublicClient();
  const [tokens, setTokens] = useState<{ tokenId: string; txHash: string }[]>(
    [],
  );
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchSBTs = async () => {
      if (!address || !publicClient) return;
      setLoading(true);
      try {
        // Get the number of SBTs owned
        const balance = BigInt(
          (await publicClient.readContract({
            address: SBT_CONTRACT_ADDRESS as `0x${string}`,
            abi: SBT_ABI,
            functionName: 'balanceOf',
            args: [address],
          })) as any,
        );
        const sbts: { tokenId: string; txHash: string }[] = [];
        for (let i = 0n; i < balance; i++) {
          // Get tokenId by index
          const tokenId = BigInt(
            (await publicClient.readContract({
              address: SBT_CONTRACT_ADDRESS as `0x${string}`,
              abi: SBT_ABI,
              functionName: 'tokenOfOwnerByIndex',
              args: [address, i],
            })) as any,
          );
          // Find mint transaction hash (optional, requires event scan)
          // For demo, just show tokenId
          sbts.push({ tokenId: tokenId.toString(), txHash: '' });
        }
        setTokens(sbts);
      } catch (err) {
        console.error('Error fetching SBTs:', err);
        setTokens([]);
      }
      setLoading(false);
    };
    fetchSBTs();
  }, [address, publicClient]);

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold mb-2">Freelancer Settings</h1>
          <p className="text-muted-foreground">
            Manage your SBT certificates and profile settings
          </p>
        </div>

        {/* Connection Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div
                className={`h-3 w-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}
              ></div>
              Wallet Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isConnected ? (
              <div className="space-y-2">
                <p className="text-sm text-green-600 font-medium">
                  ✅ Wallet Connected
                </p>
                <p className="text-sm text-muted-foreground">
                  Address:{' '}
                  <span className="font-mono font-semibold">
                    {address?.slice(0, 6)}...{address?.slice(-4)}
                  </span>
                </p>
              </div>
            ) : (
              <p className="text-sm text-red-600 font-medium">
                ❌ Wallet Not Connected
              </p>
            )}
          </CardContent>
        </Card>

        {/* SBT Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <SBTIcon className="h-6 w-6" />
              Minted SBTs
            </CardTitle>
            <CardDescription>
              Your Soul Bound Tokens (SBTs) certifying your freelancer
              credentials
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!isConnected ? (
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">
                  Please connect your wallet to view your minted SBTs.
                </p>
              </div>
            ) : loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin">
                  <SBTIcon className="h-8 w-8 text-primary" />
                </div>
                <span className="ml-3 text-muted-foreground">
                  Loading SBTs...
                </span>
              </div>
            ) : tokens.length === 0 ? (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  No SBTs minted yet. Complete projects or education to earn
                  SBTs.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {tokens.map((token) => (
                  <div
                    key={token.tokenId}
                    className="p-4 border rounded-lg hover:bg-accent transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-2">
                          <Badge variant="default">
                            Token #{token.tokenId}
                          </Badge>
                          <Badge variant="secondary">SBT Certificate</Badge>
                        </div>
                        {token.txHash && (
                          <a
                            href={`https://amoy.polygonscan.com/tx/${token.txHash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-blue-600 hover:underline"
                          >
                            View on PolygonScan →
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Stats Card */}
        {tokens.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Your SBT Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">Total SBTs</p>
                  <p className="text-2xl font-bold">{tokens.length}</p>
                </div>
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">Last Token ID</p>
                  <p className="text-2xl font-bold">
                    #{tokens[tokens.length - 1].tokenId}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

/**
 * Page wrapper for the freelancer settings
 * This ensures the component is rendered as a proper Next.js page
 */
const SettingsPage = () => {
  return <SBTSection />;
};

export default SettingsPage;
