'use client';

import React, { useState, useEffect } from 'react';
import { Wallet } from 'lucide-react';

// Extend the Window interface to include ethereum
declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string }) => Promise<any>;
      on: (event: string, callback: (...args: any[]) => void) => void;
      removeListener: (event: string, callback: (...args: any[]) => void) => void;
    };
  }
}

interface WalletConnectButtonProps {
  className?: string;
}

const WalletConnectButton: React.FC<WalletConnectButtonProps> = ({ className = '' }) => {
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [walletAddress, setWalletAddress] = useState<string>('');
  const [isConnecting, setIsConnecting] = useState<boolean>(false);
  const [showRewardPopup, setShowRewardPopup] = useState<boolean>(false);
  const [isClaiming, setIsClaiming] = useState<boolean>(false);

  // Check if wallet is already connected on mount
  useEffect(() => {
    checkWalletConnection();
  }, []);

  const checkWalletConnection = async (): Promise<void> => {
    if (typeof window !== 'undefined' && window.ethereum) {
      try {
        const accounts: string[] = await window.ethereum.request({ method: 'eth_accounts' });
        if (accounts.length > 0) {
          setWalletAddress(accounts[0]);
          setIsConnected(true);
        }
      } catch (error) {
        console.error('Error checking wallet connection:', error);
      }
    }
  };

  const connectWallet = async (): Promise<void> => {
    if (typeof window === 'undefined' || !window.ethereum) {
      alert('Please install MetaMask or another Web3 wallet to connect.');
      return;
    }

    setIsConnecting(true);
    try {
      const accounts: string[] = await window.ethereum.request({ method: 'eth_requestAccounts' });
      if (accounts.length > 0) {
        setWalletAddress(accounts[0]);
        setIsConnected(true);
        setShowRewardPopup(true);
      }
    } catch (error: any) {
      console.error('Error connecting wallet:', error);
      if (error.code === 4001) {
        alert('Please connect your wallet to continue.');
      } else {
        alert('Failed to connect wallet. Please try again.');
      }
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectWallet = (): void => {
    setIsConnected(false);
    setWalletAddress('');
    setShowRewardPopup(false);
  };

  const handleClaimTokens = async (): Promise<void> => {
    setIsClaiming(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000)); // simulate delay
      console.log('Tokens claimed successfully!');
      setShowRewardPopup(false);
    } catch (error) {
      console.error('Error claiming tokens:', error);
    } finally {
      setIsClaiming(false);
    }
  };

  const truncateAddress = (address: string): string => {
    return address ? `${address.slice(0, 6)}...${address.slice(-4)}` : '';
  };

  // Listen for account changes
  useEffect(() => {
    if (typeof window !== 'undefined' && window.ethereum) {
      const handleAccountsChanged = (accounts: string[]): void => {
        if (accounts.length === 0) {
          setIsConnected(false);
          setWalletAddress('');
        } else {
          setWalletAddress(accounts[0]);
          setIsConnected(true);
        }
      };

      window.ethereum.on('accountsChanged', handleAccountsChanged);

      return () => {
        window.ethereum?.removeListener('accountsChanged', handleAccountsChanged);
      };
    }
  }, []);

  if (isConnected) {
    return (
      <>
        <div className={`flex items-center gap-2 ${className}`}>
          <div className="flex items-center bg-green-100 text-green-800 px-3 py-2 rounded-lg border border-green-200">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
            <span className="text-sm font-medium">
              {truncateAddress(walletAddress)}
            </span>
          </div>
          <button
            onClick={disconnectWallet}
            className="text-sm text-gray-500 hover:text-gray-700 px-2 py-1 rounded transition-colors"
          >
            Disconnect
          </button>
        </div>

        {/* Reward Popup */}
        {showRewardPopup && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-sm mx-4 shadow-xl">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Wallet size={32} className="text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Welcome Reward!
                </h3>
                <p className="text-gray-600 mb-6">
                  As a new user you are rewarded{' '}
                  <span className="font-bold text-blue-600">50 DXUT</span> tokens
                </p>
                <div className="space-y-3">
                  <button
                    onClick={handleClaimTokens}
                    disabled={isClaiming}
                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-4 py-2 rounded-lg transition-colors font-medium flex items-center justify-center gap-2"
                  >
                    {isClaiming ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Claiming...
                      </>
                    ) : (
                      'Claim Tokens'
                    )}
                  </button>
                  <button
                    onClick={() => setShowRewardPopup(false)}
                    className="w-full text-gray-500 hover:text-gray-700 px-4 py-2 rounded-lg transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  return (
    <button
      onClick={connectWallet}
      disabled={isConnecting}
      className={`flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-4 py-2 rounded-lg transition-colors font-medium ${className}`}
    >
      <Wallet size={18} />
      {isConnecting ? (
        <span className="flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          Connecting...
        </span>
      ) : (
        'Connect Wallet'
      )}
    </button>
  );
};

export default WalletConnectButton;
